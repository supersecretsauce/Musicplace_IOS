import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import React, {useState, useEffect, useRef, useMemo, useCallback} from 'react';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {firebase} from '@react-native-firebase/firestore';
import Colors from '../assets/utilities/Colors';
import Spotify from '../assets/img/spotify.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HapticFeedback from 'react-native-haptic-feedback';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

const BottomSheet = React.memo(props => {
  const caption = props.captionProps;
  const songID = props.songIDProps;
  const navigation = props.navigationProps;
  const [UID, setUID] = useState();
  const [displayName, setDisplayName] = useState();
  const [profilePicURL, setProfilePicURL] = useState();
  const [inputTop, setInputTop] = useState(false);
  const [commentText, setCommentText] = useState();
  const [activeLikedComments, setActiveLikedComments] = useState([]);
  const [likeChanged, setLikedChanged] = useState(false);
  const [myComment, setMyComment] = useState(false);
  const [bottomSheetSmall, setBottomSheetSmall] = useState(false);
  const [commentID, setCommentID] = useState();
  const inputRef = useRef();
  const replyUsernameRef = useRef();
  const [replyUsername, setReplyUsername] = useState();
  const [replyActive, setReplyActive] = useState(false);
  const [replyID, setReplyID] = useState();
  const [parentReplies, setParentReplies] = useState();
  const [viewReplies, setViewReplies] = useState(false);
  const [containerUp, setContainerUp] = useState(false);
  const translateY = useSharedValue(0);
  const [parentComments, setParentComments] = useState();
  const [keyboardSpacing, setKeyboardSpacing] = useState();

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      e => {
        console.log('yes');
        console.log(e.endCoordinates.height);
        console.log(Dimensions.get('window').height);
        setKeyboardSpacing(
          Dimensions.get('window').height - e.endCoordinates.height,
        );
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        console.log('no');
        console.log(Dimensions.get('window').height);
      },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);
  const context = useSharedValue({y: 0});
  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = {y: translateY.value};
    })
    .onUpdate(event => {
      translateY.value = event.translationY + context.value.y;
      translateY.value = Math.max(translateY.value, -269);
    })
    .onEnd(() => {
      if (!containerUp) {
        if (translateY.value <= -50) {
          translateY.value = withSpring(-269, {damping: 50});
          runOnJS(setContainerUp)(true);
        } else if (translateY.value >= 50) {
          translateY.value = withSpring(100, {damping: 50});
        } else {
          translateY.value = withSpring(0, {damping: 50});
        }
        runOnJS(setBottomSheetSmall)(true);
      } else if (containerUp) {
        if (translateY.value >= -240) {
          translateY.value = withSpring(0, {damping: 50});
          runOnJS(setContainerUp)(false);
        } else {
          translateY.value = withSpring(0, {damping: 50});
        }
        runOnJS(setBottomSheetSmall)(false);
      }
    });

  const rBottomSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: translateY.value}],
    };
  });

  const checkforUID = useCallback(async () => {
    const userUID = await AsyncStorage.getItem('UID');
    if (userUID) {
      // console.log(userUID);
      setUID(userUID);
    }
  }, []);

  useEffect(() => {
    checkforUID();
  }, [checkforUID]);

  useEffect(() => {
    if (UID) {
      const getProfilePicURL = async () => {
        const url = await storage()
          .ref(UID + 'PFP')
          .getDownloadURL()
          .catch(error => {
            // console.log(error);
            const getDefaultPicURL = async () => {
              const defaultURL = await storage()
                .ref('circle.png')
                .getDownloadURL()
                .catch(error2 => {
                  // console.log(error2);
                });
              setProfilePicURL(defaultURL);
              // console.log(url);
            };
            getDefaultPicURL();
          });
        setProfilePicURL(url);
        // console.log(url);
      };
      getProfilePicURL();
    }
  }, [UID]);

  const getUserProfile = useCallback(async () => {
    const user = await firestore().collection('users').doc(UID).get();
    setDisplayName(user._data?.displayName);
  }, [UID]);

  useEffect(() => {
    if (UID) {
      getUserProfile();
    }
  }, [UID, getUserProfile]);

  const postComment = () => {
    const currentdate = new Date();
    firestore()
      .collection('posts')
      .doc(songID)
      .collection('comments')
      .add({
        UID: UID,
        parent: 'none',
        comment: commentText,
        profilePicURL: profilePicURL,
        displayName: displayName,
        likeAmount: 0,
        hasReplies: 'no',
        commentAddedAt:
          currentdate.getMonth() +
          1 +
          '/' +
          currentdate.getUTCDate() +
          '/' +
          currentdate.getFullYear() +
          ' @ ' +
          currentdate.getHours() +
          ':' +
          currentdate.getMinutes() +
          ':' +
          currentdate.getSeconds(),
      })
      .then(() => {
        // console.log('post added!');
      });
  };

  // Like a comment logic
  useEffect(() => {
    const increment = firebase.firestore.FieldValue.increment(1);
    const minusIncrement = firebase.firestore.FieldValue.increment(-1);
    if (commentID) {
      if (activeLikedComments.includes(commentID)) {
        HapticFeedback.trigger('impactLight');

        setActiveLikedComments(
          activeLikedComments.filter(comment => comment !== commentID),
        );
        firestore()
          .collection('posts')
          .doc(songID)
          .collection('comments')
          .doc(commentID)
          .update({
            likeAmount: minusIncrement,
          });
      } else {
        HapticFeedback.trigger('impactLight');

        setActiveLikedComments(current => [...current, commentID]);
        try {
          firestore()
            .collection('posts')
            .doc(songID)
            .collection('comments')
            .doc(commentID)
            .update({
              likeAmount: increment,
            });
        } catch (error) {
          console.log(error);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [likeChanged, commentID]);

  // REPLY LOGIC BELOW
  const postReply = () => {
    const currentdate = new Date();
    firestore()
      .collection('posts')
      .doc(songID)
      .collection('comments')
      .add({
        UID: UID,
        parent: replyID,
        comment: commentText,
        profilePicURL: profilePicURL,
        displayName: displayName,
        likeAmount: 0,
        commentAddedAt:
          currentdate.getMonth() +
          1 +
          '/' +
          currentdate.getUTCDate() +
          '/' +
          currentdate.getFullYear() +
          ' @ ' +
          currentdate.getHours() +
          ':' +
          currentdate.getMinutes() +
          ':' +
          currentdate.getSeconds(),
      })
      .then(() => {
        // console.log('post added!');
      });
    firestore()
      .collection('posts')
      .doc(songID)
      .collection('comments')
      .doc(replyID)
      .update({
        hasReplies: 'yes',
      })
      .then(() => {
        // console.log('post added!');
      });
  };

  const commentHandler = () => {
    if (replyActive) {
      postReply();
      // console.log('reply is true');
      setReplyActive(false);
    } else {
      postComment();
    }
  };

  useEffect(() => {
    if (songID) {
      // console.log('yo');
      firestore()
        .collection('posts')
        .doc(songID)
        .collection('comments')
        .where('parent', '==', 'none')
        .orderBy('likeAmount', 'desc')
        .get()
        .then(querySnapshot => {
          // console.log(querySnapshot);
          console.log('test');
          setMyComment(false);
          setParentComments(querySnapshot._docs);
        });
    }
  }, [songID, myComment]);

  useEffect(() => {
    if (replyID) {
      firestore()
        .collection('posts')
        .doc(songID)
        .collection('comments')
        .where('parent', '==', replyID)
        .orderBy('likeAmount', 'desc')
        .get()
        .then(querySnapshot => {
          // console.log(querySnapshot);
          setParentReplies(querySnapshot);
        });
      //re-run this effect everytime a user posts a comment
      setMyComment(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewReplies, myComment]);

  return (
    <>
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[styles.commentContainerBackground, rBottomSheetStyle]}>
          <View style={styles.drawer} />
          {caption && (
            <View style={styles.captionContainer}>
              <View style={styles.userContainer}>
                <Spotify height={15} width={15} />
                <Text style={styles.username}>username</Text>
              </View>
              <View style={styles.captionTextContainer}>
                <Text style={styles.caption}>{caption}</Text>
              </View>
            </View>
          )}

          {parentComments && (
            <FlatList
              // style={styles.commentFlatList}
              // contentContainerStyle={{paddingBottom: '200%'}}
              contentContainerStyle={
                bottomSheetSmall
                  ? {paddingBottom: '105%'}
                  : {paddingBottom: '150%'}
              }
              data={parentComments}
              renderItem={({item, index}) => {
                return (
                  <>
                    <View key={item.id} style={styles.mainContainer}>
                      <View style={styles.commentContainer}>
                        <View style={styles.commentLeftSide}>
                          <TouchableOpacity
                            onPress={() =>
                              navigation.navigate('ViewUserScreen', {
                                UID: item._data.UID,
                                myUID: UID,
                              })
                            }>
                            <Image
                              style={styles.userProfilePic}
                              source={{
                                uri: item._data.profilePicURL,
                              }}
                            />
                          </TouchableOpacity>
                          <View style={styles.commentTextContainer}>
                            <TouchableOpacity
                              onPress={() =>
                                navigation.navigate('ViewUserScreen', {
                                  UID: item._data.UID,
                                  myUID: UID,
                                })
                              }>
                              <Text
                                ref={replyUsernameRef}
                                style={styles.userDisplayName}>
                                {item._data.displayName}
                              </Text>
                            </TouchableOpacity>
                            <Text style={styles.userComment}>
                              {item._data.comment}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.likesContainer}>
                          <TouchableOpacity
                            onPress={() => {
                              setCommentID(item.id);
                              setMyComment(!myComment);
                              setLikedChanged(!likeChanged);
                            }}>
                            <Ionicons
                              style={styles.socialIcon}
                              name={
                                activeLikedComments.includes(item.id)
                                  ? 'heart'
                                  : 'heart-outline'
                              }
                              color={
                                activeLikedComments.includes(item.id)
                                  ? Colors.red
                                  : 'grey'
                              }
                              size={18}
                            />
                          </TouchableOpacity>
                          <Text style={styles.likeText}>
                            {item._data.likeAmount}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          setReplyActive(!replyActive);
                          inputRef.current.focus();
                          setReplyUsername(item._data.displayName);
                          setReplyID(item.id);
                        }}
                        style={styles.replyContainer}>
                        <Text style={styles.replyText}>Reply</Text>
                      </TouchableOpacity>
                      {item._data.hasReplies === 'yes' && (
                        <TouchableOpacity
                          style={styles.viewRepliesContainer}
                          onPress={() => {
                            setReplyID(item.id);
                            setViewReplies(!viewReplies);
                          }}>
                          <Text style={styles.viewRepliesText}>
                            View Replies
                          </Text>
                          <Ionicons
                            // style={styles.socialIcon}
                            name={viewReplies ? 'chevron-up' : 'chevron-down'}
                            color={'grey'}
                            size={18}
                          />
                        </TouchableOpacity>
                      )}
                      {parentReplies &&
                      item.id === parentReplies._docs[0]._data?.parent &&
                      viewReplies ? (
                        <>
                          {parentReplies._docs.map(reply => {
                            return (
                              <View
                                key={reply._data.id}
                                style={styles.repliesContainer}>
                                <View style={styles.repliesLeftSide}>
                                  <Image
                                    style={styles.repliesProfilePic}
                                    source={{
                                      uri: reply._data.profilePicURL,
                                    }}
                                  />
                                  <View style={styles.repliesTextContainer}>
                                    <Text
                                      ref={replyUsernameRef}
                                      style={styles.repliesDisplayName}>
                                      {reply._data.displayName}
                                    </Text>
                                    <Text style={styles.repliesComment}>
                                      {reply._data.comment}
                                    </Text>
                                  </View>
                                </View>
                                <View style={styles.likesContainer}>
                                  <TouchableOpacity
                                    onPress={() => {
                                      setCommentID(reply.id);
                                      setMyComment(!myComment);
                                      setLikedChanged(!likeChanged);
                                    }}>
                                    <Ionicons
                                      style={styles.socialIcon}
                                      name={
                                        activeLikedComments.includes(reply.id)
                                          ? 'heart'
                                          : 'heart-outline'
                                      }
                                      color={
                                        activeLikedComments.includes(reply.id)
                                          ? Colors.red
                                          : 'grey'
                                      }
                                      size={18}
                                    />
                                  </TouchableOpacity>
                                  <Text style={styles.likeText}>
                                    {reply._data.likeAmount}
                                  </Text>
                                </View>
                              </View>
                            );
                          })}
                        </>
                      ) : null}
                    </View>
                  </>
                );
              }}
            />
          )}
        </Animated.View>
      </GestureDetector>
      {containerUp && (
        <View
          style={
            inputTop && keyboardSpacing
              ? // eslint-disable-next-line react-native/no-inline-styles
                {
                  position: 'absolute',
                  top: keyboardSpacing - 73,
                  flexDirection: 'row',
                  alignItems: 'center',
                  width: '100%',
                  paddingVertical: '5%',
                  backgroundColor: '#302F2F',
                  borderBottomColor: 'white',
                }
              : styles.addCommentContainer
          }>
          <Image style={styles.myProfilePic} source={{uri: profilePicURL}} />
          <TextInput
            onSubmitEditing={() => {
              setInputTop(!inputTop);
              commentHandler();
              setMyComment(true);
              setReplyUsername(false);
            }}
            onEndEditing={() => {
              setInputTop(false);
              setCommentText('');
              setReplyUsername(false);
            }}
            ref={inputRef}
            onFocus={() => setInputTop(!inputTop)}
            style={styles.myCommentInput}
            // placeholder="Add comment..."
            placeholder={
              replyUsername ? 'reply to ' + replyUsername : 'Add comment...'
            }
            placeholderTextColor={Colors.greyOut}
            autoCapitalize={'none'}
            keyboardAppearance="dark"
            value={commentText}
            onChangeText={text => setCommentText(text)}
            returnKeyType="send"
          />
        </View>
      )}
    </>
  );
});

