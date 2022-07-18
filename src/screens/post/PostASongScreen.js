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
const qs = require('qs');

const PostASongScreen = () => {
  const userInfo = firebase.auth().currentUser;
  const [spotifyConnected, setSpotifyConnected] = useState();
  const [troll, setTroll] = useState(false);
  const [accessToken, setAccessToken] = useState();
  const [refreshToken, setRefreshToken] = useState();
  const spotifyTrackURL = 'https://api.spotify.com/v1/me/tracks';
  const spotifyRefreshURL = 'https://accounts.spotify.com/api/token';

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

  const getSpotifyLibrary = () => {
    axios
      .get(spotifyTrackURL, {
        headers: {
          Authorization: 'Bearer ' + accessToken,
        },
      })
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.log(error);
      });
  };
  const getRefreshToken = async () => {
    const data = qs.stringify({ grant_type: 'refresh_token', refresh_token: refreshToken });
    console.log(Buffer.from(config.clientId + ':' + config.clientSecret).toString('base64'));
    axios
      .post(spotifyRefreshURL, data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(config.clientId + ':' + config.clientSecret).toString('base64')
        }
      })
      .then(response => {
        console.log(response.data.accessToken);
      })
      .catch(error => {
        console.log(error);
      });
  };

  useEffect(() => {
    const subscriber = firestore()
      .collection('users')
      .doc(userInfo.uid)
      .onSnapshot(documentSnapshot => {
        if (documentSnapshot.data().connectedWithSpotify === false) {
          setSpotifyConnected(false);
        }
        if (documentSnapshot.data().connectedWithSpotify === true) {
          setSpotifyConnected(true);
          setAccessToken(documentSnapshot.data().spotifyAccessToken);
          setRefreshToken(documentSnapshot.data().spotifyRefreshToken);
        }
      });

    // Stop listening for updates when no longer required
    return () => subscriber();
  }, [userInfo.uid]);

  const connectSpotify = async () => {
    const authState = await authorize(config);
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
            <Text onPress={getSpotifyLibrary} style={styles.test}>
              Test
            </Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text onPress={getRefreshToken} style={styles.test}>
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
