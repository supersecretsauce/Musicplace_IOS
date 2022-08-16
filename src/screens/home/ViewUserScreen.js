import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import React, {useEffect, useState} from 'react';
import Colors from '../../assets/utilities/Colors';
import Circle from '../../assets/img/circle.svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import UserPosts from '../../components/UserPosts';
import {firebase} from '@react-native-firebase/firestore';

const ViewUserScreen = ({route, navigation}) => {
  const [userInfo, setUserInfo] = useState();
  const [username, setUsername] = useState();
  const [profilePicURL, setProfilePicURL] = useState();
  const [headerURL, setHeaderURL] = useState();
  const [followersArray, setFollowersArray] = useState();
  const [following, setFollowing] = useState();
  const {UID, myUID} = route.params;

  useEffect(() => {
    if (UID) {
      console.log(UID);
      const fetchUserTracks = async () => {
        firestore()
          .collection('users')
          .doc(UID)
          .onSnapshot(documentSnapshot => {
            setUserInfo(documentSnapshot.data());
          });
      };
      fetchUserTracks();
    }
  }, [UID]);

  useEffect(() => {
    if (UID) {
      firestore()
        .collection('usernames')
        .where('UID', '==', UID)
        .get()
        .then(querySnapshot => {
          console.log(querySnapshot);
          setUsername(querySnapshot);
        });
    }
  }, [UID]);

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
      };
      getProfilePicURL();
    }
  }, [UID]);

  useEffect(() => {
    if (UID) {
      const getHeaderURL = async () => {
        const url = await storage()
          .ref(UID + 'HEADER')
          .getDownloadURL()
          .catch(error => {
            console.log(error);
          });
        setHeaderURL(url);
      };
      getHeaderURL();
    }
  }, [UID]);

  //get followers
  useEffect(() => {
    if (UID) {
      const fetchUserTracks = async () => {
        firestore()
          .collection('users')
          .doc(UID)
          .onSnapshot(documentSnapshot => {
            setFollowersArray(documentSnapshot.data().followersList);
          });
      };
      fetchUserTracks();
    }
  }, []);

  useEffect(() => {
    if (followersArray === null) {
      setFollowing(false);
    } else if (followersArray) {
      if (followersArray.includes(myUID)) {
        setFollowing(true);
      } else {
        setFollowing(false);
      }
    }
  }, [followersArray, myUID]);

  const followHandler = () => {
    const increment = firebase.firestore.FieldValue.increment(1);
    const minusIncrement = firebase.firestore.FieldValue.increment(-1);

    if (UID && myUID) {
      if (followersArray === null || !followersArray.includes(myUID)) {
        firestore()
          .collection('users')
          .doc(UID)
          .set(
            {
              followers: increment,
              followersList: firebase.firestore.FieldValue.arrayUnion(myUID),
            },
            {merge: true},
          )
          .then(() => {
            console.log('User updated!');
          });
        firestore()
          .collection('users')
          .doc(myUID)
          .set(
            {
              following: increment,
              followingList: firebase.firestore.FieldValue.arrayUnion(UID),
            },
            {merge: true},
          )
          .then(() => {
            console.log('User updated!');
          });
      } else if (followersArray.includes(myUID)) {
        //do something
        firestore()
          .collection('users')
          .doc(UID)
          .set(
            {
              followers: minusIncrement,
              followersList: firebase.firestore.FieldValue.arrayRemove(myUID),
            },
            {merge: true},
          )
          .then(() => {
            console.log('User updated!');
          });
        firestore()
          .collection('users')
          .doc(myUID)
          .set(
            {
              following: minusIncrement,
              followingList: firebase.firestore.FieldValue.arrayRemove(UID),
            },
            {merge: true},
          )
          .then(() => {
            console.log('User updated!');
          });
      }
    }
  };

  return (
    <>
      {userInfo ? (
        <>
          <View style={styles.container}>
            <Image style={styles.header} source={{uri: headerURL}} />
            <Ionicons
              onPress={() => navigation.navigate('HomeScreen')}
              style={styles.menuIcon}
              name={'chevron-back'}
              color={'white'}
              size={40}
            />
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
              {username && (
                <>
                  <Text style={styles.name}>
                    {userInfo.displayName || username._docs[0].id}
                  </Text>
                  <Text style={styles.handle}>@{username._docs[0].id}</Text>
                </>
              )}

              <Text style={styles.bio}>{userInfo.bio}</Text>
            </View>
            <View style={styles.socialStatsContainer}>
              <View style={styles.followersContainer}>
                <Text style={styles.number}>{userInfo.followers}</Text>
                <Text style={styles.numberText}>Followers</Text>
              </View>
              <View style={styles.followingContainer}>
                <Text style={styles.number}>{userInfo.following}</Text>
                <Text style={styles.numberText}>Following</Text>
              </View>
            </View>
            <View style={styles.sortContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name={'albums'} color="white" size={28} />
              </View>
              <TouchableOpacity
                onPress={followHandler}
                style={styles.editProfileContainer}>
                <Text style={styles.editProfileText}>
                  {following ? 'Unfollow' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.line} />
            <UserPosts UIDProps={UID} />
          </View>
        </>
      ) : (
        <>
          <View style={styles.container} />
        </>
      )}
    </>
  );
};

export default ViewUserScreen;

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
    marginLeft: '4.5%',
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
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  editProfileContainer: {
    borderColor: Colors.greyOut,
    borderWidth: 0.5,
    paddingVertical: 6,
    paddingHorizontal: 50,
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
});
