import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Dimensions,
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
import {FlashList} from '@shopify/flash-list';
import Colors from '../assets/utilities/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import storage from '@react-native-firebase/storage';

const BottomSheet2 = props => {
  const {currentIndex, feed, UID} = props;
  const [containerUp, setContainerUp] = useState(false);
  const [containerSmall, setContainerSmall] = useState(false);
  const [comments, setComments] = useState(false);
  const [profilePicURL, setProfilePicURL] = useState(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const inputRef = useRef();

  // get comments
  useEffect(() => {
    async function getComments() {
      const commentDocs = await firestore()
        .collection('posts')
        .doc(feed[currentIndex].id)
        .collection('comments')
        .get();
      console.log(commentDocs._docs);
      setComments(commentDocs._docs);
    }
    getComments();
  }, [currentIndex, feed]);

  // get current user's profile picture
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
      getProfilePicURL();
    }
  }, [UID]);

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

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      'keyboardDidShow',
      onKeyboardDidShow,
    );
    const hideSubscription = Keyboard.addListener(
      'keyboardDidHide',
      onKeyboardDidHide,
    );
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  function onKeyboardDidShow(e) {
    setKeyboardHeight(
      Dimensions.get('window').height - e.endCoordinates.height,
    );
  }

  function onKeyboardDidHide() {
    setKeyboardHeight(0);
  }

  return (
    <>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.animatedSheet, style]}>
          <>
            <View style={styles.drawer} />
            {comments ? (
              <>
                <View style={styles.flatlistContainer}>
                  <FlashList
                    disableAutoLayout={true}
                    data={comments}
                    estimatedItemSize={comments.length}
                    renderItem={({item}) => (
                      <View style={styles.commentContainer}>
                        <View style={styles.commentLeft}>
                          <TouchableOpacity>
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
                          </View>
                        </View>
                        <View style={styles.commentRight}>
                          <TouchableOpacity>
                            <Ionicons
                              style={styles.socialIcon}
                              name={'heart-outline'}
                              color={'grey'}
                              size={18}
                            />
                          </TouchableOpacity>
                          <Text style={styles.likeAmount}>
                            {item._data.likeAmount}
                          </Text>
                        </View>
                      </View>
                    )}
                  />
                </View>
              </>
            ) : (
              <>
                <Text>no comments</Text>
              </>
            )}
          </>
        </Animated.View>
      </PanGestureHandler>
      {containerUp && (
        <View
          style={
            keyboardHeight
              ? {
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  backgroundColor: '#302F2F',
                  paddingVertical: 20,
                  flexDirection: 'row',
                  paddingBottom: 20,
                  position: 'absolute',
                  top: keyboardHeight - 89,
                }
              : styles.myUserContainer
          }>
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
              onFocus={e => {
                setInputFocused(true);
                console.log(e);
              }}
              onBlur={() => setInputFocused(false)}
              style={styles.commentInput}
              placeholderTextColor={Colors.greyOut}
              placeholder="add a comment..."
            />
            <TouchableOpacity>
              <Ionicons
                // style={styles.socialIcon}
                name={'send'}
                color={'grey'}
                size={18}
              />
            </TouchableOpacity>
          </View>
          {/* <TextInput style={styles.commentInput} /> */}
        </View>
      )}
    </>
  );
};

export default BottomSheet2;

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
    height: 300,
  },
  commentContainer: {
    // backgroundColor: 'red',
    width: '90%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
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

  //comment UI

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
    paddingRight: 120,
  },
});
