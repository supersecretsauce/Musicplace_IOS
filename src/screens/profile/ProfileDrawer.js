import {StyleSheet, useWindowDimensions, Linking} from 'react-native';
import React, {useContext} from 'react';
import {DrawerContext} from '../../context/DrawerContext';
import {Context} from '../../context/Context';
import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import {SPRING_CONFIG} from '../../assets/utilities/reanimated-2';
import {withSpring} from 'react-native-reanimated';
import {authorize} from 'react-native-app-auth';
import {spotConfig} from '../../../SpotifyConfig';
import firestore from '@react-native-firebase/firestore';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import functions from '@react-native-firebase/functions';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Discord from '../../assets/img/discord.svg';
import Colors from '../../assets/utilities/Colors';
import Spotify from '../../assets/img/spotify.svg';
const ProfileDrawer = ({navigation}) => {
  const {editTopValue} = useContext(DrawerContext);
  const {
    setHasSpotify,
    hasSpotify,
    UID,
    setUserLogin,
    setCurrentTrack,
    setFeed,
  } = useContext(Context);
  const dimensions = useWindowDimensions();

  function handleEditProfile() {
    navigation.closeDrawer();
    editTopValue.value = withSpring(dimensions.height / 10, SPRING_CONFIG);
  }

  const handleDiscord = async () => {
    await Linking.openURL('https://discord.gg/q6vNAB63SQ');
  };

  const handleIG = async () => {
    await Linking.openURL('https://www.instagram.com/musicplaceapp/');
  };

  const handleTwitter = async () => {
    await Linking.openURL('https://twitter.com/musicplaceapp');
  };

  const logout = () => {
    auth()
      .signOut()
      .then(() => {
        console.log('User signed out!');
        try {
          setUserLogin(false);
          setCurrentTrack(null);
          AsyncStorage.clear();
        } catch (error) {
          console.log(error);
        }
      })
      .catch(e => {
        console.log(e);
      });
  };

  const handleSpotify = () => {
    if (hasSpotify === false) {
      const connectToSpotify = async () => {
        try {
          const authState = await authorize(spotConfig);
          await AsyncStorage.setItem('hasSpotify', 'true');
          firestore()
            .collection('users')
            .doc(UID)
            .update({
              spotifyAccessToken: authState.accessToken,
              spotifyAccessTokenExpirationDate:
                authState.accessTokenExpirationDate,
              spotifyRefreshToken: authState.refreshToken,
              spotifyTokenType: authState.tokenType,
              connectedWithSpotify: true,
            })
            .then(() => {
              axios
                .get(`http://167.99.22.22/update/top-tracks?userId=${UID}`)
                .then(() => {
                  console.log('finished getting spotify library');
                  setHasSpotify(true);
                })
                .catch(e => {
                  console.log(e);
                });
            });
        } catch (error) {
          console.log(error);
        }
      };
      connectToSpotify();
    } else {
      const disconnectFromSpotify = async () => {
        try {
          await Linking.openURL('https://www.spotify.com/us/account/apps/');
          await AsyncStorage.setItem('hasSpotify', 'false');
          setHasSpotify(false);
          firestore().collection('users').doc(UID).update({
            spotifyAccessToken: null,
            spotifyAccessTokenExpirationDate: null,
            spotifyRefreshToken: null,
            spotifyTokenType: null,
            connectedWithSpotify: false,
          });
        } catch (error) {
          console.log(error);
        }
      };
      disconnectFromSpotify();
    }
  };

  const deleteAccount = async () => {
    try {
      firestore()
        .collection('usernames')
        .where('UID', '==', UID)
        .get()
        .then(resp => {
          let docRef = resp.docs[0].id;
          firestore()
            .collection('usernames')
            .doc(docRef)
            .delete()
            .then(() => {
              setUserLogin(false);
              setFeed(null);
              AsyncStorage.clear();
              functions()
                .httpsCallable('deleteAccount')()
                .then(() => {
                  console.log('user deleted');
                })
                .catch(e => {
                  console.log(e);
                });
            });
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <DrawerContentScrollView contentContainerStyle={styles.drawer}>
      {/* <DrawerItemList {...props} /> */}
      <DrawerItem
        label="Edit Profile"
        icon={() => (
          <Ionicons color={'white'} size={24} name={'person-circle'} />
        )}
        labelStyle={styles.drawerItem}
        onPress={handleEditProfile}
      />
      <DrawerItem
        label="Support"
        icon={() => <Discord size={24} />}
        labelStyle={styles.drawerItem}
        onPress={handleDiscord}
      />

      <DrawerItem
        label="Instagram"
        icon={() => (
          <Ionicons name={'logo-instagram'} color={'#BB2259'} size={24} />
        )}
        labelStyle={styles.drawerItem}
        onPress={handleIG}
      />
      <DrawerItem
        label="Twitter"
        icon={() => (
          <Ionicons name={'logo-twitter'} color={'#1D9BF0'} size={24} />
        )}
        labelStyle={styles.drawerItem}
        onPress={handleTwitter}
      />
      <DrawerItem
        label="Logout"
        icon={() => <Ionicons name={'exit'} color={'white'} size={24} />}
        labelStyle={styles.drawerItem}
        onPress={logout}
      />
      <DrawerItem
        label={hasSpotify ? 'Disconnect Spotify' : 'Connect Spotify'}
        icon={() => <Spotify height={21} width={21} />}
        labelStyle={styles.drawerItem}
        onPress={handleSpotify}
      />

      <DrawerItem
        label="Delete Account"
        icon={() => (
          <Ionicons name={'remove-circle'} color={'white'} size={23} />
        )}
        labelStyle={styles.drawerItem}
        onPress={deleteAccount}
      />
    </DrawerContentScrollView>
  );
};

export default ProfileDrawer;

const styles = StyleSheet.create({
  drawer: {
    backgroundColor: 'black',
    height: '100%',
  },
  drawerItem: {
    color: 'white',
    fontFamily: 'SFProRounded-Bold',
    fontSize: 17,
    marginLeft: -20,
  },
});
