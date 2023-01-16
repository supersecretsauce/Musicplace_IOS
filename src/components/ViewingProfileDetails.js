import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableWithoutFeedback,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useContext, useState, useRef} from 'react';
import {Context} from '../context/Context';
import Swiper from 'react-native-swiper';
import axios from 'axios';
import DeviceInfo from 'react-native-device-info';
import {simKey} from '../../simKey';
import appCheck from '@react-native-firebase/app-check';
import firestore from '@react-native-firebase/firestore';
import Colors from '../assets/utilities/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {authorize} from 'react-native-app-auth';
import {spotConfig} from '../../SpotifyConfig';
import Spotify from '../assets/img/spotify.svg';

const ProfileDetails = props => {
  const {
    UID,
    navigation,
    profileID,
    setHighlightMostPlayed,
    setHighlightLikes,
  } = props;
  const {
    hasSpotify,
    setHasSpotify,
    viewingSwiperRef,
    setSwiperIndex,
    fetchingTopSongs,
    setFetchingTopSongs,
  } = useContext(Context);
  const [topSongs, setTopSongs] = useState(null);
  const [likes, setLikes] = useState(null);
  const [allData, setAllData] = useState([]);
  // const swiperRef = useRef();

  useEffect(() => {
    if (hasSpotify) {
      getTopSongs();
    } else {
      setTopSongs([]);
    }
  }, [hasSpotify]);

  useEffect(() => {
    if (!UID) {
      return;
    }

    const subscriber = firestore()
      .collection('feed')
      .where('type', '==', 'like')
      .where('user', '==', profileID)
      .onSnapshot(resp => {
        console.log(resp);
        if (resp.empty) {
          setLikes([]);
        } else if (resp.docs.length === 1) {
          setLikes(resp.docs);
        }
        // setLikes(documentSnapshot.docs);
        let likesArr = resp.docs.sort((z, a) => {
          return a.data().date - z.data().date;
        });
        setLikes(likesArr);
      });

    return () => subscriber();
  }, [UID]);

  async function getTopSongs() {
    if (!UID) {
      return;
    }
    setFetchingTopSongs(true);
    let isEmulator = await DeviceInfo.isEmulator();
    let authToken;
    if (!isEmulator) {
      authToken = await appCheck().getToken();
    }
    axios
      .get(
        `http://167.99.22.22/fetch/library?userId=${profileID}&viewerId=${UID}`,
        {
          headers: {
            accept: 'application/json',
            Authorization: isEmulator
              ? 'Bearer ' + simKey
              : 'Bearer ' + authToken.token,
          },
        },
      )
      .then(resp => {
        console.log(resp);
        // setTopSongs([]);
        setTopSongs(resp.data.data);
        setFetchingTopSongs(false);
      })
      .catch(e => {
        console.log(e);
      });
  }

  // console.log(hasSpotify);

  useEffect(() => {
    console.log('likes', likes);
    console.log('top songs', topSongs);
    if (topSongs && likes) {
      if (topSongs.length < 1 && likes.length < 1) {
        console.log('both empty ');
        setAllData(['e', 'e']);
      } else if (topSongs.length > 0 && likes.length < 1) {
        setAllData([topSongs, 'e']);
      } else if (topSongs.length < 1 && likes.length > 0) {
        setAllData(['e', likes]);
      } else {
        setAllData([topSongs, likes]);
      }
    }
  }, [topSongs, likes]);

  const connectSpotify = async () => {
    if (UID) {
      const authState = await authorize(spotConfig);
      setFetchingTopSongs(true);
      firestore()
        .collection('users')
        .doc(UID)
        .update({
          spotifyAccessToken: authState.accessToken,
          spotifyAccessTokenExpirationDate: authState.accessTokenExpirationDate,
          spotifyRefreshToken: authState.refreshToken,
          spotifyTokenType: authState.tokenType,
          connectedWithSpotify: true,
        })
        .then(resp => {
          console.log(resp);
          setHasSpotify(true);
          AsyncStorage.setItem('hasSpotify', 'true');
          axios
            .get(`http://167.99.22.22/update/top-tracks?userId=${UID}`)
            .then(() => {
              console.log('finished getting spotify library');
              getTopSongs();
            })
            .catch(e => {
              console.log(e);
            });
        });
    }
  };

  return (
    <View style={styles.container}>
      {allData.length > 1 ? (
        <Swiper
          ref={viewingSwiperRef}
          onIndexChanged={index => {
            setSwiperIndex(index);
            if (index === 0) {
              setHighlightMostPlayed(true);
              setHighlightLikes(false);
            } else {
              setHighlightMostPlayed(false);
              setHighlightLikes(true);
            }
          }}
          showsPagination={false}
          showsButtons={false}
          loop={false}>
          {allData.map((idk, topIndex) => {
            return (
              <FlatList
                numColumns={2}
                showsVerticalScrollIndicator={false}
                // eslint-disable-next-line react-native/no-inline-styles
                contentContainerStyle={{
                  paddingBottom: '40%',
                  alignSelf: 'center',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                // eslint-disable-next-line react-native/no-inline-styles
                style={{
                  width: '100%',
                  height: '100%',
                  marginTop: 1,
                }}
                key={topIndex}
                data={allData[topIndex]}
                renderItem={({item, index}) => {
                  return (
                    <>
                      {topIndex === 0 ? (
                        <>
                          {fetchingTopSongs ? (
                            <Text>fetching...</Text>
                          ) : (
                            <>
                              {topSongs === 'e' ? (
                                <Text>this user does not have spotify</Text>
                              ) : (
                                <View style={styles.postContainer} key={index}>
                                  <TouchableWithoutFeedback
                                    onPress={() => {
                                      navigation.navigate('ViewPostsScreen', {
                                        //making the song an array so it works with swiper package
                                        songInfo: [item],
                                        UID: UID,
                                      });
                                    }}>
                                    <View>
                                      <Image
                                        style={styles.songPhoto}
                                        source={{
                                          uri: item.songPhoto,
                                        }}
                                      />
                                      <Text
                                        numberOfLines={1}
                                        style={styles.songName}>
                                        {item.songName}
                                      </Text>
                                      <View>
                                        <Text
                                          numberOfLines={1}
                                          style={styles.artistName}>
                                          {item.artists
                                            ?.map(artist => {
                                              return artist.name;
                                            })
                                            .join(', ')}
                                        </Text>
                                      </View>
                                    </View>
                                  </TouchableWithoutFeedback>
                                </View>
                              )}
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          {allData[1] === 'e' ? (
                            <Text>no likes yet...</Text>
                          ) : (
                            <View style={styles.postContainer} key={index}>
                              <TouchableWithoutFeedback
                                onPress={() => {
                                  navigation.navigate('ViewPostsScreen', {
                                    //making the song an array so it works with swiper package
                                    songInfo: [item._data],
                                    UID: UID,
                                  });
                                }}>
                                <View>
                                  <Image
                                    style={styles.songPhoto}
                                    source={{
                                      uri: item._data.songPhoto,
                                    }}
                                  />
                                  <Text
                                    numberOfLines={1}
                                    style={styles.songName}>
                                    {item._data.songName}
                                  </Text>
                                  <View>
                                    <Text
                                      numberOfLines={1}
                                      style={styles.artistName}>
                                      {item._data.artists
                                        ?.map(artist => {
                                          return artist.name;
                                        })
                                        .join(', ')}
                                    </Text>
                                  </View>
                                </View>
                              </TouchableWithoutFeedback>
                            </View>
                          )}
                        </>
                      )}
                    </>
                  );
                }}
              />
            );
          })}
        </Swiper>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={'white'} />
          <Text style={styles.loadingText}>retrieving data</Text>
        </View>
      )}
    </View>
  );
};

export default ProfileDetails;

const styles = StyleSheet.create({
  container: {
    marginTop: 215,
    alignSelf: 'center',
    // flex: 1,
  },
  flatListContainer: {
    width: '100%',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: 'white',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: '5%',
  },
  loadingTopSongsContainer: {
    paddingVertical: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingTopSongsText: {
    color: 'white',
  },
  postContainer: {
    marginTop: '1%',
    paddingHorizontal: '5%',
    paddingVertical: '4%',
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
  // if a user doesn't have spotify
  noSpotifyContainer: {
    alignSelf: 'center',
    width: 280,
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noSpotText: {
    color: 'white',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    fontSize: 15,
  },
  listenOnSpotifyBtn: {
    marginTop: '8%',
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
  noLikeContainer: {
    alignSelf: 'center',
    width: 280,
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noLikeText: {
    color: 'white',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    fontSize: 15,
  },
});
