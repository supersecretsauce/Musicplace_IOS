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
import Colors from '../../assets/utilities/Colors';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MyPosts from '../../components/MyPosts';
import storage from '@react-native-firebase/storage';
import Modal from 'react-native-modal';
import ProfileSettings from '../../components/ProfileSettings';
import EditProfileSheet from '../../components/EditProfileSheet';
import {PanGestureHandler} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {SPRING_CONFIG} from '../../assets/utilities/reanimated-2';
const ProfileScreen = ({navigation}) => {
  const [userProfile, setUserProfile] = useState();
  const [username, setUsername] = useState();
  const [UID, setUID] = useState();
  const [bio, setBio] = useState(null);
  const [header, setHeader] = useState(null);
  const [PFP, setPFP] = useState(null);
  const [displayName, setDisplayName] = useState(null);
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
        setUID(userUID);
      }
    };
    checkforUID();
  }, []);

  useEffect(() => {
    if (UID) {
      const subscriber = firestore()
        .collection('users')
        .doc(UID)
        .onSnapshot(documentSnapshot => {
          console.log(UID);
          console.log(documentSnapshot.data());
          setUserProfile(documentSnapshot.data());
          setDisplayName(documentSnapshot.data().displayName);
          setBio(documentSnapshot.data().bio);
        });

      // Stop listening for updates when no longer required
      return () => subscriber();
    }
  }, [UID]);

  const getProfilePicURL = async () => {
    const url = await storage()
      .ref(UID + 'PFP')
      .getDownloadURL()
      .catch(error => {
        console.log(error);
      });
    console.log('url', url);
    setPFP(url);
  };

  const getHeaderURL = async () => {
    const url = await storage()
      .ref(UID + 'HEADER')
      .getDownloadURL()
      .catch(error => {
        console.log(error);
      });
    setHeader(url);
  };

  useEffect(() => {
    if (UID) {
      getProfilePicURL();
      getHeaderURL();
      firestore()
        .collection('usernames')
        .where('UID', '==', UID)
        .get()
        .then(querySnapshot => {
          console.log(querySnapshot);
          setUsername(querySnapshot);
        });
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
      {userProfile ? (
        <View style={styles.container}>
          {header ? (
            <Image
              style={styles.header}
              source={{
                uri: header,
              }}
            />
          ) : (
            <View style={styles.header} />
          )}
          {PFP ? (
            <Image
              style={styles.PFP}
              source={{
                uri: PFP,
              }}
            />
          ) : (
            <View style={styles.PFP} />
          )}
          <TouchableOpacity style={styles.settingsIcon} onPress={handleSpring}>
            <Ionicons color={'white'} name="settings" size={30} />
          </TouchableOpacity>
          <View style={styles.userInfoContainer}>
            <Text style={styles.displayName}>
              {displayName ? displayName : userProfile.displayName}
            </Text>
            <Text style={styles.handle}>
              {username && `@${username?._docs[0]?.id}`}
            </Text>
            <Text numberOfLines={2} style={styles.bio}>
              {bio && bio}
            </Text>
          </View>
          <View style={styles.userStatsContainer}>
            <View style={styles.statsContainer}>
              <Text style={styles.stats}>{userProfile.followers}</Text>
              <Text style={styles.statsText}>Followers</Text>
            </View>
            <View style={styles.statsContainer}>
              <Text style={styles.stats}>{userProfile.following}</Text>
              <Text style={styles.statsText}>Following</Text>
            </View>
          </View>
          <View style={styles.dividerContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name={'albums'} color="white" size={28} />
              <Text style={styles.postText}>Posts</Text>
              <TouchableOpacity
                style={styles.helpIcon}
                onPress={() => setShowModal(!showModal)}>
                <Ionicons name={'help-circle-outline'} color="grey" size={19} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={handleSpring2}
              style={styles.editProfileContainer}>
              <Text style={styles.editProfileText}>Edit profile</Text>
            </TouchableOpacity>
          </View>
          <MyPosts UID={UID} navigation={navigation} />
          <Modal isVisible={showModal}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTop}>
                I don’t remember posting any of the tracks below, what’s up with
                that?{' '}
              </Text>
              <Text style={styles.modalMiddle}>
                By default, Musicplace posts the songs you listen to the most -
                updated daily. If you’d like to opt out of this service and only
                post songs manually, you can opt out below.
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
              <EditProfileSheet
                top2={top2}
                userProfile={userProfile}
                UID={UID}
                setPFP={setPFP}
                PFP={PFP}
                header={header}
                setHeader={setHeader}
                setDisplayName={setDisplayName}
                displayName={displayName}
                bio={bio}
                setBio={setBio}
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
              <ProfileSettings top={top} UID={UID} />
            </Animated.View>
          </PanGestureHandler>
        </View>
      ) : (
        <></>
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
    backgroundColor: 'rgba(255, 8, 0, 0.7)',
    height: 160,
    width: '100%',
  },
  PFP: {
    position: 'absolute',
    left: 26,
    top: 113,
    width: 94,
    height: 94,
    borderRadius: 94,
    backgroundColor: 'red',
  },
  settingsIcon: {
    position: 'absolute',
    right: 20,
    top: 55,
  },
  userInfoContainer: {
    position: 'absolute',
    top: 215,
    left: 28,
  },
  displayName: {
    fontFamily: 'Inter-Bold',
    color: 'white',
    fontSize: 18,
  },
  handle: {
    fontFamily: 'Inter-Regular',
    color: Colors.greyOut,
    fontSize: 14,
    marginTop: 5,
  },
  bio: {
    fontFamily: 'Inter-Regular',
    color: 'white',
    fontSize: 14,
    marginTop: 10,
    lineHeight: 20,
    minWidth: 320,
    maxWidth: 320,
  },
  userStatsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    justifyContent: 'space-between',
    right: 25,
    top: 175,
    width: 130,
  },
  statsContainer: {
    alignItems: 'center',
  },
  stats: {
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    fontSize: 16,
  },
  statsText: {
    fontFamily: 'Inter-SemiBold',
    color: Colors.greyOut,
    fontSize: 12,
    marginTop: '10%',
  },
  dividerContainer: {
    position: 'absolute',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    top: 325,
    width: '88%',
    borderBottomColor: 'grey',
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    marginLeft: 10,
  },
  helpIcon: {
    left: 6,
  },
  editProfileContainer: {
    borderColor: Colors.greyOut,
    borderWidth: 0.5,
    paddingVertical: 6,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 9,
  },
  editProfileText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  modalContainer: {
    height: 240,
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
