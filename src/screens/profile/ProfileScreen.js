import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Circle from '../../assets/img/circle.svg';
import Colors from '../../assets/utilities/Colors';
import EditProfileSheet from '../../components/EditProfileSheet';
import firestore, {doc, getDoc} from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserPosts from '../../components/UserPosts';
import storage from '@react-native-firebase/storage';
import Modal from 'react-native-modal';
import ProfileSettings2 from '../../components/ProfileSettings2';
import EditProfileSheet2 from '../../components/EditProfileSheet2';
import {PanGestureHandler} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {SPRING_CONFIG} from '../../assets/utilities/reanimated-2';

const ProfileScreen = ({navigation}) => {
  const [editProfile, setEditProfile] = useState(false);
  const [userProfile, setUserProfile] = useState();
  const [username, setUsername] = useState();
  const [UID, setUID] = useState();
  const [profilePicURL, setProfilePicURL] = useState();
  const [headerURL, setHeaderURL] = useState();
  const [showModal, setShowModal] = useState(false);
  const dimensions = useWindowDimensions();
  const top = useSharedValue(dimensions.height);
  const top2 = useSharedValue(dimensions.height);
  const style = useAnimatedStyle(() => {
    return {
      top: withSpring(top.value, SPRING_CONFIG),
    };
  });
  const style2 = useAnimatedStyle(() => {
    return {
      top: withSpring(top2.value, SPRING_CONFIG),
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

  const fetchProfile = async () => {
    firestore()
      .collection('users')
      .doc(UID)
      .get()
      .then(querySnapshot => {
        console.log(querySnapshot);
        setUserProfile(querySnapshot.data());
      });

    firestore()
      .collection('usernames')
      .where('UID', '==', UID)
      .get()
      .then(querySnapshot => {
        console.log(querySnapshot);
        setUsername(querySnapshot);
      });
  };

  const getProfilePicURL = async () => {
    const url = await storage()
      .ref(UID + 'PFP')
      .getDownloadURL()
      .catch(error => {
        console.log(error);
      });
    setProfilePicURL(url);
  };

  const getHeaderURL = async () => {
    const url = await storage()
      .ref(UID + 'HEADER')
      .getDownloadURL()
      .catch(error => {
        console.log(error);
      });
    setHeaderURL(url);
  };

  useEffect(() => {
    if (UID) {
      fetchProfile();
      getProfilePicURL();
      getHeaderURL();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [UID]);

  const removeAutoPost = () => {
    firestore().collection('users').doc(UID).update({
      autoPost: false,
    });
    setShowModal(false);
  };

  //animations for profile settings
  const gestureHandler = useAnimatedGestureHandler({
    onStart(_, context) {
      context.startTop = top.value;
    },
    onActive(event, context) {
      top.value = context.startTop + event.translationY;
    },
    onEnd() {
      if (top.value > dimensions.height / 2.25 + 50) {
        top.value = dimensions.height;
      } else {
        top.value = dimensions.height / 2.25;
      }
    },
  });

  function handleSpring() {
    top.value = withSpring(dimensions.height / 2.25, SPRING_CONFIG);
  }

  const gestureHandler2 = useAnimatedGestureHandler({
    onStart(_, context) {
      context.startTop = top2.value;
    },
    onActive(event, context) {
      top2.value = context.startTop + event.translationY;
    },
    onEnd() {
      if (top2.value > dimensions.height / 10 + 50) {
        top2.value = dimensions.height;
      } else {
        top2.value = dimensions.height / 10;
      }
    },
  });

  function handleSpring2() {
    top2.value = withSpring(dimensions.height / 10, SPRING_CONFIG);
  }

  return (
    <>
      {userProfile && username ? (
        <>
          <View style={styles.container}>
            {headerURL ? (
              <>
                <Ionicons
                  onPress={handleSpring}
                  style={styles.menuIcon}
                  name={'menu'}
                  color={'white'}
                  size={36}
                />
                <Image style={styles.header} source={{uri: headerURL}} />
              </>
            ) : (
              <View style={styles.header}>
                <Ionicons
                  onPress={handleSpring}
                  style={styles.menuIcon}
                  name={'menu'}
                  color={'white'}
                  size={36}
                />
              </View>
            )}

            {profilePicURL ? (
              <View style={styles.profilePicURLContainer}>
                <Image
                  style={styles.profilePicURL}
                  source={{uri: profilePicURL}}
                />
              </View>
            ) : (
              <Circle style={styles.profilePic} width={75} height={75} />
            )}
            <View style={styles.profileLeft}>
              <Text style={styles.name}>
                {userProfile.displayName || username._docs[0].id}
              </Text>
              <Text style={styles.handle}>@{username._docs[0].id}</Text>
              <Text style={styles.bio}>{userProfile.bio}</Text>
            </View>
            <View style={styles.socialStatsContainer}>
              <View style={styles.followersContainer}>
                <Text style={styles.number}>{userProfile.followers}</Text>
                <Text style={styles.numberText}>Followers</Text>
              </View>
              <View style={styles.followingContainer}>
                <Text style={styles.number}>{userProfile.following}</Text>
                <Text style={styles.numberText}>Following</Text>
              </View>
            </View>
            <View style={styles.sortContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name={'albums'} color="white" size={28} />
                <TouchableOpacity>
                  <Text
                    onPress={() => setShowModal(true)}
                    style={styles.postInfoText}>
                    I didn't post this?
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={handleSpring2}
                style={styles.editProfileContainer}>
                <Text style={styles.editProfileText}>Edit profile</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.line} />
            <Modal isVisible={showModal}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTop}>
                  I don’t remember posting any of the tracks below, what’s up
                  with that?{' '}
                </Text>
                <Text style={styles.modalMiddle}>
                  By default, Musicplace posts the songs you listen to the most
                  - updated daily. If you’d like to opt out of this service and
                  only post songs manually, see below.
                </Text>
                <View style={styles.btnContainer}>
                  <TouchableOpacity
                    onPress={removeAutoPost}
                    style={styles.optOut}>
                    <Text style={styles.optOutText}>Opt out</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShowModal(false)}
                    style={styles.rock}>
                    <Text style={styles.rockText}>Let it rock</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            <UserPosts navigationProps={navigation} UIDProps={UID} />
          </View>
          <PanGestureHandler onGestureEvent={gestureHandler2}>
            <Animated.View
              style={[
                // eslint-disable-next-line react-native/no-inline-styles
                {
                  position: 'absolute',
                  backgroundColor: '#1C1C1C',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  alignItems: 'center',
                },
                style2,
              ]}>
              <EditProfileSheet2
                top2={top2}
                userProfile={userProfile}
                UID={UID}
              />
            </Animated.View>
          </PanGestureHandler>
          <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View
              style={[
                // eslint-disable-next-line react-native/no-inline-styles
                {
                  position: 'absolute',
                  backgroundColor: '#1C1C1C',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  alignItems: 'center',
                },
                style,
              ]}>
              <ProfileSettings2 top={top} UID={UID} />
            </Animated.View>
          </PanGestureHandler>
        </>
      ) : (
        <>
          <View style={styles.container} />
        </>
      )}
    </>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    backgroundColor: 'rgba(255, 8, 0, .25)',
    width: '100%',
    height: '22%',
  },
  menuIcon: {
    position: 'absolute',
    marginLeft: '85%',
    marginTop: '15%',
    zIndex: 1,
  },
  profilePic: {
    position: 'absolute',
    marginLeft: '5%',
    marginTop: '24%',
  },
  profilePicURLContainer: {
    position: 'absolute',
    marginLeft: '5%',
    marginTop: '30%',
    height: 75,
    width: 75,
    borderRadius: 100,
  },
  profilePicURL: {
    height: 100,
    width: 100,
    borderRadius: 100,
  },
  profileLeft: {
    marginLeft: '6%',
    marginTop: '15%',
  },
  name: {
    fontFamily: 'Inter-Bold',
    color: 'white',
    fontSize: 18,
  },
  handle: {
    fontFamily: 'Inter-Regular',
    color: Colors.greyOut,
    fontSize: 16,
    marginTop: '1%',
  },
  bio: {
    fontFamily: 'Inter-Regular',
    color: 'white',
    fontSize: 14,
    marginTop: '3%',
    lineHeight: 20,
  },
  socialStatsContainer: {
    position: 'absolute',
    marginLeft: '61%',
    marginTop: '48%',
    flexDirection: 'row',
  },
  number: {
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    fontSize: 16,
  },
  numberText: {
    fontFamily: 'Inter-SemiBold',
    color: Colors.greyOut,
    fontSize: 12,
    marginTop: '10%',
  },
  followersContainer: {
    alignItems: 'center',
  },
  followingContainer: {
    marginLeft: '13%',
    alignItems: 'center',
  },
  sortContainer: {
    flexDirection: 'row',
    marginLeft: '6%',
    marginTop: '8%',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '100%',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postInfoText: {
    color: Colors.greyOut,
    marginLeft: '10%',
    fontSize: 12,
    marginTop: '7%',
    textDecorationLine: 'underline',
    fontFamily: 'Inter-Medium',
  },
  editProfileContainer: {
    borderColor: Colors.greyOut,
    borderWidth: 0.5,
    paddingVertical: 6,
    paddingHorizontal: 24,
    marginRight: '12%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 9,
  },
  editProfileText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  line: {
    borderBottomColor: Colors.greyOut,
    width: '90%',
    borderWidth: 0.5,
    alignSelf: 'center',
    marginTop: '4%',
  },
  modalContainer: {
    height: '28%',
    width: '95%',
    backgroundColor: '#333333',
    paddingVertical: 24,
    borderRadius: 9,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTop: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    textAlign: 'center',
    color: 'white',
    width: '80%',
  },
  modalMiddle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    width: '80%',
    textAlign: 'center',
    color: 'white',
    lineHeight: 18,
  },
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: '3%',
    width: '80%',
  },
  optOut: {
    backgroundColor: 'rgba(255, 8, 0, .5)',
    paddingHorizontal: 30,
    paddingVertical: 6,
    borderRadius: 6,
  },
  optOutText: {
    color: 'white',
    fontFamily: 'inter-bold',
  },
  rock: {
    backgroundColor: Colors.red,
    paddingHorizontal: 30,
    paddingVertical: 6,
    borderRadius: 6,
  },
  rockText: {
    color: 'white',
    fontFamily: 'inter-bold',
  },
});
