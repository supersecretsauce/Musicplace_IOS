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
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {spotConfig} from '../../../SpotifyConfig';
const ConnectSpotifyScreen = ({navigation}) => {
  const userInfo = firebase.auth().currentUser;
  const {username, setFeed} = useContext(Context);

  const goBack = () => {
    navigation.goBack();
  };

  const connectSpotify = async () => {
    HapticFeedback.trigger('impactHeavy');
    const authState = await authorize(spotConfig);

    let data = {
      UID: userInfo.uid,
      pfpURL: null,
      headerURL: null,
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
      displayName: null,
      followersList: [],
      followingList: [],
      autoPost: true,
      handle: null,
    };

    const docRef = firestore().collection('users').doc(userInfo.uid);
    docRef.set(data, {merge: true}).then(() => {
      axios
        .get(`http://167.99.22.22/update/top-tracks?userId=${userInfo.uid}`)
        .then(resp => {
          if (resp.status === 200) {
            console.log('finished fetching top songs');
            axios
              .get(
                `http://167.99.22.22/recommendation/user?userId=${userInfo.uid}`,
              )
              .then(resp => {
                if (resp.status === 200) {
                  setFeed(resp.data.data);
                }
              })
              .catch(e => {
                console.log(e);
              });
          }
        })
        .catch(e => {
          console.log(e);
        });
    });

    try {
      await AsyncStorage.setItem('user', 'true');
      await AsyncStorage.setItem('hasSpotify', 'true');
      await AsyncStorage.setItem('UID', userInfo.uid);
    } catch (e) {
      console.log(e);
    }
    navigation.navigate('CreateUsernameScreen');
  };

  const maybeLater = async () => {
    HapticFeedback.trigger('impactHeavy');
    try {
      await firestore().collection('users').doc(userInfo.uid).set({
        UID: userInfo.uid,
        pfpURL: null,
        headerURL: null,
        phoneNumber: userInfo.phoneNumber,
        createdAt: userInfo.metadata.creationTime,
        lastSignIn: userInfo.metadata.lastSignInTime,
        connectedWithSpotify: false,
        bio: null,
        followers: 0,
        following: 0,
        displayName: null,
        followersList: [],
        followingList: [],
        autoPost: false,
        handle: null,
        spotifyAccessToken: null,
        spotifyAccessTokenExpirationDate: null,
        spotifyRefreshToken: null,
        spotifyTokenType: null,
      });
    } catch (error) {
      return;
    }
    try {
      await AsyncStorage.setItem('user', 'true');
      await AsyncStorage.setItem('hasSpotify', 'false');
      await AsyncStorage.setItem('UID', userInfo.uid);
    } catch (e) {
      console.log(e);
    }
    navigation.navigate('SelectGenresScreen', {
      UID: userInfo.uid,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topContainer}>
        <TouchableWithoutFeedback
          onPress={goBack}
          style={styles.touchContainer}>
          <Ionicons
            style={styles.chevron}
            name="chevron-back"
            color="white"
            size={40}
          />
        </TouchableWithoutFeedback>
        <Musicplace style={styles.musicplace} />
      </View>
      <Text style={styles.desc}>
        Connect with Spotify to find music based off of your listening history.
      </Text>
      <View style={styles.inputContainer}>
        <View style={styles.spotifyBtnContainer}>
          <TouchableOpacity onPress={connectSpotify} style={styles.spotifyBtn}>
            <Text style={styles.spotifyText}>Connect with Spotify</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.laterBtnContainer}>
          <TouchableOpacity onPress={maybeLater} style={styles.laterBtn}>
            <Text style={styles.laterText}>I don't have Spotify</Text>
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
  topContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 25,
  },
  chevron: {
    position: 'absolute',
    left: 20,
  },
  musicplace: {
    alignSelf: 'center',
  },
  desc: {
    color: 'white',
    fontFamily: 'Inter-semibold',
    fontSize: 18,
    width: 310,
    textAlign: 'center',
    alignSelf: 'center',
    marginTop: '3%',
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