export default BottomSheet;

const styles = StyleSheet.create({
  commentContainerBackground: {
    backgroundColor: '#1F1F1F',
    width: '100%',
    height: SCREEN_HEIGHT,
    borderTopEndRadius: 30,
    borderTopStartRadius: 30,
    position: 'absolute',
    top: 510,
  },
  drawer: {
    borderBottomColor: 'white',
    borderWidth: 2,
    borderRadius: 10,
    width: 75,
    alignSelf: 'center',
    marginTop: '3%',
    marginBottom: '5%',
  },
  captionContainer: {
    marginTop: '5%',
    marginLeft: '5%',
    width: '90%',
    height: '100%',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    color: Colors.greyOut,
    fontFamily: 'Inter-Medium',
    marginLeft: 5,
  },
  caption: {
    marginTop: '3%',
    color: 'white',
  },

  //user comments
  mainContainer: {
    marginBottom: '5%',
  },

  commentContainer: {
    alignItems: 'flex-start',
    marginLeft: '4%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    // marginTop: '1%',
  },
  commentLeftSide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  commentTextContainer: {
    marginLeft: '3%',
  },
  userProfilePic: {
    height: 32,
    width: 32,
    borderRadius: 32,
  },
  userDisplayName: {
    color: Colors.greyOut,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  userComment: {
    color: 'white',
    fontFamily: 'Inter-Regular',
    marginTop: '2%',
    width: 265,
    lineHeight: 20,
  },
  likesContainer: {
    alignItems: 'center',
    marginTop: '1%',
  },
  likeText: {
    color: Colors.greyOut,
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    marginTop: 2,
  },
  // reply to parent comment
  replyContainer: {
    marginLeft: '14.5%',
    marginTop: '2%',
  },
  replyText: {
    color: Colors.greyOut,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  // View replies
  viewRepliesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: '14.5%',
    marginTop: '3%',
  },
  viewRepliesText: {
    color: Colors.greyOut,
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  //reply styling
  repliesContainer: {
    alignItems: 'flex-start',
    marginLeft: '14%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: '3%',
    marginBottom: '3%',
  },
  repliesLeftSide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  repliesProfilePic: {
    height: 22,
    width: 22,
    borderRadius: 32,
  },
  repliesTextContainer: {
    marginLeft: '3%',
  },
  repliesDisplayName: {
    color: Colors.greyOut,
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  repliesComment: {
    color: 'white',
    fontFamily: 'Inter-Regular',
    marginTop: '2%',
    fontSize: 13,
    width: 230,
    lineHeight: 20,
  },
  replySpacer: {
    marginBottom: '5%',
  },

  //add comment
  noCommentContainer: {
    alignItems: 'center',
    marginTop: '20%',
    position: 'absolute',
  },
  noComments: {
    fontFamily: 'Inter-Bold',
    color: Colors.greyOut,
    fontSize: 14,
  },
  addCommentContainerTop: {
    position: 'absolute',
    top: '61%',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: '5%',
    backgroundColor: '#302F2F',
    borderBottomColor: 'white',
  },
  addCommentContainer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: '5%',
    backgroundColor: '#302F2F',
  },
  myProfilePic: {
    height: 35,
    width: 35,
    borderRadius: 40,
    marginLeft: '4%',
  },
  myCommentInput: {
    backgroundColor: '#1F1F1F',
    marginLeft: '3%',
    borderRadius: 9,
    paddingVertical: '3%',
    width: '80%',
    paddingLeft: 10,
    color: 'white',
    fontFamily: 'inter-regular',
    textAlign: 'left',
    fontSize: 11,
  },
});
