import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import React, {useState, useEffect} from 'react';
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
        <View style={styles.myUserContainer}>
          {profilePicURL && (
            <Image
              style={styles.myProfilePic}
              source={{
                uri: profilePicURL,
              }}
            />
          )}
          <TextInput style={styles.commentInput} />
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
  myUserContainer: {
    justifyContent: 'center',
    width: '100%',
    backgroundColor: 'black',
    paddingVertical: 10,
    position: 'absolute',
    flexDirection: 'row',
    bottom: 0,
  },
  myProfilePic: {
    height: 32,
    width: 32,
    borderRadius: 32,
  },
  commentInput: {
    backgroundColor: '#1F1F1F',
    marginLeft: '3%',
    borderRadius: 9,
    paddingVertical: '3%',
    width: 300,
    paddingLeft: 10,
    color: 'white',
    fontFamily: 'inter-regular',
    textAlign: 'left',
    fontSize: 11,
  },
});
