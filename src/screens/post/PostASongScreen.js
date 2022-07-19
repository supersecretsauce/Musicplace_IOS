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

const PostASongScreen = () => {
  const userInfo = firebase.auth().currentUser;
  const [spotifyConnected, setSpotifyConnected] = useState();
  const [troll, setTroll] = useState(false);
  const spotifyTrackURL = 'https://api.spotify.com/v1/me/tracks';
  const spotifyRefreshURL = 'https://accounts.spotify.com/api/token';
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');

  const config = {
    clientId: '501638f5cfb04abfb61d039e370c5d99', // available on the app page
    clientSecret: '8ecf0fe55ab44fcdaec13b54afd19955', // click "show client secret" to see this
    redirectUrl: 'musicplace-ios:/musicplace-ios-login', // the redirect you defined after creating the app
    scopes: ['user-read-email', 'playlist-modify-public', 'user-read-private'], // the scopes you need to access
    serviceConfiguration: {
      authorizationEndpoint: 'https://accounts.spotify.com/authorize',
      tokenEndpoint: 'https://accounts.spotify.com/api/token',
    },
  };
  // set access and refresh tokens from firebase
  // useEffect(() => {
  //   const subscriber = firestore()
  //     .collection('users')
  //     .doc(userInfo.uid)
  //     .onSnapshot(documentSnapshot => {
  //       setAccessToken(documentSnapshot.data().spotifyAccessToken);
  //       setRefreshToken(documentSnapshot.data().spotifyRefreshToken);
  //     });
  //   return () => subscriber();
  // }, [accessToken, refreshToken]);

  // check if user has spotify connected to display proper screens
  useEffect(() => {
    const checkUserLogin = async () => {
      try {
        const value = await AsyncStorage.getItem('hasSpotify');
        if (value === 'false') {
          setSpotifyConnected(false);
        } else {
          setSpotifyConnected(true);
        }
      } catch (e) {
        console.log(e);
        console.log('cant check async storage');
      }
    };

    checkUserLogin();
  }, []);

  //get top tracks or get new access token and THEN get tracks
  useEffect(() => {
    const getSpotifyLibrary = async () => {
      const asyncRefresh = await AsyncStorage.getItem('spotRefreshToken');
      const asyncAccess = await AsyncStorage.getItem('spotAccessToken');
      setAccessToken(asyncAccess);
      setRefreshToken(asyncRefresh);
      console.log(accessToken);
      await axios
        .get(spotifyTrackURL, {
          headers: {
            Authorization: 'Bearer ' + accessToken,
          },
        })
        .then(response => {
          console.log(response.data);
          return;
        })
        .catch(error => {
          console.log(error);
          console.log('getting tracks failed');
          if (error.request.status === 401) {
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
                      config.clientId + ':' + config.clientSecret,
                    ).toString('base64'),
                },
              })
              .then(response => {
                console.log(response.data.access_token);
                console.log('worked');
                firestore().collection('users').doc(userInfo.uid).set({
                  spotifyAccessToken: response.data.access_token,
                  // spotifyAccessTokenExpirationDate:
                  //   authState.accessTokenExpirationDate,
                  // spotifyRefreshToken: authState.refreshToken,
                });
                setAccessToken(response.data.access_token);
                getSpotifyLibrary();
              })
              .catch(errormsg => {
                console.log(errormsg);
                console.log('new token failed');
              });
          }
        });
    };
    getSpotifyLibrary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connectSpotify = async () => {
    const authState = await authorize(config);
    await AsyncStorage.setItem('hasSpotify', 'true');
    setSpotifyConnected(true);
    setAccessToken(authState.accessToken);
    setRefreshToken(authState.refreshToken);
    await AsyncStorage.setItem('spotAccessToken', authState.accessToken);
    await AsyncStorage.setItem('spotRefreshToken', authState.refreshToken);
    try {
      await firestore().collection('users').doc(userInfo.uid).set({
        connectedWithSpotify: true,
        spotifyAccessToken: authState.accessToken,
        spotifyAccessTokenExpirationDate: authState.accessTokenExpirationDate,
        spotifyRefreshToken: authState.refreshToken,
        spotifyTokenType: authState.tokenType,
      });
    } catch (error) {
      return;
    }
  };

  const trollFunction = () => {
    setTroll(!troll);
  };

  return (
    <>
      {spotifyConnected ? (
        <SafeAreaView style={styles.container}>
          <TouchableOpacity>
            <Text
              // onPress={testFunction}
              style={styles.test}>
              Test
            </Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.test}>refresh</Text>
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
            <TouchableOpacity
              onPress={connectSpotify}
              style={styles.spotifyBtn}>
              <Text style={styles.spotifyTextBtn}>Connect with Spotify</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.laterBtnContainer}>
            <TouchableOpacity onPress={trollFunction} style={styles.laterBtn}>
              <Text style={styles.laterText}>I have Apple Music</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}
    </>
  );
};

export default PostASongScreen;

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
