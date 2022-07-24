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
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {firebase} from '@react-native-firebase/firestore';
import Colors from '../../assets/utilities/Colors';
import {authorize} from 'react-native-app-auth';
import axios from 'axios';
import {authFetch} from '../../services/SpotifyService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Color from '../../assets/utilities/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SpotifyPlaylists from '../../components/SpotifyPlaylists';

const TestScreen = () => {
  const userInfo = firebase.auth().currentUser;
  const [spotifyConnected, setSpotifyConnected] = useState();
  const [troll, setTroll] = useState(false);
  const spotifyUserInfoURL = 'https://api.spotify.com/v1/me';
  const spotifyTrackURL = 'https://api.spotify.com/v1/me/tracks';
  const spotifyRefreshURL = 'https://accounts.spotify.com/api/token';
  const spotifyUserPlaylistURL = 'https://api.spotify.com/v1/me/playlists';
  const spotifyPlaylistItemsURL =
    'https://api.spotify.com/v1/playlists/playlist_id/tracks';
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [spotifyID, setSpotifyID] = useState('');
  const [userPlaylistInfo, setUserPlaylistInfo] = useState();
  const [playlistIDs, setPlaylistIDs] = useState();
  const [uniquePlaylist, setUniquePlaylist] = useState('');

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

  // get user info from Spotify
  useEffect(() => {
    if (accessToken) {
      authFetch(accessToken, refreshToken, setAccessToken, setRefreshToken)
        .get('me')
        .then(response => {
          setSpotifyID(response.data.id);
        })
        .catch(error => {
          console.log(error);
          return error;
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  // get a user's playlists
  useEffect(() => {
    if (spotifyID) {
      axios
        .get(spotifyUserPlaylistURL, {
          headers: {
            Authorization: 'Bearer ' + accessToken,
            'Content-Type': 'application/json',
          },
        })
        .then(response => {
          setPlaylistIDs(response.data.items.map(playlistID => playlistID.id));
          setUserPlaylistInfo(response.data.items);
        })
        .catch(error => {
          console.log(error);
        });
    }
  }, [spotifyID, accessToken]);

  useEffect(() => {
    if (playlistIDs) {
      const returnManyArrays = async () => {
        const userPlaylistArrays = await Promise.all(
          playlistIDs.map(async playlistID => {
            try {
              const response = await axios.get(
                `https://api.spotify.com/v1/playlists/${playlistID}/tracks`,
                {
                  headers: {
                    Authorization: 'Bearer ' + accessToken,
                    'Content-Type': 'application/json',
                  },
                },
              );
              return response.data.items;
            } catch (error) {
              console.log(error);
            }
          }),
        );
        setUniquePlaylist(userPlaylistArrays);
      };
      returnManyArrays();
    }
  }, [accessToken, playlistIDs]);

  useEffect(() => {
    if (uniquePlaylist) {
      console.log(uniquePlaylist);
      console.log(userPlaylistInfo);
      console.log('should be one array with many arrays above');
    }
  }, [uniquePlaylist, userPlaylistInfo]);

  const connectSpotify = async () => {
    const authState = await authorize(spotConfig);
    console.log(authState.accessToken);
    console.log('access token');
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
        <View style={styles.container}>
          <View style={styles.searchBackground}>
            <Text style={styles.search}>Search</Text>
            <View style={styles.inputSearchContainer}>
              <View style={styles.inputSearchBox}>
                <Ionicons name="search-sharp" color="white" />
                <TextInput
                  style={styles.inputSearch}
                  placeholderTextColor="white"
                  placeholder="Search by song, album, or artist"
                />
              </View>
            </View>
            <View style={styles.navContainer}>
              <Text style={styles.navIcon}>Liked Songs</Text>
              <Text style={styles.navIcon}>Playlists</Text>
              <Text style={styles.navIcon}>Albums</Text>
              <Text style={styles.navIcon}>Artists</Text>
            </View>
          </View>
          <SpotifyPlaylists playlists={userPlaylistInfo} />
        </View>
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

export default TestScreen;

const styles = StyleSheet.create({
  // connected
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  searchBackground: {
    backgroundColor: Color.lightBlack,
    height: '31%',
  },
  search: {
    color: 'white',
    fontFamily: 'Inter-SemiBold',
    fontSize: 30,
    marginTop: '18%',
    marginLeft: '4%',
  },
  inputSearchContainer: {
    alignItems: 'center',
    marginTop: '5%',
  },
  inputSearchBox: {
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: Color.darkGrey,
    height: 45,
    width: '93%',
    borderRadius: 6,
    padding: 10,
  },
  inputSearch: {
    marginLeft: 5,
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: 'white',
  },
  navContainer: {
    marginTop: '5%',
    marginLeft: '4%',
    marginRight: '4%',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  navIcon: {
    color: 'white',
    borderColor: Color.darkGrey,
    borderStyle: 'solid',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },

  // not connected
  noSpotifyContainer: {
    backgroundColor: 'black',
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
