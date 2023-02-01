import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
} from 'react-native';
import React, {useEffect, useState, useContext} from 'react';
import firestore from '@react-native-firebase/firestore';
import Colors from '../../assets/utilities/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ViewingProfileDetails from '../../components/ViewingProfileDetails';
import {firebase} from '@react-native-firebase/firestore';
import HapticFeedback from 'react-native-haptic-feedback';
import FastImage from 'react-native-fast-image';
import {Context} from '../../context/Context';
import {Toast} from 'react-native-toast-message/lib/src/Toast';
import {mixpanel} from '../../../mixpanel';
const ViewUserScreen = ({route, navigation}) => {
  const {profileID, UID, prevRoute, myUser} = route.params;
  const {viewingSwiperRef, swiperIndex} = useContext(Context);
  const [userProfile, setUserProfile] = useState(null);
  const [followersList, setFollowersList] = useState([]);
  const [highlightMostPlayed, setHighlightMostPlayed] = useState(true);
  const [highlightLikes, setHighlightLikes] = useState(false);

  useEffect(() => {
    if (profileID) {
      const profileDoc = firestore()
        .collection('users')
        .doc(profileID)
        .onSnapshot(documentSnapshot => {
          if (documentSnapshot == null) {
            return;
          }
          console.log('User data: ', documentSnapshot.data());
          setUserProfile(documentSnapshot.data());
          console.log(documentSnapshot.data().followersList);
          setFollowersList(documentSnapshot.data().followersList);
        });

      // Stop listening for updates when no longer required
      return () => profileDoc();
    }
  }, [profileID]);

  async function followHandler() {
    HapticFeedback.trigger('impactSoft');
    const increment = firebase.firestore.FieldValue.increment(1);
    const decrement = firebase.firestore.FieldValue.increment(-1);
    if (followersList.includes(UID)) {
      firestore()
        .collection('users')
        .doc(profileID)
        .update({
          followersList: firestore.FieldValue.arrayRemove(UID),
          followers: decrement,
        })
        .then(() => {
          console.log('removed follower!');
        });
      firestore()
        .collection('users')
        .doc(UID)
        .update({
          followingList: firestore.FieldValue.arrayRemove(profileID),
          following: decrement,
        })
        .then(() => {
          console.log('unfollowed user!');
        });
    } else {
      mixpanel.track('New Follow');
      firestore()
        .collection('users')
        .doc(profileID)
        .update({
          followersList: firestore.FieldValue.arrayUnion(UID),
          followers: increment,
        })
        .then(() => {
          console.log('added follower!');
        });
      firestore()
        .collection('users')
        .doc(UID)
        .update({
          followingList: firestore.FieldValue.arrayUnion(profileID),
          following: increment,
        })
        .then(() => {
          console.log('followed user!');
        });
      firestore()
        .collection('users')
        .doc(profileID)
        .collection('activity')
        .add({
          UID: UID,
          from: 'user',
          type: 'follow',
          timestamp: firestore.FieldValue.serverTimestamp(),
          songInfo: null,
          handle: myUser?.handle ? myUser?.handle : null,
          displayName: myUser.displayName,
          pfpURL: myUser?.pfpURL ? myUser?.pfpURL : null,
          notificationRead: false,
        })
        .then(() => {
          console.log('added doc to parent user');
        });
    }
  }

  function handleNav() {
    if (prevRoute === 'search') {
      navigation.navigate('AddFriends', {
        myUser: myUser,
      });
    } else if (prevRoute === 'DirectMessageScreen') {
      navigation.goBack();
    } else if (prevRoute === 'ActivityScreen') {
      navigation.navigate('ActivityScreen');
    } else if (prevRoute === 'ViewAllActivityScreen') {
      navigation.goBack();
    } else if (prevRoute === 'FeedScreen') {
      navigation.navigate('FeedScreen');
    } else {
      navigation.navigate('HomeScreen');
    }
  }

  function showMostPlayed() {
    if (swiperIndex === 0) {
      HapticFeedback.trigger('selection');
      viewingSwiperRef.current.scrollBy(1);
      setHighlightLikes(true);
      setHighlightMostPlayed(false);
      console.log('showing likes');
    }
  }

  function showLikes() {
    if (swiperIndex === 1) {
      HapticFeedback.trigger('selection');
      viewingSwiperRef.current.scrollBy(-1);
      setHighlightLikes(false);
      setHighlightMostPlayed(true);
    }
  }

  function handleMessageNav() {
    if (
      userProfile.blockList.includes(UID) ||
      myUser.blockList.includes(profileID)
    ) {
      Toast.show({
        type: 'error',
        text1: 'Unable to message this user.',
      });
      return;
    } else {
      navigation.navigate('DMDrawerRoute', {
        screen: 'DirectMessageScreen',
        params: {
          profileID: profileID,
          userProfile: userProfile,
          myUser: myUser,
          prevRoute: prevRoute,
        },
      });
    }
  }

  return (
    <View style={styles.container}>
      {userProfile ? (
        <View>
          {userProfile?.headerURL ? (
            <FastImage
              style={styles.header}
              source={{
                uri: userProfile?.headerURL,
                priority: FastImage.priority.high,
              }}
            />
          ) : (
            <View style={styles.header} />
          )}
          <TouchableOpacity style={styles.backBtn} onPress={handleNav}>
            <Ionicons name={'chevron-back'} color="white" size={40} />
          </TouchableOpacity>
          {userProfile?.pfpURL ? (
            <FastImage
              style={styles.PFP}
              source={{
                uri: userProfile?.pfpURL,
                priority: FastImage.priority.high,
              }}
            />
          ) : (
            <View style={styles.PFP} />
          )}
          <View style={styles.userInfoContainer}>
            <Text style={styles.displayName}>
              {userProfile?.displayName ? userProfile.displayName : 'n/a'}
            </Text>
            <Text style={styles.handle}>
              {userProfile?.handle ? `@${userProfile?.handle}` : 'n/a'}
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
          <View style={styles.middleContainer}>
            <View style={styles.middleSection}>
              <TouchableOpacity
                style={styles.middleBtn}
                onPress={followHandler}>
                <Text style={styles.middleText}>
                  {followersList?.includes(UID) ? 'Unfollow' : 'Follow'}
                </Text>
              </TouchableOpacity>
              <TouchableWithoutFeedback onPress={showLikes}>
                <View style={styles.contentContainer}>
                  <Ionicons
                    name={'headset'}
                    color={highlightMostPlayed ? 'white' : 'grey'}
                    size={24}
                  />

                  {/* <Text style={styles.contentText}>Likes</Text> */}
                </View>
              </TouchableWithoutFeedback>
            </View>
            <View style={styles.middleSection}>
              <TouchableOpacity
                style={styles.middleBtn}
                onPress={handleMessageNav}>
                <Text style={styles.middleText}>Message</Text>
              </TouchableOpacity>
              <TouchableWithoutFeedback onPress={showMostPlayed}>
                <View style={styles.contentContainer}>
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
          <ViewingProfileDetails
            navigation={navigation}
            profileID={profileID}
            UID={UID}
            setHighlightMostPlayed={setHighlightMostPlayed}
            setHighlightLikes={setHighlightLikes}
          />
        </View>
      ) : (
        <></>
      )}
    </View>
  );
};

export default ViewUserScreen;

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
  backBtn: {
    position: 'absolute',
    top: '5%',
    left: 22,
  },
  PFP: {
    position: 'absolute',
    left: 26,
    top: 113,
    width: 94,
    height: 94,
    borderRadius: 94,
    backgroundColor: Colors.red,
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
  middleContainer: {
    position: 'absolute',
    top: 280,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 335,
    alignSelf: 'center',
  },
  middleSection: {
    height: 70,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  middleBtn: {
    backgroundColor: '#393939',
    width: 162,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 9,
  },
  middleText: {
    color: 'white',
    fontFamily: 'Inter-Medium',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentText: {
    fontFamily: 'Inter-Regular',
    color: 'white',
    marginLeft: 5,
  },
});
