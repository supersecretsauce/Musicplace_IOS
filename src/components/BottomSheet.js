import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  TextInput,
  KeyboardAvoidingView,
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
          <KeyboardAvoidingView behavior="padding">
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
            <View style={styles.addCommentContainer}>
              <Image
                style={styles.myProfilePic}
                source={{uri: profilePicURL}}
              />
              <TextInput
                style={styles.myCommentInput}
                placeholder="Add comment..."
                placeholderTextColor={Colors.greyOut}
                autoCapitalize={'none'}
              />
            </View>
          </KeyboardAvoidingView>
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
  addCommentContainer: {
    position: 'absolute',
    top: '52%',
    flexDirection: 'row',
    marginLeft: '5%',
    alignItems: 'center',
  },
  myProfilePic: {
    height: 33,
    width: 33,
    borderRadius: 40,
  },
  myCommentInput: {
    backgroundColor: '#343434',
    width: '83%',
    marginLeft: '5%',
    borderRadius: 6,
    padding: 10,
    color: 'white',
    fontFamily: 'inter-regular',
    fontSize: 11,
  },
});
