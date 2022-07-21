import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {firebase} from '@react-native-firebase/firestore';
import Colors from '../../assets/utilities/Colors';
import {authorize} from 'react-native-app-auth';
import {authFetch} from '../../services/SpotifyService';
import axios from 'axios';
import {Buffer} from 'buffer';
import AsyncStorage from '@react-native-async-storage/async-storage';
const qs = require('qs');

const TestScreen = () => {
  const userInfo = firebase.auth().currentUser;
  const [spotifyConnected, setSpotifyConnected] = useState();
  const [troll, setTroll] = useState(false);
  const spotifyUserInfoURL = 'https://api.spotify.com/v1/me';
  const spotifyTrackURL = 'https://api.spotify.com/v1/me/tracks';
  const spotifyRefreshURL = 'https://accounts.spotify.com/api/token';
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');

  // check if user has spotify connected to display proper screens
  useEffect(() => {
    const checkForSpotifyConnection = async () => {
      const spotifyBoolean = await AsyncStorage.getItem('hasSpotify');
      const localRefresh = await AsyncStorage.getItem('spotRefreshToken');
      const localAccess = await AsyncStorage.getItem('spotAccessToken');

      if (spotifyBoolean === 'false') {
        setSpotifyConnected(false);
        console.log('not connected');
      } else if (spotifyBoolean === 'true') {
        setSpotifyConnected(true);
        setAccessToken(localAccess);
        setRefreshToken(localRefresh);
      }
    };
    checkForSpotifyConnection();
  }, []);

  const FetchData = async () => {
    try {
      const resp = await authFetch(
        accessToken,
        refreshToken,
        setAccessToken,
        setRefreshToken,
      ).get('/me');
      console.log(resp);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {spotifyConnected ? (
        <SafeAreaView style={styles.container}>
          <TouchableOpacity>
            <Text style={styles.test}>Test</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text onPress={FetchData} style={styles.test}>
              refresh
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      ) : (
        <SafeAreaView style={styles.noSpotifyContainer}>
          <View style={styles.noSpotTextContainer}>
            <Text style={styles.connectText}>Connect with</Text>
            <Text style={styles.spotifyText}>Spotify</Text>
            {troll ? (
              <Text style={styles.spotifyBlurb}>Damn thats sucks lmaooooo</Text>
            ) : (
              <Text style={styles.spotifyBlurb}>
                Connect with Spotify to post a song.
              </Text>
            )}
          </View>
          <View style={styles.spotifyBtnContainer}>
            <TouchableOpacity style={styles.spotifyBtn}>
              <Text style={styles.spotifyTextBtn}>Connect with Spotify</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.laterBtnContainer}>
            <TouchableOpacity style={styles.laterBtn}>
              <Text style={styles.laterText}>I have Apple Music</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}
    </>
  );
};

export default TestScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  test: {
    color: 'white',
  },
  noSpotifyContainer: {
    backgroundColor: 'black',
    flex: 1,
  },
  noSpotTextContainer: {
    marginTop: '30%',
    marginLeft: '10%',
  },
  connectText: {
    fontFamily: 'Inter-Medium',
    color: 'white',
    fontSize: 40,
  },
  spotifyText: {
    fontFamily: 'Inter-Bold',
    color: 'white',
    fontSize: 50,
    marginTop: '3%',
  },
  spotifyBlurb: {
    fontFamily: 'Inter-Medium',
    color: Colors.greyOut,
    fontSize: 14,
    marginTop: '5%',
  },
  spotifyBtnContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '15%',
  },
  spotifyBtn: {
    backgroundColor: Colors.spotify,
    borderRadius: 5,
    paddingVertical: 10,
    marginTop: '5%',
    width: 317,
  },
  spotifyTextBtn: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    textAlign: 'center',
  },
  laterBtnContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  laterBtn: {
    backgroundColor: 'rgba(255, 8, 0, 0.5)',
    borderRadius: 5,
    paddingVertical: 10,
    marginTop: '5%',
    width: 317,
  },
  laterText: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    textAlign: 'center',
    opacity: 0.5,
  },
});
