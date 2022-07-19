import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Image,
} from 'react-native';
import Color from '../../assets/utilities/Colors';
import React, {useContext} from 'react';
import {Context} from '../../context/Context';
import {authorize} from 'react-native-app-auth';
import firestore from '@react-native-firebase/firestore';
import {firebase} from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ConnectSpotifyScreen = ({navigation}) => {
  const userInfo = firebase.auth().currentUser;
  const {setUserLogin} = useContext(Context);

  const goBack = () => {
    navigation.navigate('CreateUsernameScreen');
  };

  const config = {
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

  const connectSpotify = async () => {
    const authState = await authorize(config);
    try {
      await firestore().collection('users').doc(userInfo.uid).set({
        phoneNumber: userInfo.phoneNumber,
        createdAt: userInfo.metadata.creationTime,
        lastSignIn: userInfo.metadata.lastSignInTime,
        connectedWithSpotify: true,
        spotifyAccessToken: authState.accessToken,
        spotifyAccessTokenExpirationDate: authState.accessTokenExpirationDate,
        spotifyRefreshToken: authState.refreshToken,
        spotifyTokenType: authState.tokenType,
      });
    } catch (error) {
      return;
    }
    try {
      await AsyncStorage.setItem('user', 'true');
      await AsyncStorage.setItem('hasSpotify', 'true');
      await AsyncStorage.setItem('spotAccessToken', authState.accessToken);
      await AsyncStorage.setItem('spotRefreshToken', authState.refreshToken);
    } catch (e) {
      console.log(e);
    }
    setUserLogin(true);
  };

  const maybeLater = async () => {
    try {
      await firestore().collection('users').doc(userInfo.uid).set({
        phoneNumber: userInfo.phoneNumber,
        createdAt: userInfo.metadata.creationTime,
        lastSignIn: userInfo.metadata.lastSignInTime,
        connectedWithSpotify: false,
      });
    } catch (error) {
      return;
    }
    try {
      await AsyncStorage.setItem('user', 'true');
      await AsyncStorage.setItem('hasSpotify', 'false');
    } catch (e) {
      console.log(e);
    }
    setUserLogin(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={goBack}>
        <View style={styles.touchContainer}>
          <Image
            style={styles.chevron}
            source={require('../../assets/img/ChevronLeft.jpg')}
          />
        </View>
      </TouchableWithoutFeedback>
      <View style={styles.textContainer}>
        <Text style={styles.connect}>Connect with</Text>
        <Text style={styles.spotify}>Spotify?</Text>
        <Text style={styles.blurb}>
          Liked songs are automaticaly linked with Spotify.{' '}
        </Text>
      </View>
      <View style={styles.spotifyBtnContainer}>
        <TouchableOpacity onPress={connectSpotify} style={styles.spotifyBtn}>
          <Text style={styles.spotifyText}>Connect with Spotify</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.laterBtnContainer}>
        <TouchableOpacity onPress={maybeLater} style={styles.laterBtn}>
          <Text style={styles.laterText}>Maybe Later</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ConnectSpotifyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  touchContainer: {
    width: '15%',
  },
  chevron: {
    marginTop: '1%',
  },
  textContainer: {
    marginTop: '25%',
    marginLeft: '10%',
  },
  connect: {
    color: 'white',
    fontFamily: 'Inter-Medium',
    fontSize: 30,
  },
  spotify: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 45,
    marginTop: '3%',
  },
  blurb: {
    color: Color.greyOut,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginTop: '3%',
  },
  spotifyBtnContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '18%',
  },
  spotifyBtn: {
    backgroundColor: Color.spotify,
    borderRadius: 5,
    paddingVertical: 10,
    marginTop: '5%',
    width: 317,
  },
  spotifyText: {
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
