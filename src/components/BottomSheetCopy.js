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
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {firebase} from '@react-native-firebase/firestore';
import Colors from '../assets/utilities/Colors';
import Spotify from '../assets/img/spotify.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

const BottomSheetCopy = props => {
  const [containerUp, setContainerUp] = useState(false);
  const caption = props.captionProps;
  const songID = props.songIDProps;
  const translateY = useSharedValue(0);
  const context = useSharedValue({y: 0});
  const [UID, setUID] = useState();
  const [displayName, setDisplayName] = useState();
  const [profilePicURL, setProfilePicURL] = useState();
  const [inputTop, setInputTop] = useState(false);
  const [commentText, setCommentText] = useState();
  const [parentComments, setParentComments] = useState();
  const [like, setLike] = useState(false);
  const [likeFiller, setLikeFiller] = useState(false);
  const [likeTarget, setLikeTarget] = useState();
  const [myComment, setMyComment] = useState(false);
  const [bottomSheetSmall, setBottomSheetSmall] = useState(false);
  const [commentID, setCommentID] = useState();
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
          setContainerUp(true);
        } else {
          translateY.value = withSpring(0, {damping: 50});
        }
        setBottomSheetSmall(true);
      } else {
        if (translateY.value >= -240) {
          translateY.value = withSpring(0, {damping: 50});
          setContainerUp(false);
        } else {
          translateY.value = withSpring(0, {damping: 50});
        }
        setBottomSheetSmall(false);
      }
    });
  const rBottomSheetStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{translateY: translateY.value}],
    };
  });

  useEffect(() => {
    const checkforUID = async () => {
      const userUID = await AsyncStorage.getItem('UID');
      if (userUID) {
        console.log(userUID);
        setUID(userUID);
      }
    };
    checkforUID();
  }, []);

  useEffect(() => {
    if (UID) {
      const getProfilePicURL = async () => {
        const url = await storage()
          .ref(UID + 'PFP')
          .getDownloadURL()
          .catch(error => {
            console.log(error);
          });
        setProfilePicURL(url);
        console.log(url);
      };
      getProfilePicURL();

      const getUserProfile = async () => {
        const user = await firestore().collection('users').doc(UID).get();
        setDisplayName(user._data?.displayName);
      };
      getUserProfile();
    }
  }, [UID]);

  useEffect(() => {
    if (UID) {
      const getUserProfile = async () => {
        const user = await firestore().collection('users').doc(UID).get();
        setDisplayName(user._data?.displayName);
      };
      getUserProfile();
    }
  }, [UID]);

  useEffect(() => {
    if (displayName) {
      console.log(displayName);
    }
  }, [displayName]);

  const postComment = () => {
    const currentdate = new Date();
    firestore()
      .collection('posts')
      .doc(songID)
      .collection('comments')
      .doc(commentText)
      .set({
        UID: UID,
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
        console.log('post added!');
      });
  };

  // get all parent comments
  useEffect(() => {
    if (songID) {
      firestore()
        .collection('posts')
        .doc(songID)
        .collection('comments')
        .orderBy('likeAmount', 'desc')
        .get()
        .then(querySnapshot => {
          console.log(querySnapshot);
          setParentComments(querySnapshot._docs);
        });
      //re-run this effect everytime a user posts a comment
      setMyComment(false);
    }
  }, [songID, myComment, likeTarget]);

  // update like count for comments
  useEffect(() => {
    const increment = firebase.firestore.FieldValue.increment(1);
    const minusIncrement = firebase.firestore.FieldValue.increment(-1);
    if (songID) {
      if (likeTarget) {
        firestore()
          .collection('posts')
          .doc(songID)
          .collection('comments')
          .doc(commentID)
          .update({
            likeAmount: increment,
          });
        console.log('true');
      } else if (likeTarget === false) {
        firestore()
          .collection('posts')
          .doc(songID)
          .collection('comments')
          .doc(commentID)
          .update({
            likeAmount: minusIncrement,
          });
        console.log('false');
      }
    }
  }, [likeTarget, songID, commentID]);

  const likeUIHandler = () => {
    setLike(!like);
    setLikeFiller(!likeFiller);
  };

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
                  ? {paddingBottom: '108%'}
                  : {paddingBottom: '160%'}
              }
              data={parentComments}
              renderItem={({item, index}) => {
                return (
                  <View style={styles.commentContainer} key={index}>
                    <View style={styles.commentLeftSide}>
                      <Image
                        style={styles.userProfilePic}
                        source={{
                          uri: item._data.profilePicURL,
                        }}
                      />
                      <View style={styles.commentTextContainer}>
                        <Text style={styles.userDisplayName}>
                          {item._data.displayName}
                        </Text>
                        <Text style={styles.userComment}>{item.id}</Text>
                      </View>
                    </View>
                    <View style={styles.likesContainer}>
                      <TouchableOpacity
                        onPress={() => {
                          setCommentID(item.id);
                          likeUIHandler();
                          if (!likeTarget) {
                            setLikeTarget(item.id);
                          } else {
                            setLikeTarget(false);
                          }
                        }}>
                        <Ionicons
                          key={index}
                          style={styles.socialIcon}
                          name={
                            likeTarget === item.id ? 'heart' : 'heart-outline'
                          }
                          color={likeTarget === item.id ? Colors.red : 'grey'}
                          size={18}
                        />
                      </TouchableOpacity>
                      <Text style={styles.likeText}>
                        {item._data.likeAmount}
                      </Text>
                    </View>
                  </View>
                );
              }}
            />
          )}
          <View
            style={
              inputTop
                ? styles.addCommentContainerTop
                : styles.addCommentContainer
            }>
            <Image style={styles.myProfilePic} source={{uri: profilePicURL}} />
            <TextInput
              onSubmitEditing={() => {
                setInputTop(!inputTop);
                postComment();
                setMyComment(true);
              }}
              onEndEditing={() => {
                setInputTop(false);
                setCommentText('');
              }}
              onFocus={() => setInputTop(!inputTop)}
              style={styles.myCommentInput}
              placeholder="Add comment..."
              placeholderTextColor={Colors.greyOut}
              autoCapitalize={'none'}
              keyboardAppearance="dark"
              value={commentText}
              onChangeText={text => setCommentText(text)}
              returnKeyType="send"
            />
          </View>
        </Animated.View>
      </GestureDetector>
    </>
  );
};

