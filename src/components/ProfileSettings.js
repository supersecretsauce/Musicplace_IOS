import {StyleSheet, Text, View, TouchableOpacity, Linking} from 'react-native';
import React, {useState, useContext, useEffect} from 'react';
import Spotify from '../assets/img/spotify.svg';
import Discord from '../assets/img/discord.svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../assets/utilities/Colors';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Context} from '../context/Context';
import {authorize} from 'react-native-app-auth';
import {spotConfig} from '../../SpotifyConfig';
import {firebase} from '@react-native-firebase/firestore';

const ProfileSettings = props => {
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const {setUserLogin, username, setCurrentTrack, currentTrack, setFeed} =
    useContext(Context);
  const {UID} = props;

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

  const IG = async () => {
    await Linking.openURL('instagram://user?username=musicplaceapp');
  };

  const twitter = async () => {
    await Linking.openURL('https://twitter.com/maxmandia');
  };

  const discord = async () => {
    await Linking.openURL('https://discord.gg/q6vNAB63SQ');
  };

  const handleSpotify = () => {
    if (spotifyConnected === false) {
      const connectToSpotify = async () => {
        const authState = await authorize(spotConfig);
        await AsyncStorage.setItem('hasSpotify', 'true');
        setSpotifyConnected(true);
      };
      connectToSpotify();
    } else {
      const disconnectFromSpotify = async () => {
        await Linking.openURL('https://www.spotify.com/us/account/apps/');
        await AsyncStorage.setItem('hasSpotify', 'false');
        setSpotifyConnected(false);
      };
      disconnectFromSpotify();
    }
  };

  const logout = () => {
    auth()
      .signOut()
      .then(() => {
        console.log('User signed out!');
        setUserLogin(false);
        setCurrentTrack(null);
        currentTrack.stop();
        AsyncStorage.clear();
      });
  };

  const deleteAccount = async () => {
    let user = firebase.auth().currentUser;
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
              user.delete().then(() => {
                setUserLogin(false);
                setFeed(null);
                AsyncStorage.clear();
              });
            });
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <View style={styles.drawer} />

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
      <TouchableOpacity onPress={handleSpotify} style={styles.socialContainer}>
        <Spotify height={24} width={24} />
        <Text style={styles.socialText}>
          {spotifyConnected ? 'Disconnect from Spotify' : 'Connect to Spotify'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={logout} style={styles.socialContainer}>
        <Ionicons name={'exit'} color={'white'} size={28} />
        <Text style={styles.socialText}>Logout</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={deleteAccount} style={styles.socialContainer}>
        <Ionicons name={'remove-circle'} color={Colors.red} size={28} />
        <Text style={styles.socialText}>Delete account</Text>
      </TouchableOpacity>
    </>
  );
};

export default ProfileSettings;

const styles = StyleSheet.create({
  drawer: {
    borderBottomColor: 'white',
    borderWidth: 2,
    borderRadius: 10,
    width: 75,
    alignSelf: 'center',
    marginTop: '3%',
    marginBottom: '3%',
  },
  socialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    margin: 10,
    paddingLeft: '5%',
  },
  socialText: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginLeft: '20%',
    position: 'absolute',
  },
});
