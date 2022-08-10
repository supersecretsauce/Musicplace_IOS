import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import Colors from '../assets/utilities/Colors';
import Spotify from '../assets/img/spotify.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
const {height: SCREEN_HEIGHT} = Dimensions.get('window');

const BottomSheet = props => {
  const [containerUp, setContainerUp] = useState(false);
  const caption = props.captionProps;
  const translateY = useSharedValue(0);
  const context = useSharedValue({y: 0});
  const [UID, setUID] = useState();
  const [userProfile, setUserProfile] = useState();
  const [profilePicURL, setProfilePicURL] = useState();
  const [inputTop, setInputTop] = useState(false);
  console.log(inputTop);

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
      } else {
        if (translateY.value >= -240) {
          translateY.value = withSpring(0, {damping: 50});
          setContainerUp(false);
        } else {
          translateY.value = withSpring(0, {damping: 50});
        }
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
    }
  }, [UID]);

  return (
    <>
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[styles.commentContainerBackground, rBottomSheetStyle]}>
          <View style={styles.drawer} />
          <View style={styles.captionContainer}>
            <View style={styles.userContainer}>
              <Spotify height={15} width={15} />
              <Text style={styles.username}>username</Text>
            </View>
            <View style={styles.captionTextContainer}>
              <Text style={styles.caption}>{caption}</Text>
            </View>
          </View>
          <View
            style={
              inputTop
                ? styles.addCommentContainerTop
                : styles.addCommentContainer
            }>
            <Image style={styles.myProfilePic} source={{uri: profilePicURL}} />
            <TextInput
              onSubmitEditing={() => setInputTop(!inputTop)}
              onEndEditing={() => setInputTop(false)}
              onFocus={() => setInputTop(!inputTop)}
              style={styles.myCommentInput}
              placeholder="Add comment..."
              placeholderTextColor={Colors.greyOut}
              autoCapitalize={'none'}
              keyboardAppearance="dark"
            />
          </View>
        </Animated.View>
      </GestureDetector>
    </>
  );
};

export default BottomSheet;

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
  },
  captionContainer: {
    marginTop: '1%',
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
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  myProfilePic: {
    height: 35,
    width: 35,
    borderRadius: 40,
    marginLeft: '5%',
  },
  myCommentInput: {
    backgroundColor: '#1F1F1F',
    width: '78%',
    marginLeft: '3%',
    borderRadius: 6,
    padding: '2.75%',
    color: 'white',
    fontFamily: 'inter-regular',
    fontSize: 11,
  },
});
