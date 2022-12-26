import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import Colors from '../../assets/utilities/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import UserPosts from '../../components/UserPosts';
import {firebase} from '@react-native-firebase/firestore';
import HapticFeedback from 'react-native-haptic-feedback';
import FastImage from 'react-native-fast-image';

const ViewUserScreen = ({route, navigation}) => {
  const {profileID, UID, prevRoute, myUser} = route.params;
  const [userProfile, setUserProfile] = useState(null);
  const [header, setHeader] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [userName, setUserName] = useState(null);
  const [followersList, setFollowersList] = useState([]);

  useEffect(() => {
    if (profileID) {
      const profileDoc = firestore()
        .collection('users')
        .doc(profileID)
        .onSnapshot(documentSnapshot => {
          console.log('User data: ', documentSnapshot.data());
          setUserProfile(documentSnapshot.data());
          console.log(documentSnapshot.data().followersList);
          setFollowersList(documentSnapshot.data().followersList);
        });

      // Stop listening for updates when no longer required
      return () => profileDoc();
    }
  }, [profileID]);

  useEffect(() => {
    if (profileID) {
      const fetchUserProfile = async () => {
        const usernameDoc = await firestore()
          .collection('usernames')
          .where('UID', '==', profileID)
          .get();
        if (!usernameDoc.empty) {
          console.log(usernameDoc.docs[0]);
          setUserName(usernameDoc._docs[0]);
        }
      };
      const getImages = async () => {
        const headerURL = await storage()
          .ref(profileID + 'HEADER')
          .getDownloadURL()
          .catch(error => {
            console.log(error);
          });
        const profilePicURL = await storage()
          .ref(profileID + 'PFP')
          .getDownloadURL()
          .catch(error => {
            console.log(error);
          });
        setHeader(headerURL);
        setProfilePic(profilePicURL);
      };

      fetchUserProfile();
      getImages();
    }
  }, [profileID]);

  //follow a user logic
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
      // navigation.navigate('DirectMessageScreen', {
      //   profileID: profileID,
      //   UID: UID,
      //   myUser: myUser,
      //   userProfile: userProfile,
      //   prevRoute: 'ViewUserScreen',
      // });
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

  return (
    <View style={styles.container}>
      {userProfile ? (
        <View>
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
          <TouchableOpacity style={styles.backBtn} onPress={handleNav}>
            <Ionicons name={'chevron-back'} color="white" size={40} />
          </TouchableOpacity>
          {profilePic ? (
            <FastImage
              style={styles.PFP}
              source={{
                uri: profilePic,
                priority: FastImage.priority.high,
              }}
            />
          ) : (
            <View style={styles.PFP} />
          )}
          <View style={styles.userInfoContainer}>
            <Text style={styles.displayName}>
              {userProfile.displayName ? userProfile.displayName : 'n/a'}
            </Text>
            <Text style={styles.handle}>
              {userName ? `@${userName?.id}` : 'n/a'}
            </Text>
            <Text numberOfLines={2} style={styles.bio}>
              {userProfile.bio && userProfile.bio}
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
            <View style={styles.postHeader}>
              <Ionicons
                style={styles.albumIcon}
                name={'albums'}
                color="white"
                size={28}
              />
              <Text style={styles.postText}>Top Songs</Text>
            </View>
            {UID !== profileID && (
              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={styles.mailBtn}
                  onPress={() => {
                    navigation.navigate('DirectMessageScreen', {
                      profileID: profileID,
                      userProfile: userProfile,
                      myUser: myUser,
                      prevRoute: prevRoute,
                    });
                  }}>
                  <Ionicons name={'mail-outline'} color="white" size={18} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.followBtn}
                  onPress={followHandler}>
                  <Text style={styles.followText}>
                    {followersList?.includes(UID) ? 'Unfollow' : 'Follow'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <UserPosts navigation={navigation} profileID={profileID} UID={UID} />
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
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginLeft: 5,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mailBtn: {
    padding: 6,
    borderWidth: 0.5,
    borderRadius: 20,
    borderColor: Colors.greyOut,
  },
  followBtn: {
    borderColor: Colors.greyOut,
    borderWidth: 0.5,
    paddingVertical: 7,
    paddingHorizontal: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 9,
    marginLeft: 10,
  },
  followText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
});
