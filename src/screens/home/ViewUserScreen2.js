import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import Colors from '../../assets/utilities/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import UserPosts from '../../components/UserPosts';

const ViewUserScreen2 = ({route}) => {
  const {profileID, UID} = route.params;
  const [userProfile, setUserProfile] = useState(null);
  const [header, setHeader] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [userName, setUserName] = useState(null);

  //   useEffect(() => {
  //     if (profileID) {
  //       const profileDoc = firestore()
  //         .collection('Users')
  //         .doc(profileID)
  //         .onSnapshot(documentSnapshot => {
  //           console.log('User data: ', documentSnapshot.data());
  //         });

  //       // Stop listening for updates when no longer required
  //       return () => profileDoc();
  //     }
  //   }, [profileID]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const profileDoc = await firestore()
        .collection('users')
        .doc(profileID)
        .get();

      if (profileDoc.exists) {
        console.log(profileDoc);
        setUserProfile(profileDoc);
      }
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
  }, [profileID]);

  //follow a user logic
  async function followHandler(ID) {
    if (userProfile._data.followersList.includes(ID)) {
      firestore()
        .collection('users')
        .doc(profileID)
        .update({
          followersList: firestore.FieldValue.arrayRemove(UID),
        })
        .then(() => {
          console.log('removed follower!');
        });
      firestore()
        .collection('users')
        .doc(UID)
        .update({
          followingList: firestore.FieldValue.arrayRemove(profileID),
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
        })
        .then(() => {
          console.log('added follower!');
        });
      firestore()
        .collection('users')
        .doc(UID)
        .update({
          followingList: firestore.FieldValue.arrayUnion(profileID),
        })
        .then(() => {
          console.log('followed user!');
        });
    }
  }

  return (
    <View style={styles.container}>
      {userProfile ? (
        <View>
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
          {profilePic ? (
            <Image
              style={styles.PFP}
              source={{
                uri: profilePic,
              }}
            />
          ) : (
            <View style={styles.PFP} />
          )}
          <View style={styles.userInfoContainer}>
            <Text style={styles.displayName}>
              {userProfile._data.displayName
                ? userProfile._data.displayName
                : 'n/a'}
            </Text>
            <Text style={styles.handle}>
              {userName ? `@${userName?.id}` : 'n/a'}
            </Text>
            <Text numberOfLines={2} style={styles.bio}>
              {userProfile._data.bio && userProfile._data.bio}
            </Text>
          </View>
          <View style={styles.userStatsContainer}>
            <View style={styles.statsContainer}>
              <Text style={styles.stats}>{userProfile._data.followers}</Text>
              <Text style={styles.statsText}>Followers</Text>
            </View>
            <View style={styles.statsContainer}>
              <Text style={styles.stats}>{userProfile._data.following}</Text>
              <Text style={styles.statsText}>Following</Text>
            </View>
          </View>
          <View style={styles.dividerContainer}>
            <Ionicons
              style={styles.albumIcon}
              name={'albums'}
              color="white"
              size={28}
            />
            {UID !== profileID && (
              <TouchableOpacity
                style={styles.followBtn}
                onPress={() => followHandler(userProfile.id)}>
                <Text style={styles.followText}>Follow</Text>
              </TouchableOpacity>
            )}
          </View>
          <UserPosts UID={UID} />
        </View>
      ) : (
        <></>
      )}
    </View>
  );
};

export default ViewUserScreen2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    backgroundColor: 'red',
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
  },
  userInfoContainer: {
    position: 'absolute',
    top: 215,
    left: 28,
    // backgroundColor: 'red',
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
    // backgroundColor: 'green',
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
  followBtn: {
    borderColor: Colors.greyOut,
    borderWidth: 0.5,
    paddingVertical: 6,
    paddingHorizontal: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 9,
  },
  followText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
});
