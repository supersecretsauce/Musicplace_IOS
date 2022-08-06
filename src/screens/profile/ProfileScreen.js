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

const ProfileScreen = ({navigation}) => {
  const [postsTrue, setPostsTrue] = useState(true);
  const [editProfile, setEditProfile] = useState(false);
  const [userProfile, setUserProfile] = useState();
  const [username, setUsername] = useState();
  const [UID, setUID] = useState();
  const [profileSettings, setProfileSettings] = useState(false);

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
  return (
    <>
      {userProfile && username ? (
        <>
          <View style={styles.container}>
            <View style={styles.header}>
              <Ionicons
                onPress={() => setProfileSettings(!profileSettings)}
                style={styles.menuIcon}
                name={'menu'}
                color={'white'}
                size={36}
              />
            </View>
            <Circle style={styles.profilePic} width={75} height={75} />
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
              <View style={styles.likesContainer}>
                <Text style={styles.likeNumber}>{userProfile.likes}</Text>
                <Text style={styles.numberText}>Likes</Text>
              </View>
            </View>
            <View style={styles.sortContainer}>
              <View style={styles.iconContainer}>
                <Ionicons
                  onPress={() => setPostsTrue(true)}
                  name={'albums'}
                  color={postsTrue ? 'white' : 'grey'}
                  size={28}
                />
                <Ionicons
                  onPress={() => setPostsTrue(false)}
                  style={styles.likeIcon}
                  name={'heart'}
                  color={postsTrue ? 'grey' : 'white'}
                  size={28}
                />
              </View>
              <TouchableOpacity
                onPress={() => setEditProfile(!editProfile)}
                style={styles.editProfileContainer}>
                <Text style={styles.editProfileText}>Edit profile</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.line} />
            <UserPosts />
            {editProfile && (
              <EditProfileSheet
                displayNameProps={userProfile.name}
                editProps={setEditProfile}
                usernameProps={username}
                userProfileProps={userProfile}
                editProfileProps={setEditProfile}
              />
            )}
            {profileSettings && <ProfileSettings />}
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
    backgroundColor: 'green',
    width: '100%',
    height: '22%',
  },
  menuIcon: {
    marginLeft: '85%',
    marginTop: '15%',
  },
  profilePic: {
    position: 'absolute',
    marginLeft: '5%',
    marginTop: '24%',
  },
  profileLeft: {
    marginLeft: '6%',
    marginTop: '14%',
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
    marginLeft: '42%',
    marginTop: '48%',
    flexDirection: 'row',
  },
  number: {
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    fontSize: 16,
  },
  likeNumber: {
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    fontSize: 16,
    marginBottom: '11%',
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
  likesContainer: {
    marginLeft: '13%',
    alignItems: 'center',
  },
  sortContainer: {
    flexDirection: 'row',
    marginLeft: '6%',
    marginTop: '10%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeIcon: {
    marginLeft: '16%',
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
