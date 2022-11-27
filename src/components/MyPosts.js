import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState, useContext} from 'react';
import firestore from '@react-native-firebase/firestore';
import Colors from '../assets/utilities/Colors';
import {Context} from '../context/Context';
import Spotify from '../assets/img/spotify.svg';
import {spotConfig} from '../../SpotifyConfig';
import {authorize} from 'react-native-app-auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

import axios from 'axios';
const MyPosts = props => {
  const {UID, navigation} = props;
  const {
    hasSpotify,
    setHasSpotify,
    doneFetchingTopSongs,
    setDoneFetchingTopSongs,
  } = useContext(Context);
  const [userPosts, setUserPosts] = useState(null);

  useEffect(() => {
    if (UID && doneFetchingTopSongs) {
      const subscriber = firestore()
        .collection('posts')
        .where('users', 'array-contains', UID)
        .get()
        .then(resp => {
          let songDocs = [];
          resp.docs.forEach(doc => {
            songDocs.push(doc._data);
          });
          setUserPosts(songDocs);
        });
      return () => subscriber;
    }
  }, [UID, doneFetchingTopSongs]);

  const connectSpotify = async () => {
    if (UID) {
      try {
        const authState = await authorize(spotConfig);
        console.log(authState);
        firestore()
          .collection('users')
          .doc(UID)
          .update({
            spotifyAccessToken: authState.accessToken,
            spotifyAccessTokenExpirationDate:
              authState.accessTokenExpirationDate,
            spotifyRefreshToken: authState.refreshToken,
            spotifyTokenType: authState.tokenType,
            connectedWithSpotify: true,
          })
          .then(resp => {
            console.log(resp);
            setHasSpotify(true);
            AsyncStorage.setItem('hasSpotify', 'true');
            AsyncStorage.setItem('spotAccessToken', authState.accessToken);
            AsyncStorage.setItem('spotRefreshToken', authState.refreshToken);
            axios
              .get(
                `https://reccomendation-api-pmtku.ondigitalocean.app/updates/${userInfo.uid}`,
              )
              .then(resp => {
                if (resp.status === 200) {
                  setDoneFetchingTopSongs(true);
                }
              })
              .catch(e => {
                console.log(e);
              });
          });
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <>
        {userPosts ? (
          <>
            <View style={styles.trackScrollContainer}>
              <FlatList
                data={userPosts}
                numColumns={2}
                contentContainerStyle={{paddingBottom: '40%'}}
                style={{width: '100%', height: '100%', marginTop: 1}}
                renderItem={({item, index}) => {
                  return (
                    <View style={styles.postContainer} key={index}>
                      <TouchableOpacity
                        onPress={() => {
                          navigation.navigate('ViewPostsScreen', {
                            //making the song an array so it works with swiper package
                            songInfo: [userPosts[index]],
                            UID: UID,
                          });
                        }}>
                        <Image
                          style={styles.songPhoto}
                          source={{
                            uri: item.songPhoto,
                          }}
                        />
                        <Text numberOfLines={1} style={styles.songName}>
                          {item.songName}
                        </Text>
                        <View>
                          <Text numberOfLines={1} style={styles.artistName}>
                            {item.artists
                              ?.map(artist => {
                                return artist.name;
                              })
                              .join(', ')}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                }}
              />
            </View>
          </>
        ) : (
          <>
            {hasSpotify ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={'white'} />
                <Text style={styles.loadingText}>
                  Getting your top songs from Spotify.
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.loadingContainer}>
                  <TouchableOpacity
                    style={styles.listenOnSpotifyBtn}
                    onPress={connectSpotify}>
                    <Spotify />
                    <Text style={styles.listenOnSpotifyText}>
                      CONNECT WITH SPOTIFY
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </>
        )}
      </>
    </View>
  );
};

export default MyPosts;

const styles = StyleSheet.create({
  container: {
    marginTop: 215,
  },
  trackScrollContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  postContainer: {
    padding: 16,
    marginTop: '1%',
    paddingHorizontal: '6%',
  },
  songPhoto: {
    height: 150,
    width: 150,
  },
  songName: {
    color: 'white',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginTop: '6%',
    maxWidth: 140,
  },
  artistName: {
    color: Colors.greyOut,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    maxWidth: 140,
    marginTop: '2%',
  },
  loadingContainer: {
    alignSelf: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '75%',
  },

  loadingText: {
    color: 'white',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: '5%',
  },
  listenOnSpotifyBtn: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#1F1F1F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  listenOnSpotifyText: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginLeft: 10,
  },
});
