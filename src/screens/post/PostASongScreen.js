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
import {authFetch} from '../../services/SpotifyService';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
          console.log(response);
        });
    }
  }, [accessToken, refreshToken]);

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
        })
        .catch(error => {
          console.log(error);
        });
    }
  }, [spotifyID, accessToken]);

  // return playlist IDs in a new array
  // useEffect(() => {
  //   if (playlistIDs) {
  //     setUniquePlaylist(
  //       playlistIDs.map(playlistID => {
  //         axios
  //           .get(`https://api.spotify.com/v1/playlists/${playlistID}/tracks`, {
  //             headers: {
  //               Authorization: 'Bearer ' + accessToken,
  //               'Content-Type': 'application/json',
  //             },
  //           })
  //           .then(response => {
  //             console.log(response.data.items);
  //           })
  //           .catch(error => {
  //             console.log(error);
  //           });
  //       }),
  //     );
  //   }
  // }, [playlistIDs, accessToken]);

  // useEffect(()=> {
  //   const userPlaylistArrays = await promise
  // })

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
      console.log('should be one array with many arrays above');
    }
  }, [uniquePlaylist]);

  const connectSpotify = async () => {
    const authState = await authorize(config);
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
        <SafeAreaView style={styles.container}>
          <TouchableOpacity>
            <Text style={styles.test}>Test</Text>
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
