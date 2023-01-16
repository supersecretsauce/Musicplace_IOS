import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useWindowDimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import React, {useState, useEffect, useContext} from 'react';
import {DrawerContext} from '../../context/DrawerContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../assets/utilities/Colors';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MyPosts from '../../components/MyPosts';
import EditProfileSheet from '../../components/EditProfileSheet';
import {PanGestureHandler} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {SPRING_CONFIG} from '../../assets/utilities/reanimated-2';
import FastImage from 'react-native-fast-image';
import MyProfileDetails from '../../components/MyProfileDetails';

const ProfileScreen = ({navigation}) => {
  const {editTopValue, swiperRef, swiperIndex} = useContext(DrawerContext);
  const [userProfile, setUserProfile] = useState();
  const [username, setUsername] = useState();
  const [UID, setUID] = useState();
  const [header, setHeader] = useState(null);
  const [PFP, setPFP] = useState(null);
  const [displayName, setDisplayName] = useState(null);
  const [highlightMostPlayed, setHighlightMostPlayed] = useState(true);
  const [highlightLikes, setHighlightLikes] = useState(false);
  const dimensions = useWindowDimensions();
  const style2 = useAnimatedStyle(() => {
    return {
      top: withSpring(editTopValue.value, SPRING_CONFIG),
    };
  });

  useEffect(() => {
    console.log(swiperRef);
  }, [swiperRef]);

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
          console.log(documentSnapshot);
          if (documentSnapshot.exists) {
            setUserProfile(documentSnapshot.data());
            setDisplayName(documentSnapshot.data().displayName);
            setUsername(documentSnapshot.data().handle);
            setPFP(documentSnapshot.data().pfpURL);
            setHeader(documentSnapshot.data().headerURL);
          }
        });

      // Stop listening for updates when no longer required
      return () => subscriber();
    }
  }, [UID]);

  function handleSpring() {
    // top.value = withSpring(dimensions.height / 2.25, SPRING_CONFIG);
    navigation.toggleDrawer();
  }

  const gestureHandler2 = useAnimatedGestureHandler({
    onStart(_, context) {
      context.startTop = editTopValue.value;
    },
    onActive(event, context) {
      editTopValue.value = context.startTop + event.translationY;
    },
    onEnd() {
      if (editTopValue.value > dimensions.height / 10 + 50) {
        editTopValue.value = dimensions.height;
      } else {
        editTopValue.value = dimensions.height / 10;
      }
    },
  });

  function showLikes() {
    if (swiperIndex === 1) {
      swiperRef.current.scrollBy(-1);
    }
  }

  function showMostPlayed() {
    if (swiperIndex === 0) {
      swiperRef.current.scrollBy(1);
    }
  }

  return (
    <>
      {userProfile ? (
        <View style={styles.container}>
          {header ? (
            <FastImage
              style={styles.header}
              source={{
                uri: header,
                priority: FastImage.priority.high,
              }}
            />
          ) : (
            <View style={styles.header} />
          )}
          {PFP ? (
            <FastImage
              style={styles.PFP}
              source={{
                uri: PFP,
                priority: FastImage.priority.high,
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
            <Text style={styles.handle}>{username && `@${username}`}</Text>
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
          <View style={styles.middleContainer}>
            <TouchableOpacity
              style={styles.editProfileBtn}
              onPress={() => {
                editTopValue.value = withSpring(
                  dimensions.height / 10,
                  SPRING_CONFIG,
                );
              }}>
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
            <View style={styles.middleIcons}>
              <TouchableWithoutFeedback
                style={styles.iconContainer}
                onPress={showLikes}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={'headset'}
                    color={highlightMostPlayed ? 'white' : 'grey'}
                    size={24}
                  />

                  {/* <Text style={styles.contentText}>Likes</Text> */}
                </View>
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback onPress={showMostPlayed}>
                <View style={styles.iconContainer}>
                  {/* <Text style={styles.contentText}>Most played</Text> */}
                  <Ionicons
                    name={'heart'}
                    color={highlightLikes ? 'white' : 'grey'}
                    size={24}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
          <View
            // eslint-disable-next-line react-native/no-inline-styles
            style={{
              borderBottomColor: highlightMostPlayed ? 'white' : 'grey',
              borderBottomWidth: 0.25,
              width: '50%',
              position: 'absolute',
              top: 358,
              left: 0,
            }}
          />
          <View
            // eslint-disable-next-line react-native/no-inline-styles
            style={{
              borderBottomColor: highlightLikes ? 'white' : 'grey',
              borderBottomWidth: 0.25,
              width: '50%',
              position: 'absolute',
              top: 358,
              right: 0,
            }}
          />
          <MyProfileDetails
            setHighlightMostPlayed={setHighlightMostPlayed}
            setHighlightLikes={setHighlightLikes}
            UID={UID}
            navigation={navigation}
          />
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
                editTopValue={editTopValue}
                userProfile={userProfile}
                UID={UID}
                setPFP={setPFP}
                PFP={PFP}
                header={header}
                setHeader={setHeader}
                setDisplayName={setDisplayName}
                displayName={displayName}
              />
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
  userContentContainer: {
    position: 'absolute',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    top: 325,
    width: '88%',
    borderBottomColor: Colors.greyBtn,
    borderBottomWidth: 1,
    // paddingBottom: 13,
    // paddingVertical: 13,
    // backgroundColor: 'red',
  },
  mostPlayedContainer: {
    paddingVertical: 13,
    // backgroundColor: 'blue',
    width: '45%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mostPlayed: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    // marginLeft: 5,
  },
  likesContainer: {
    // backgroundColor: 'red',
    paddingVertical: 13,
    width: '45%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  likes: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    // marginLeft: '5%',
  },
  helpIcon: {
    left: 6,
  },
  middleContainer: {
    position: 'absolute',
    top: 280,
    width: 335,
    alignSelf: 'center',
  },

  editProfileBtn: {
    backgroundColor: '#393939',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 9,
  },
  editProfileText: {
    color: 'white',
  },
  middleIcons: {
    // backgroundColor: 'red',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    width: '50%',
    paddingTop: 14,
    // backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
