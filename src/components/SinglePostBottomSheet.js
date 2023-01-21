import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  FlatList,
  Keyboard,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import Animated, {
  useAnimatedGestureHandler,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {PanGestureHandler} from 'react-native-gesture-handler';
import {SPRING_CONFIG} from '../assets/utilities/reanimated-2';
import firestore from '@react-native-firebase/firestore';
import Colors from '../assets/utilities/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ReplyComments from './ReplyComments';
import Toast from 'react-native-toast-message';
import {firebase} from '@react-native-firebase/firestore';
import {useNavigation} from '@react-navigation/native';
import HapticFeedback from 'react-native-haptic-feedback';
import MusicplaceIcon from '../assets/img/musicplace-icon.svg';
import {mixpanel} from '../../mixpanel';

const SinglePostBottomSheet = props => {
  const {
    songInfo,
    UID,
    openSheet,
    commentDocID,
    showShareSheet,
    prevScreen,
    replyRef,
  } = props;
  const [containerUp, setContainerUp] = useState(false);
  const [containerSmall, setContainerSmall] = useState(false);
  const [comments, setComments] = useState(false);
  const [userDoc, setUserDoc] = useState(null);
  const [userText, setUserText] = useState('');
  const [replyInfo, setReplyInfo] = useState(null);
  const [showReplies, setShowReplies] = useState(false);
  const [parentCommentID, setParentCommentID] = useState([]);
  const [replies, setReplies] = useState(null);
  const [likedComments, setLikedComments] = useState([]);
  const inputRef = useRef();
  const flatListRef = useRef();
  const navigation = useNavigation();

  useEffect(() => {
    if (openSheet && commentDocID && comments) {
      top.value = withSpring(200, SPRING_CONFIG);
      runOnJS(setContainerUp)(true);
      if (replyRef) {
        let index = comments.findIndex(comment => comment.id === replyRef);
        flatListRef?.current?.scrollToIndex({animated: true, index: index});
        setShowReplies(true);
        setParentCommentID([replyRef]);
        getCommentReplies(replyRef);
      } else {
        let index = comments.findIndex(comment => comment.id === commentDocID);
        flatListRef?.current?.scrollToIndex({animated: true, index: index});
      }
    }
  }, [openSheet, commentDocID, comments]);

  // get comments
  async function getComments() {
    const commentDocs = await firestore()
      .collection('comments')
      .where('parent', '==', false)
      .where('songID', '==', songInfo[0].id)
      .orderBy('likeAmount', 'desc')
      .get();
    console.log('comment documents', commentDocs);
    if (commentDocs.empty) {
      setComments(null);
      return;
    } else {
      setComments(commentDocs._docs);
      let myLikes = commentDocs.docs.filter(doc => {
        return doc.data().likesArray.includes(UID);
      });
      let filteredLikes = myLikes.map(likeDoc => {
        return likeDoc.id;
      });
      setLikedComments(filteredLikes);
    }
  }

  useEffect(() => {
    if (songInfo) {
      console.log('getting comments');
      getComments();
    }
  }, [songInfo]);

  // get current user's profile picture and their user document
  useEffect(() => {
    if (UID) {
      const subscriber = firestore()
        .collection('users')
        .doc(UID)
        .onSnapshot(snapshot => {
          console.log('snapy', snapshot.data());
          setUserDoc(snapshot.data());
        });

      return () => subscriber();
    }
  }, [UID]);

  /* animations for the bottom sheet 
    NOTE: THE ANIMATIONS DO NOT WORK WHEN DEBUGGING
    */
  const top = useSharedValue(490);
  const style = useAnimatedStyle(() => {
    return {
      top: top.value,
    };
  });
  const gestureHandler = useAnimatedGestureHandler({
    onStart(_, context) {
      context.startTop = top.value;
    },
    onActive(event, context) {
      top.value = context.startTop + event.translationY;
    },
    onEnd() {
      if (containerUp) {
        if (top.value > 200 && top.value < 490) {
          top.value = withSpring(490, SPRING_CONFIG);
          runOnJS(setContainerUp)(false);
        } else if (top.value > 490) {
          top.value = withSpring(580, SPRING_CONFIG);
          runOnJS(setContainerUp)(false);
          runOnJS(setContainerSmall)(true);
        } else if (top.value < 200) {
          top.value = withSpring(200, SPRING_CONFIG);
        }
      } else {
        if (containerSmall) {
          if (top.value < 580 && top.value > 490) {
            top.value = withSpring(490, SPRING_CONFIG);
            runOnJS(setContainerSmall)(false);
          } else if (top.value < 490) {
            top.value = withSpring(200, SPRING_CONFIG);
            runOnJS(setContainerUp)(true);
            runOnJS(setContainerSmall)(false);
          } else if (top.value > 580) {
            top.value = withSpring(580, SPRING_CONFIG);
          }
        } else {
          if (top.value < 490) {
            top.value = withSpring(200, SPRING_CONFIG);
            runOnJS(setContainerUp)(true);
          } else if (top.value > 490) {
            top.value = withSpring(580, SPRING_CONFIG);
            runOnJS(setContainerSmall)(true);
          }
        }
      }
    },
  });

  useEffect(() => {
    if (showShareSheet) {
      top.value = withSpring(1000, SPRING_CONFIG);
    } else {
      top.value = withSpring(490, SPRING_CONFIG);
    }
  }, [showShareSheet]);

  // handle logic when a user posts a comment
  function handleCommentSubmit() {
    console.log(replyInfo);
    mixpanel.track('Comment');
    if (userText === '') {
      return;
    }
    Keyboard.dismiss();
    if (replyInfo) {
      firestore()
        .collection('comments')
        .add({
          comment: userText,
          displayName: userDoc.displayName,
          pfpURL: userDoc?.pfpURL ? userDoc?.pfpURL : null,
          handle: userDoc?.handle,
          hasReplies: false,
          likeAmount: 0,
          likesArray: [],
          parent: replyInfo.id,
          parentUID: replyInfo._data.UID,
          UID: UID,
          songID: songInfo[0].id,
        })
        .then(() => {
          firestore()
            .collection('comments')
            .doc(replyInfo.id)
            .update({
              hasReplies: true,
            })
            .then(() => {
              Toast.show({
                type: 'success',
                text1: 'Reply posted.',
                visibilityTime: 2000,
              });
              getCommentReplies(replyInfo.id);
              getComments();
              setUserText('');
              console.log('comment added!');
            });
        });
      firestore()
        .collection('users')
        .doc(replyInfo._data.UID)
        .collection('activity')
        .add({
          UID: UID,
          from: 'user',
          type: 'reply',
          timestamp: firestore.FieldValue.serverTimestamp(),
          songInfo: songInfo[0],
          handle: userDoc.handle,
          displayName: userDoc.displayName,
          pfpURL: userDoc?.pfpURL ? userDoc?.pfpURL : null,
          commentDocID: replyInfo.id,
          notificationRead: false,
        })
        .then(() => {
          console.log('added doc to parent user');
        })
        .catch(e => console.log(e));
    } else {
      firestore()
        .collection('comments')
        .add({
          comment: userText,
          displayName: userDoc.displayName,
          pfpURL: userDoc?.pfpURL ? userDoc?.pfpURL : null,
          hasReplies: false,
          likeAmount: 0,
          likesArray: [],
          parent: false,
          UID: UID,
          songID: songInfo[0].id,
        })
        .then(() => {
          Toast.show({
            type: 'success',
            text1: 'Comment posted.',
            visibilityTime: 2000,
          });
          getComments();
          setUserText('');
          console.log('comment added!');
        });
    }
  }

  //handle reply logic
  function handleCommentReply(item) {
    console.log('reply item', item);
    setContainerUp(true);
    setReplyInfo(item);
    if (containerUp) {
      inputRef.current.focus();
    } else {
      setContainerUp(true);
      top.value = withSpring(200, SPRING_CONFIG);
    }
  }

  //get comment replies
  async function getCommentReplies(itemID) {
    const replyDocs = await firestore()
      .collection('comments')
      .where('parent', '==', itemID)
      .where('songID', '==', songInfo[0].id)
      .orderBy('likeAmount', 'desc')
      .get();
    if (!replyDocs.empty) {
      console.log('reply documents', replyDocs._docs);
      setReplies(replyDocs._docs);
    }
  }

  //handle show replies logic
  async function handleShowReplies(itemID) {
    if (parentCommentID.includes(itemID)) {
      setParentCommentID([]);
      setShowReplies(false);
      setReplies([]);
    } else {
      setShowReplies(true);
      setParentCommentID([itemID]);
      getCommentReplies(itemID);
    }
  }

  //handle liked comment logic
  async function likeComment(item) {
    console.log(item);
    HapticFeedback.trigger('selection');
    const increment = firebase.firestore.FieldValue.increment(1);
    const decrement = firebase.firestore.FieldValue.increment(-1);
    if (likedComments.includes(item.id)) {
      setLikedComments(likedComments.filter(id => id !== item.id));
      let updatedComments = comments.map(comment => {
        if (comment.id === item.id) {
          comment._data.likeAmount -= 1;
          return comment;
        } else {
          return comment;
        }
      });
      setComments(updatedComments);
      firestore()
        .collection('comments')
        .doc(item.id)
        .update({
          likeAmount: decrement,
          likesArray: firestore.FieldValue.arrayRemove(UID),
        })
        .then(() => {
          console.log('Like removed :(');
        })
        .catch(e => console.log(e));
    } else {
      setLikedComments([...likedComments, item.id]);
      let updatedComments = comments.map(comment => {
        if (comment.id === item.id) {
          comment._data.likeAmount += 1;
          return comment;
        } else {
          return comment;
        }
      });
      setComments(updatedComments);
      firestore()
        .collection('comments')
        .doc(item.id)
        .update({
          likeAmount: increment,
          likesArray: firestore.FieldValue.arrayUnion(UID),
        })
        .then(() => {
          console.log('Like added!');
        })
        .catch(e => console.log(e));

      firestore()
        .collection('users')
        .doc(item._data.UID)
        .collection('activity')
        .add({
          UID: UID,
          from: 'user',
          type: 'like',
          timestamp: firestore.FieldValue.serverTimestamp(),
          songInfo: songInfo[0],
          handle: userDoc.handle,
          displayName: userDoc.displayName,
          pfpURL: userDoc?.pfpURL ? userDoc?.pfpURL : null,
          commentDocID: item.id,
          notificationRead: false,
          replyRef: item._data.parent,
        })
        .then(() => {
          console.log('added doc to parent user');
        })
        .catch(e => console.log(e));
    }
  }

  function handleCommentNav(item) {
    if (item._data.UID === UID) {
      console.log(prevScreen);
      if (prevScreen === 'ProfileScreen') {
        navigation.goBack();
      } else {
        navigation.navigate('ProfileStackScreen');
      }
    } else {
      navigation.navigate('ViewUserScreen', {
        profileID: item._data.UID,
        UID: UID,
      });
    }
  }

  return (
    <>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.animatedSheet, style]}>
          <>
            <View style={styles.drawer} />
            {comments ? (
              <>
                <View
                  style={
                    containerUp ? styles.flatlistContainer : {height: '30%'}
                  }>
                  <FlatList
                    contentContainerStyle={{paddingBottom: '20%'}}
                    data={comments}
                    ref={flatListRef}
                    initialScrollIndex={0}
                    onScrollToIndexFailed={info => {
                      const wait = new Promise(resolve =>
                        setTimeout(resolve, 100),
                      );
                      wait.then(() => {
                        flatListRef.current?.scrollToIndex({
                          index: info.index,
                          animated: true,
                        });
                      });
                    }}
                    renderItem={({item}) => (
                      <>
                        <View style={styles.commentAndReplyContainer}>
                          <View style={styles.commentContainer}>
                            <View style={styles.commentLeft}>
                              <TouchableOpacity
                                onPress={() => {
                                  handleCommentNav(item);
                                }}>
                                {item?._data?.pfpURL ? (
                                  <Image
                                    style={styles.profilePic}
                                    source={{
                                      uri: item._data.pfpURL,
                                    }}
                                  />
                                ) : (
                                  <View style={styles.profilePic} />
                                )}
                              </TouchableOpacity>
                              <View style={styles.commentMiddle}>
                                <Text style={styles.displayName}>
                                  {item._data.displayName}
                                </Text>
                                <Text style={styles.comment}>
                                  {item._data.comment}
                                </Text>
                                <TouchableOpacity
                                  onPress={() => handleCommentReply(item)}>
                                  <Text style={styles.reply}>reply</Text>
                                </TouchableOpacity>
                                {item._data.hasReplies && (
                                  <TouchableOpacity
                                    onPress={() => handleShowReplies(item.id)}
                                    style={styles.hasRepliesContainer}>
                                    <Text style={styles.viewReplies}>
                                      view replies
                                    </Text>
                                    <Ionicons
                                      style={styles.socialIcon}
                                      name={
                                        showReplies &&
                                        parentCommentID.includes(item.id)
                                          ? 'chevron-up'
                                          : 'chevron-down'
                                      }
                                      color={'grey'}
                                      size={16}
                                    />
                                  </TouchableOpacity>
                                )}
                              </View>
                            </View>
                            <View style={styles.commentRight}>
                              <TouchableOpacity
                                onPress={() => likeComment(item)}>
                                <Ionicons
                                  style={styles.socialIcon}
                                  name={
                                    likedComments.includes(item.id)
                                      ? 'heart'
                                      : 'heart-outline'
                                  }
                                  color={
                                    likedComments.includes(item.id)
                                      ? Colors.red
                                      : 'grey'
                                  }
                                  size={18}
                                />
                              </TouchableOpacity>
                              <Text style={styles.likeAmount}>
                                {item._data.likeAmount}
                              </Text>
                            </View>
                          </View>
                          {showReplies &&
                          parentCommentID.includes(item.id) &&
                          replies ? (
                            <ReplyComments
                              prevScreen={prevScreen}
                              parent={'SinglePostBottomSheet'}
                              userDoc={userDoc}
                              songInfo={songInfo[0]}
                              UID={UID}
                              replies={replies}
                            />
                          ) : (
                            <></>
                          )}
                        </View>
                      </>
                    )}
                  />
                </View>
              </>
            ) : (
              <>
                <View style={styles.defaultCommentContainer}>
                  <MusicplaceIcon
                    height={32}
                    width={32}
                    style={styles.defaultProfilePic}
                  />
                  <View style={styles.defaultCommentMiddle}>
                    <Text style={styles.displayName}>Musicplace</Text>
                    <Text style={styles.comment}>
                      swipe up to add a comment
                    </Text>
                  </View>
                </View>
              </>
            )}
          </>
        </Animated.View>
      </PanGestureHandler>
      {containerUp && (
        <KeyboardAvoidingView behavior="position">
          <View style={styles.myUserContainer}>
            {userDoc?.pfpURL ? (
              <Image
                style={styles.myProfilePic}
                source={{
                  uri: userDoc?.pfpURL,
                }}
              />
            ) : (
              <View style={styles.myProfilePic} />
            )}
            <View style={styles.inputBackground}>
              <TextInput
                ref={inputRef}
                onSubmitEditing={handleCommentSubmit}
                onEndEditing={() => setReplyInfo(null)}
                onChangeText={text => setUserText(text)}
                style={styles.commentInput}
                placeholderTextColor={Colors.greyOut}
                placeholder={
                  replyInfo
                    ? `reply to ${replyInfo._data.displayName}`
                    : 'add a comment...'
                }
                keyboardAppearance="dark"
                autoCapitalize={'none'}
                returnKeyType="send"
                value={userText}
              />
              <TouchableOpacity onPress={handleCommentSubmit}>
                <Ionicons
                  style={styles.sendIcon}
                  name={'send'}
                  color={'grey'}
                  size={18}
                />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </>
  );
};

export default SinglePostBottomSheet;

const styles = StyleSheet.create({
  animatedSheet: {
    position: 'absolute',
    backgroundColor: '#1F1F1F',
    borderTopEndRadius: 30,
    borderTopStartRadius: 30,
    width: '100%',
    height: '100%',
    bottom: 0,
  },
  drawer: {
    height: 3,
    width: 50,
    backgroundColor: 'white',
    alignSelf: 'center',
    marginTop: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  flatlistContainer: {
    width: '100%',
    height: '60%',
  },
  commentAndReplyContainer: {
    marginBottom: 20,
  },
  commentContainer: {
    width: '90%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  commentLeft: {
    flexDirection: 'row',
  },
  profilePic: {
    height: 32,
    width: 32,
    borderRadius: 32,
    backgroundColor: Colors.red,
  },
  commentMiddle: {
    marginLeft: 15,
  },
  displayName: {
    color: Colors.greyOut,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  comment: {
    color: 'white',
    fontFamily: 'Inter-Regular',
    marginTop: '2%',
    width: 265,
    lineHeight: 20,
  },
  reply: {
    color: Colors.greyOut,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: '2%',
  },
  hasRepliesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '3%',
  },
  viewReplies: {
    color: Colors.greyOut,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginRight: 4,
  },
  commentRight: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  likeAmount: {
    color: Colors.greyOut,
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    marginTop: 2,
  },
  // default comment UI
  defaultCommentContainer: {
    width: '90%',
    alignSelf: 'center',
    flexDirection: 'row',
  },
  defaultCommentMiddle: {
    marginLeft: 15,
  },
  defaultProfilePic: {
    height: 32,
    width: 32,
    borderRadius: 32,
  },
  //add a comment UI
  myUserContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#302F2F',
    paddingVertical: 20,
    flexDirection: 'row',
    paddingBottom: 20,
    position: 'absolute',
    bottom: 0,
  },
  myProfilePic: {
    height: 48,
    width: 48,
    borderRadius: 48,
    backgroundColor: Colors.red,
  },
  inputBackground: {
    backgroundColor: '#1F1F1F',
    width: 290,
    height: 45,
    marginLeft: 15,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  commentInput: {
    paddingVertical: 5,
    width: 230,
    color: 'white',
  },
});
