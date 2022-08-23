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
import Musicplace from '../../assets/img/musicplace-signup.svg';
import HapticFeedback from 'react-native-haptic-feedback';

const ConnectSpotifyScreen = ({navigation}) => {
  const userInfo = firebase.auth().currentUser;
  const {setUserLogin, username} = useContext(Context);

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
      'user-follow-read',
      'user-library-modify',
      'user-top-read',
    ], // the scopes you need to access
    serviceConfiguration: {
      authorizationEndpoint: 'https://accounts.spotify.com/authorize',
      tokenEndpoint: 'https://accounts.spotify.com/api/token',
    },
  };

  const connectSpotify = async () => {
    HapticFeedback.trigger('impactHeavy');
    const authState = await authorize(config);
    try {
      await firestore().collection('users').doc(userInfo.uid).set(
        {
          phoneNumber: userInfo.phoneNumber,
          createdAt: userInfo.metadata.creationTime,
          lastSignIn: userInfo.metadata.lastSignInTime,
          connectedWithSpotify: true,
          spotifyAccessToken: authState.accessToken,
          spotifyAccessTokenExpirationDate: authState.accessTokenExpirationDate,
          spotifyRefreshToken: authState.refreshToken,
          spotifyTokenType: authState.tokenType,
          bio: null,
          followers: 0,
          following: 0,
          displayName: username,
          followersList: null,
          followingList: null,
          autoPost: true,
        },
        {merge: true},
      );
    } catch (error) {
      return;
    }
    try {
      await AsyncStorage.setItem('user', 'true');
      await AsyncStorage.setItem('hasSpotify', 'true');
      await AsyncStorage.setItem('spotAccessToken', authState.accessToken);
      await AsyncStorage.setItem('spotRefreshToken', authState.refreshToken);
      await AsyncStorage.setItem('UID', userInfo.uid);
    } catch (e) {
      console.log(e);
    }
    navigation.navigate('SwipeUpScreen');
  };

  const maybeLater = async () => {
    HapticFeedback.trigger('impactHeavy');
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
    navigation.navigate('SwipeUpScreen');
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
      <Musicplace style={styles.musicplace} />
      <Text style={styles.desc}>
        Connect with Spotify to save songs right to your library.{' '}
      </Text>
      <View style={styles.inputContainer}>
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
  musicplace: {
    position: 'absolute',
    alignSelf: 'center',
    top: '8.2%',
  },
  desc: {
    color: 'white',
    fontFamily: 'Inter-semibold',
    fontSize: 18,
    width: 300,
    textAlign: 'center',
    alignSelf: 'center',
    marginTop: '8%',
  },
  inputContainer: {
    marginTop: '7%',
  },
  spotifyBtnContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spotifyBtn: {
    backgroundColor: Color.spotify,
    borderRadius: 5,
    paddingVertical: 10,
    marginTop: '5%',
    width: '90%',
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
    width: '90%',
  },
  laterText: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    textAlign: 'center',
    opacity: 0.5,
  },
});
