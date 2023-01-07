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
const ProfileDetails = props => {
  const {UID, navigation} = props;
  const {hasSpotify, setHasSpotify} = useContext(Context);
  const [allData, setAllData] = useState([]);

  async function getTopSongs() {
    setAllData([]);
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
        setAllData(current => [...current, resp.data.data]);
        firestore()
          .collection('feed')
          .where('type', '==', 'like')
          .where('user', '==', UID)
          .get()
          .then(resp => {
            console.log('likes', resp);
            setAllData(current => [...current, resp.docs]);
          })
          .catch(e => {
            console.log(e);
          });
      })
      .catch(e => {
        console.log(e);
      });
  }

  useEffect(() => {
    if (UID && hasSpotify) {
      getTopSongs();
    } else if (!hasSpotify) {
      //   setUserPosts(null);
    }
  }, [UID, hasSpotify]);

  useEffect(() => {
    console.log(allData);
  }, [allData]);
  return (
    <View style={styles.container}>
      {allData.length > 1 ? (
        <Swiper showsPagination={false} showsButtons={false} loop={false}>
          {allData.map((idk, topIndex) => {
            return (
              <FlatList
                numColumns={2}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingBottom: '40%',
                  alignSelf: 'center',
                }}
                style={{width: '100%', height: '100%', marginTop: 1}}
                key={topIndex}
                data={allData[topIndex]}
                renderItem={({item, index}) => {
                  return (
                    <>
                      {topIndex === 0 ? (
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
