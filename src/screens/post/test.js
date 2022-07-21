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

  const spotConfig = {
    clientId: '501638f5cfb04abfb61d039e370c5d99', // available on the app page
    clientSecret: '16f92a6d7e9a4180b29af25bf012e6fe', // click "show client secret" to see this
    redirectUrl: 'musicplace-ios:/musicplace-ios-login', // the redirect you defined after creating the app
    scopes: [
      'user-read-email',
      'playlist-modify-public',
      'user-read-private',
      'user-library-read',
    ], // the scopes you need to access
    serviceConfiguration: {
      authorizationEndpoint: 'https://accounts.spotify.com/authorize',
      tokenEndpoint: 'https://accounts.spotify.com/api/token',
    },
  };

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

  // interceptors

  const authFetch = axios.create({
    baseURL: 'https://api.spotify.com/v1/',
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json',
    },
  });

  // Add a request interceptor
  authFetch.interceptors.request.use(
    function (config) {
      // Do something before request is sent
      console.log('request sent');
      return config;
    },
    function (error) {
      // Do something with request error
      console.log('request error');
      return Promise.reject(error);
    },
  );

  // Add a response interceptor
  authFetch.interceptors.response.use(
    function (response) {
      // Any status code that lie within the range of 2xx cause this function to trigger
      // Do something with response data
      console.log('got response');
      return response;
    },
    function (error) {
      // Any status codes that falls outside the range of 2xx cause this function to trigger
      // Do something with response error
      console.log('response error');
      if (error.response.status === 401) {
        const data = qs.stringify({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        });
        axios
          .post(spotifyRefreshURL, data, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization:
                'Basic ' +
                Buffer.from(
                  spotConfig.clientId + ':' + spotConfig.clientSecret,
                ).toString('base64'),
            },
          })
          .then(response => {
            console.log(response.data.access_token);
            setAccessToken(response.data.access_token);
            setRefreshToken(response.data.refresh_token);
          })
          .catch(e => {
            console.log(e);
            console.log('bad token?');
          });
      }
      // getRefreshToken();

      return Promise.reject(error);
    },
  );

  const FetchData = async () => {
    try {
      const resp = await authFetch.get('/me');
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
