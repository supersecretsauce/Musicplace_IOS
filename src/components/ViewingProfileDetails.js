import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import React, {useEffect, useContext, useState} from 'react';
import {Context} from '../context/Context';
import Swiper from 'react-native-swiper';
import axios from 'axios';
import DeviceInfo from 'react-native-device-info';
import {simKey} from '../../simKey';
import appCheck from '@react-native-firebase/app-check';
import firestore from '@react-native-firebase/firestore';
import Colors from '../assets/utilities/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ProfileDetails = props => {
  const {
    UID,
    navigation,
    profileID,
    setHighlightMostPlayed,
    setHighlightLikes,
  } = props;
  const {
    viewingSwiperRef,
    setSwiperIndex,
    fetchingTopSongs,
    setFetchingTopSongs,
  } = useContext(Context);
  const [topSongs, setTopSongs] = useState(null);
  const [likes, setLikes] = useState(null);
  const [allData, setAllData] = useState([]);

  useEffect(() => {
    if (profileID) {
      getTopSongs();
    }
  }, [profileID]);

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
        setTopSongs(resp.data.data);
        setFetchingTopSongs(false);
      })
      .catch(e => {
        console.log(e);
      });
  }

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
                  paddingBottom: '85%',
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
                          {allData[0] === 'e' ? (
                            <View style={styles.noLikeContainer}>
                              <Ionicons
                                color={'white'}
                                name="musical-notes"
                                size={80}
                              />
                              <Text style={styles.noLikeText}>
                                No top songs yet.
                              </Text>
                            </View>
                          ) : (
                            <View style={styles.postContainer} key={index}>
                              <TouchableWithoutFeedback
                                onPress={() => {
                                  navigation.navigate('SinglePostDrawerRoute', {
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
                      ) : (
                        <>
                          {allData[1] === 'e' ? (
                            <View style={styles.noLikeContainer}>
                              <Ionicons
                                color={'white'}
                                name="musical-notes"
                                size={80}
                              />
                              <Text style={styles.noLikeText}>
                                No likes yet
                              </Text>
                            </View>
                          ) : (
                            <View style={styles.postContainer} key={index}>
                              <TouchableWithoutFeedback
                                onPress={() => {
                                  navigation.navigate('SinglePostDrawerRoute', {
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
    marginTop: 198,
    alignSelf: 'center',
  },
  flatListContainer: {
    width: '100%',
    justifyContent: 'center',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '25%',
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
  fetchingContainer: {
    justifyContent: 'center',
    height: '100%',
  },
  fetchingText: {
    color: 'white',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    fontSize: 15,
    marginTop: '3%',
  },
});
