import {StyleSheet, Text, View, Linking, TouchableOpacity} from 'react-native';
import React, {useEffect, useState, useContext} from 'react';
import Colors from '../assets/utilities/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Spotify from '../assets/img/spotify.svg';
import Discord from '../assets/img/discord.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {authorize} from 'react-native-app-auth';
import auth from '@react-native-firebase/auth';
import {Context} from '../context/Context';
import firestore from '@react-native-firebase/firestore';

const spotConfig = {
  clientId: '501638f5cfb04abfb61d039e370c5d99', // available on the app page
  clientSecret: '16f92a6d7e9a4180b29af25bf012e6fe', // click "show client secret" to see this
  redirectUrl: 'musicplace-ios:/musicplace-ios-login', // the redirect you defined after creating the app
  scopes: [
    'user-read-email',
    'playlist-modify-public',
    'user-read-private',
    'user-library-read',
    'user-follow-read',
  ], // the scopes you need to access
  serviceConfiguration: {
    authorizationEndpoint: 'https://accounts.spotify.com/authorize',
    tokenEndpoint: 'https://accounts.spotify.com/api/token',
  },
};
const ProfileSettings = props => {
  const [spotifyConnected, setSpotifyConnected] = useState();
  const {setUserLogin, username, setCurrentTrack, currentTrack} =
    useContext(Context);
  const UID = props.UIDProps;

  const IG = async () => {
    await Linking.openURL('instagram://user?username=musicplaceapp');
  };

  const twitter = async () => {
    await Linking.openURL('https://twitter.com/maxmandia');
  };

  const discord = async () => {
    await Linking.openURL('https://discord.gg/q6vNAB63SQ');
  };

  useEffect(() => {
    const checkForSpotifyConnection = async () => {
      const spotifyBoolean = await AsyncStorage.getItem('hasSpotify');

      if (spotifyBoolean === 'false') {
        setSpotifyConnected(false);
        console.log('not connected');
      } else if (spotifyBoolean === 'true') {
        setSpotifyConnected(true);
      }
    };
    checkForSpotifyConnection();
  }, []);

  const spotify = () => {
    if (spotifyConnected === false) {
      const connectToSpotify = async () => {
        const authState = await authorize(spotConfig);
        await AsyncStorage.setItem('hasSpotify', 'true');
        setSpotifyConnected(true);
        await AsyncStorage.setItem('spotAccessToken', authState.accessToken);
        await AsyncStorage.setItem('spotRefreshToken', authState.refreshToken);
      };
      connectToSpotify();
    } else {
      const disconnectFromSpotify = async () => {
        await Linking.openURL('https://www.spotify.com/us/account/apps/');
        setSpotifyConnected(false);
      };
      disconnectFromSpotify();
    }
  };

  const logout = () => {
    auth()
      .signOut()
      .then(() => console.log('User signed out!'));
    AsyncStorage.clear();
    setUserLogin(false);
    setCurrentTrack(null);
    currentTrack.stop();
  };

  const deleteAccount = () => {
    firestore()
      .collection('users')
      .doc(UID)
      .delete()
      .then(() => {
        console.log('User deleted!');
      });
    firestore()
      .collection('usernames')
      .doc(username)
      .delete()
      .then(() => {
        console.log('User deleted!');
      });
    setUserLogin(false);
    AsyncStorage.clear();
    setCurrentTrack(null);
    currentTrack.stop();
  };

  return (
    <View style={styles.container}>
      <View style={styles.drawer} />
      <View style={styles.mainContainer}>
        <TouchableOpacity onPress={IG} style={styles.socialContainer}>
          <Ionicons name={'logo-instagram'} color={'#BB2259'} size={28} />
          <Text style={styles.socialText}>Instagram</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={twitter} style={styles.socialContainer}>
          <Ionicons name={'logo-twitter'} color={'#1D9BF0'} size={28} />
          <Text style={styles.socialText}>Twitter</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={discord} style={styles.socialContainer}>
          <Discord height={24} width={24} />
          <Text style={styles.socialText}>Support</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={spotify} style={styles.socialContainer}>
          <Spotify height={24} width={24} />
          <Text style={styles.socialText}>
            {spotifyConnected
              ? 'Disconnect from Spotify'
              : 'Connect to Spotify'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={logout} style={styles.socialContainer}>
          <Ionicons name={'exit'} color={'white'} size={28} />
          <Text style={styles.socialText}>Logout</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={deleteAccount}
          style={styles.socialContainer}>
          <Ionicons name={'remove-circle'} color={Colors.red} size={28} />
          <Text style={styles.socialText}>Delete account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileSettings;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    height: '48%',
    backgroundColor: '#1C1C1C',
    width: '100%',
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  drawer: {
    borderBottomColor: 'white',
    borderWidth: 2,
    borderRadius: 10,
    width: 75,
    alignSelf: 'center',
    marginTop: '3%',
  },
  mainContainer: {
    marginLeft: '7%',
    marginTop: '7%',
  },
  socialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '7%',
  },
  socialText: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginLeft: '15%',
    position: 'absolute',
  },
});