export default BottomSheetCopy;

const styles = StyleSheet.create({
  commentContainerBackground: {
    backgroundColor: '#1F1F1F',
    width: '100%',
    height: SCREEN_HEIGHT,
    borderTopEndRadius: 30,
    borderTopStartRadius: 30,
    position: 'absolute',
    top: '96%',
  },
  drawer: {
    borderBottomColor: 'white',
    borderWidth: 2,
    borderRadius: 10,
    width: 75,
    alignSelf: 'center',
    marginTop: '3%',
    marginBottom: '3%',
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

  commentContainer: {
    alignItems: 'flex-start',
    marginLeft: '4%',
    marginTop: '3%',
    marginBottom: '5%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
  },
  commentLeftSide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentTextContainer: {
    marginLeft: '7%',
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
    marginTop: '3%',
  },
  likesContainer: {
    alignItems: 'center',
  },
  likeText: {
    color: Colors.greyOut,
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    marginTop: 2,
  },
  //user comment input
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
    top: '20.2%',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: '5%',
    backgroundColor: '#302F2F',
    borderBottomColor: 'white',
    // borderBottomWidth: 0.2,
  },
  addCommentContainer: {
    position: 'absolute',
    top: '50.6%',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: '5%',
    backgroundColor: '#302F2F',
    // borderTopLeftRadius: 6,
    // borderTopRightRadius: 6,
  },
  myProfilePic: {
    height: 35,
    width: 35,
    borderRadius: 40,
    marginLeft: '4%',
  },
  myCommentInput: {
    backgroundColor: '#1F1F1F',
    width: '78%',
    marginLeft: '3%',
    borderRadius: 9,
    padding: '2.75%',
    color: 'white',
    fontFamily: 'inter-regular',
    fontSize: 11,
  },
});
