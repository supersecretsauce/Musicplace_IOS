import {StyleSheet, Text, View, SafeAreaView, Image} from 'react-native';
import React, {useState, useEffect, useContext} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Circle from '../../assets/img/circle.svg';
import Colors from '../../assets/utilities/Colors';
import {TouchableOpacity} from 'react-native-gesture-handler';
import EditProfileSheet from '../../components/EditProfileSheet';
import firestore from '@react-native-firebase/firestore';
import {Context} from '../../context/Context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserPosts from '../../components/UserPosts';
import ProfileSettings from '../../components/ProfileSettings';
import storage from '@react-native-firebase/storage';

const ProfileScreen = ({navigation}) => {
  const [editProfile, setEditProfile] = useState(false);
  const [userProfile, setUserProfile] = useState();
  const [username, setUsername] = useState();
  const [UID, setUID] = useState();
  const [profileSettings, setProfileSettings] = useState(false);
  const [profilePicURL, setProfilePicURL] = useState();
  const [headerURL, setHeaderURL] = useState();

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
      console.log(UID);
      const fetchProfile = async () => {
        firestore()
          .collection('users')
          .doc(UID)
          .onSnapshot(documentSnapshot => {
            console.log('User data: ', documentSnapshot.data());
            setUserProfile(documentSnapshot.data());
          });
      };
      fetchProfile();
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

  return (
    <>
      {userProfile && username ? (
        <>
          <View style={styles.container}>
            {headerURL ? (
              <>
                <Ionicons
                  onPress={() => setProfileSettings(!profileSettings)}
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
                  onPress={() => setProfileSettings(!profileSettings)}
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
              </View>
              <TouchableOpacity
                onPress={() => setEditProfile(!editProfile)}
                style={styles.editProfileContainer}>
                <Text style={styles.editProfileText}>Edit profile</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.line} />
            <UserPosts UIDProps={UID} />
            {editProfile && (
              <EditProfileSheet
                displayNameProps={userProfile.name}
                editProps={setEditProfile}
                usernameProps={username}
                userProfileProps={userProfile}
                editProfileProps={setEditProfile}
                UIDProps={UID}
                SetProfilePicURLProps={setProfilePicURL}
                ProfilePicURLProps={profilePicURL}
                SetHeaderURLProps={setHeaderURL}
                headerURLProps={headerURL}
              />
            )}
            {profileSettings && <ProfileSettings UIDProps={UID} />}
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
});
