import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import React, {
  useEffect,
  useContext,
  useState,
  useRef,
  useCallback,
} from 'react';
import {Context} from '../context/Context';
import {useFocusEffect} from '@react-navigation/native';
import Swiper from 'react-native-swiper';
import axios from 'axios';
import DeviceInfo from 'react-native-device-info';
import {simKey} from '../../simKey';
import appCheck from '@react-native-firebase/app-check';
import firestore from '@react-native-firebase/firestore';
import Colors from '../assets/utilities/Colors';
const ProfileDetails = props => {
  const {UID, navigation} = props;
  const {hasSpotify, setHasSpotify} = useContext(Context);
  const [topSongs, setTopSongs] = useState([]);
  const [likes, setLikes] = useState([]);
  const [allData, setAllData] = useState([]);
  const swiperRef = useRef();

  useEffect(() => {
    if (!UID) {
      return;
    }
    getTopSongs();
    const subscriber = firestore()
      .collection('feed')
      .where('type', '==', 'like')
      .where('user', '==', UID)
      .onSnapshot(resp => {
        console.log(resp);
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
    let isEmulator = await DeviceInfo.isEmulator();
    let authToken;
    if (!isEmulator) {
      authToken = await appCheck().getToken();
    }
    axios
      .get(`http://167.99.22.22/fetch/library?userId=${UID}&viewerId=${UID}`, {
        headers: {
          accept: 'application/json',
          Authorization: isEmulator
            ? 'Bearer ' + simKey
            : 'Bearer ' + authToken.token,
        },
      })
      .then(resp => {
        console.log(resp);
        setTopSongs(resp.data.data);
      })
      .catch(e => {
        console.log(e);
      });
  }

  useEffect(() => {
    if (topSongs.length > 0 && likes.length > 0) {
      setAllData([likes, topSongs]);
    }
  }, [topSongs, likes]);

  useEffect(() => {
    console.log(allData);
  }, [allData]);

  // useFocusEffect(
  //   useCallback(() => {
  //     // do something
  //     getTopSongs();
  //     return () => {
  //       console.log('left screen');
  //     };
  //   }, [UID]),
  // );
  return (
    <View style={styles.container}>
      {allData.length > 1 ? (
        <Swiper
          ref={swiperRef}
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
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
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
                      {topIndex === 1 ? (
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
                              <Text numberOfLines={1} style={styles.songName}>
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
                              <Text numberOfLines={1} style={styles.songName}>
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
    // backgroundColor: 'white',
    // width: '88%',
    alignSelf: 'center',
    flex: 1,
  },
  flatListContainer: {
    // backgroundColor: 'red',
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
  postContainer: {
    // padding: 16,
    marginTop: '1%',
    paddingHorizontal: '5%',
    paddingVertical: '4%',
    // backgroundColor: 'green',
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
});
