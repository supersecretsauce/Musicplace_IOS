import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  FlatList,
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
import storage from '@react-native-firebase/storage';
import ReplyComments from './ReplyComments';
import Toast from 'react-native-toast-message';
import {firebase} from '@react-native-firebase/firestore';
import {useNavigation} from '@react-navigation/native';
const SinglePostBottomSheet = props => {
  const {songInfo, UID} = props;
  const [containerUp, setContainerUp] = useState(false);
  const [containerSmall, setContainerSmall] = useState(false);
  const [comments, setComments] = useState(false);
  const [profilePicURL, setProfilePicURL] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [userText, setUserText] = useState(null);
  const [replyInfo, setReplyInfo] = useState(null);
  const [showReplies, setShowReplies] = useState(false);
  const [parentCommentID, setParentCommentID] = useState([]);
  const [replies, setReplies] = useState(null);
  const [likedComments, setLikedComments] = useState([]);
  const [likeValue, setLikeValue] = useState(0);
  const inputRef = useRef();
  const {navigate} = useNavigation();

  // get comments
  async function getComments() {
    const commentDocs = await firestore()
      .collection('posts')
      .doc(songInfo[0].id)
      .collection('comments')
      .where('parent', '==', 'none')
      .orderBy('likeAmount', 'desc')
      .get();
    console.log('comment documents', commentDocs);
    if (commentDocs.empty) {
      setComments(null);
      return;
    } else {
      console.log('comments exist!');
      setComments(commentDocs._docs);
    }
  }

  useEffect(() => {
    getComments();
  }, [songInfo]);

  // get current user's profile picture and their user document
  useEffect(() => {
    if (UID) {
      const getProfilePicURL = async () => {
        const url = await storage()
          .ref(UID + 'PFP')
          .getDownloadURL()
          .catch(error => {
            console.log(error);
          });
        if (url) {
          console.log(url);
          setProfilePicURL(url);
        }
      };
      const getUserDoc = async () => {
        const doc = await firestore().collection('users').doc(UID).get();
        if (doc) {
          console.log(doc._data);
          setUserDoc(doc._data);
        }
      };
      getProfilePicURL();
      getUserDoc();
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

  // handle logic when a user posts a comment
  function handleCommentSubmit() {
    console.log(userText);

    if (replyInfo) {
      firestore()
        .collection('posts')
        .doc(songInfo[0].id)
        .collection('comments')
        .add({
          comment: userText,
          displayName: userDoc.displayName,
          profilePicURL: profilePicURL,
          hasReplies: 'no',
          likeAmount: 0,
          parent: replyInfo.id,
          UID: UID,
        })
        .then(() => {
          firestore()
            .collection('posts')
            .doc(songInfo[0].id)
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
    } else {
      firestore()
        .collection('posts')
        .doc(songInfo[0].id)
        .collection('comments')
        .add({
          comment: userText,
          displayName: userDoc.displayName,
          profilePicURL: profilePicURL,
          hasReplies: false,
          likeAmount: 0,
          parent: 'none',
          UID: UID,
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
      .collection('posts')
      .doc(songInfo[0].id)
      .collection('comments')
      .where('parent', '==', itemID)
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
      setParentCommentID(parentCommentID.filter(id => id !== itemID));
      setShowReplies(false);
      setReplies();
    } else {
      setShowReplies(true);
      setParentCommentID([...parentCommentID, itemID]);
      getCommentReplies(itemID);
    }
  }

  //handle liked comment logic
  async function likeComment(itemID) {
    const increment = firebase.firestore.FieldValue.increment(1);
    const decrement = firebase.firestore.FieldValue.increment(-1);

    if (likedComments.includes(itemID)) {
      setLikedComments(likedComments.filter(comment => comment !== itemID));
      firestore()
        .collection('posts')
        .doc(songInfo[0].id)
        .collection('comments')
        .doc(itemID)
        .update({
          likeAmount: decrement,
        })
        .then(() => {
          console.log('Like removed :(');
        });
      setLikeValue(-1);
    } else {
      setLikedComments([...likedComments, itemID]);
      firestore()
        .collection('posts')
        .doc(songInfo[0].id)
        .collection('comments')
        .doc(itemID)
        .update({
          likeAmount: increment,
        })
        .then(() => {
          console.log('Like added!');
        });
      setLikeValue(1);
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
                    renderItem={({item}) => (
                      <>
                        <View style={styles.commentAndReplyContainer}>
                          <View style={styles.commentContainer}>
                            <View style={styles.commentLeft}>
                              <TouchableOpacity
                                onPress={() => {
                                  navigate('ViewUserScreen2', {
                                    profileID: item._data.UID,
                                    UID: UID,
                                  });
                                }}>
                                <Image
                                  style={styles.profilePic}
                                  source={{
                                    uri: item._data.profilePicURL,
                                  }}
                                />
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
                                        showReplies
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
                                onPress={() => likeComment(item.id)}>
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
                                {likedComments.includes(item.id)
                                  ? likeValue === 1
                                    ? item._data.likeAmount + 1
                                    : item._data.likeAmount - 1
                                  : item._data.likeAmount}
                              </Text>
                            </View>
                          </View>
                          {showReplies &&
                          parentCommentID.includes(item.id) &&
                          replies ? (
                            <ReplyComments replies={replies} />
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
                  <Image
                    style={styles.defaultProfilePic}
                    source={{
                      uri: 'https://firebasestorage.googleapis.com/v0/b/musicplace-66f20.appspot.com/o/circle.png?alt=media&token=4d44b252-e89d-4887-8a07-14e4c596de60',
                    }}
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
            {profilePicURL && (
              <Image
                style={styles.myProfilePic}
                source={{
                  uri: profilePicURL,
                }}
              />
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
    borderBottomColor: 'white',
    borderWidth: 2,
    borderRadius: 10,
    width: 75,
    alignSelf: 'center',
    marginTop: '3%',
    marginBottom: 20,
  },
  flatlistContainer: {
    // backgroundColor: 'red',
    width: '100%',
    height: '60%',
  },
  commentAndReplyContainer: {
    marginBottom: 20,
  },
  commentContainer: {
    // backgroundColor: 'red',
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
