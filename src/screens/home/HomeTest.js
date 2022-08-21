import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  Linking,
  Dimensions,
} from 'react-native';
import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import Colors from '../../assets/utilities/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Spotify from '../../assets/img/spotify.svg';
import firestore from '@react-native-firebase/firestore';
import Swiper from 'react-native-swiper';
import Sound from 'react-native-sound';
import {Context} from '../../context/Context';
import {useFocusEffect} from '@react-navigation/native';
import BottomSheet from '../../components/BottomSheet';
import Toast from 'react-native-toast-message';
import {authFetch} from '../../services/SpotifyService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FollowingScreen from './FollowingScreen';
import SheetTest from '../../components/SheetTest';
const HomeTest = ({navigation}) => {
  const [feed, setFeed] = useState();
  const [forYouTrue, setForYouTrue] = useState(true);
  const [like, setLike] = useState(false);
  const [likeFiller, setLikeFiller] = useState(false);
  const [postPreviewURL, setPostPreviewURL] = useState();
  const [songIndex, setSongIndex] = useState(0);
  const [songLoaded, setSongLoaded] = useState(false);
  const [trackPlaying, setTrackPlaying] = useState(true);
  const [loopValue, setLoopValue] = useState();
  const [songID, setSongID] = useState();
  const [parentComments, setParentComments] = useState();
  const FlatListRef = useRef();
  const [currentIndex, setCurrentIndex] = useState(0);
  const {
    currentTrack,
    setCurrentTrack,
    setHomeScreenFocus,
    accessToken,
    refreshToken,
    setAccessToken,
    setRefreshToken,
  } = useContext(Context);

  const focusHandler = () => {
    setForYouTrue(!forYouTrue);
  };

  useFocusEffect(
    useCallback(() => {
      setHomeScreenFocus(true);
      return () => setHomeScreenFocus(false);
    }, [setHomeScreenFocus]),
  );

  //pause track when off the for you page
  useEffect(() => {
    if (forYouTrue && currentTrack) {
      currentTrack.play();
    } else if (forYouTrue === false) {
      currentTrack.pause();
    }
  }, [currentTrack, forYouTrue]);

  // check if user has spotify connected to display proper screens
  const checkForSpotifyConnection = useCallback(async () => {
    const spotifyBoolean = await AsyncStorage.getItem('hasSpotify');
    const localRefresh = await AsyncStorage.getItem('spotRefreshToken');
    const localAccess = await AsyncStorage.getItem('spotAccessToken');

    if (spotifyBoolean === 'false') {
    } else if (spotifyBoolean === 'true') {
      setAccessToken(localAccess);
      setRefreshToken(localRefresh);
    }
  }, [setAccessToken, setRefreshToken]);
  useEffect(() => {
    checkForSpotifyConnection();
  }, [accessToken, checkForSpotifyConnection, setAccessToken, setRefreshToken]);

  // update this to run less often?
  useEffect(() => {
    const fetchFeed = () => {
      firestore()
        .collection('posts')
        .orderBy('releaseDate', 'asc')

        .get()
        .then(querySnapshot => {
          // console.log(querySnapshot);
          setFeed(querySnapshot._docs);
        });
    };
    fetchFeed();
  }, []);

  //index logic
  const onViewableItemsChanged = ({viewableItems}) => {
    if (viewableItems) {
      // console.log(viewableItems[0].index);
      setCurrentIndex(viewableItems[0].index);
    }
  };

  const setTheIndex = useCallback(() => {
    setSongIndex(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    if (currentIndex) {
      setTheIndex();
    }
  }, [currentIndex, setTheIndex]);

  useEffect(() => {
    if (songIndex) {
      currentTrack.stop();
      setTrackPlaying(true);
      setSongID(feed[songIndex].id);
    }
  }, [currentTrack, feed, songIndex]);

  const viewabilityConfigCallbackPairs = useRef([{onViewableItemsChanged}]);
  //set the song preview url based on index of feed
  useEffect(() => {
    if (feed) {
      setPostPreviewURL(feed[songIndex]._data.previewUrl);
      console.log(feed);
    }
  }, [feed, songIndex]);

  // set the sound of the current track
  useEffect(() => {
    if (postPreviewURL) {
      setCurrentTrack(
        new Sound(postPreviewURL, null, error => {
          if (error) {
            // console.log('failed to load the sound', error);
            return;
          }
          setSongLoaded(postPreviewURL);
        }),
      );
    } else {
      setCurrentTrack(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postPreviewURL]);

  //autoplay the track and keep playing when finished
  useEffect(() => {
    if (currentTrack && songLoaded) {
      currentTrack.play(success => {
        if (success) {
          // console.log('successfully finished playing');
          setLoopValue(Math.random());
        } else {
          // console.log('playback failed due to audio decoding errors');
        }
      });
    }
  }, [currentTrack, songLoaded, loopValue]);

  const pauseHandler = () => {
    if (trackPlaying === false) {
      currentTrack.play(success => {
        if (success) {
          setTrackPlaying(false);
          setLoopValue(Math.random());
        } else {
          // console.log('playback failed due to audio decoding errors');
        }
      });
      setTrackPlaying(true);
    } else {
      currentTrack.pause();
      setTrackPlaying(false);
    }
  };

  //show notification when liking and unliking song
  const showToast = () => {
    if (like) {
      Toast.show({
        type: 'success',
        text1: 'Removed from liked songs',
        text2: 'Well that was quick.',
        visibilityTime: 2000,
      });
      authFetch(accessToken, refreshToken, setAccessToken, setRefreshToken)
        .delete(`/me/tracks?ids=${songID}`)
        .then(response => {
          // console.log(response);
        })
        .catch(error => {
          // console.log(error);
          return error;
        });
    } else if (!like && songID) {
      Toast.show({
        type: 'success',
        text1: 'Added to liked songs',
        text2: "Don't believe us? Check your spotify library.",
        visibilityTime: 2000,
      });
      authFetch(accessToken, refreshToken, setAccessToken, setRefreshToken)
        .put(`/me/tracks?ids=${songID}`)
        .then(response => {
          // console.log(response);
        })
        .catch(error => {
          // console.log(error);
          return error;
        });
    }
  };

  const listenOnSpotify = async () => {
    currentTrack.pause();
    await Linking.openURL(
      `http://open.spotify.com/track/${feed[songIndex].id}`,
    );
  };

  const getSong = useCallback(() => {
    if (songID) {
      // console.log('yo');
      firestore()
        .collection('posts')
        .doc(songID)
        .collection('comments')
        .where('parent', '==', 'none')
        .orderBy('likeAmount', 'desc')
        .get()
        .then(querySnapshot => {
          // console.log(querySnapshot);
          setParentComments(querySnapshot._docs);
        });
    }
  }, [songID]);

  useEffect(() => {
    getSong();
  }, [getSong, songID]);

  return (
    <>
      {feed ? (
        <>
          <SafeAreaView style={styles.container}>
            <View style={styles.topContainer}>
              <Text
                onPress={focusHandler}
                style={forYouTrue ? styles.unFocus : styles.Focus}>
                Following
              </Text>
              <Text
                onPress={focusHandler}
                style={forYouTrue ? styles.Focus : styles.unFocus}>
                For You
              </Text>
            </View>
            {forYouTrue ? (
              <>
                <FlatList
                  horizontal={true}
                  data={feed}
                  snapToAlignment="start"
                  decelerationRate={0.0001}
                  viewabilityConfigCallbackPairs={
                    viewabilityConfigCallbackPairs.current
                  }
                  snapToInterval={Dimensions.get('window').width}
                  renderItem={({item, index}) => {
                    return (
                      <>
                        <View style={styles.postContainer} key={index}>
                          <TouchableOpacity
                            onPress={pauseHandler}
                            // eslint-disable-next-line react-native/no-inline-styles
                            style={{
                              width: '100%',
                              alignItems: 'center',
                            }}>
                            <Image
                              style={styles.coverArt}
                              source={{
                                uri: item._data.songPhoto,
                              }}
                            />
                          </TouchableOpacity>
                          <View style={styles.middleContainer}>
                            <View style={styles.trackInfoContainer}>
                              <Text numberOfLines={1} style={styles.trackName}>
                                {item._data.songName}
                              </Text>
                              <View style={styles.trackInfoBottom}>
                                <Text
                                  numberOfLines={1}
                                  style={styles.artistName}>
                                  {/* {Object.values(post._data.artists)
                              .map(artist => artist)
                              .join(', ')} */}
                                  {item._data.artists
                                    .map(artist => {
                                      return artist.name;
                                    })
                                    .join(', ')}
                                </Text>
                                <Ionicons
                                  style={styles.smallDot}
                                  name="ellipse"
                                  color="white"
                                  size={5}
                                />
                                <Text
                                  numberOfLines={1}
                                  style={styles.albumName}>
                                  {item._data.albumName}
                                </Text>
                              </View>
                            </View>
                            <View style={styles.interactContainer}>
                              <TouchableOpacity style={styles.spotifyButton}>
                                <Spotify height={24} width={24} />
                              </TouchableOpacity>
                              <View style={styles.likesContainer}>
                                <TouchableOpacity
                                  onPress={() => {
                                    setLike(!like);
                                    setLikeFiller(!likeFiller);
                                    showToast();
                                  }}>
                                  <Ionicons
                                    style={styles.socialIcon}
                                    name={
                                      likeFiller ? 'heart' : 'heart-outline'
                                    }
                                    color={likeFiller ? '#1DB954' : 'grey'}
                                    size={28}
                                  />
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>
                          <TouchableOpacity
                            onPress={listenOnSpotify}
                            style={styles.listenOnSpot}>
                            <Text style={styles.listenOnSpotText}>
                              LISTEN ON SPOTIFY
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    );
                  }}
                />
                <BottomSheet />
              </>
            ) : (
              <FollowingScreen />
            )}
          </SafeAreaView>
        </>
      ) : (
        <>
          <SafeAreaView>
            <Text>Nothing to see here</Text>
          </SafeAreaView>
        </>
      )}
    </>
  );
};

export default HomeTest;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    flex: 1,
  },
  topContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  unFocus: {
    color: Colors.greyOut,
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginHorizontal: '5%',
  },
  Focus: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginHorizontal: '5%',
  },
  postContainer: {
    width: Dimensions.get('window').width,
    alignItems: 'center',
  },
  coverArt: {
    height: 350,
    width: 350,
    resizeMode: 'contain',
  },
  middleContainer: {
    width: '90%',
    marginTop: '5%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: '8.5%',
  },
  trackInfoContainer: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  trackName: {
    color: 'white',
    fontFamily: 'Inter-bold',
    fontSize: 24,
    width: 275,
  },
  trackInfoBottom: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  artistName: {
    color: 'white',
    fontFamily: 'Inter-regular',
    fontSize: 16,
    maxWidth: 130,
  },
  smallDot: {
    marginHorizontal: '2%',
  },
  albumName: {
    color: 'white',
    fontFamily: 'Inter-regular',
    fontSize: 16,
    maxWidth: 130,
  },
  interactContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  spotifyButton: {
    marginTop: '3%',
  },
  likesContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  socialIcon: {
    marginRight: 2,
  },
  addedSong: {
    position: 'absolute',
    backgroundColor: 'white',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 6,
    top: '99%',
    zIndex: 1,
    alignSelf: 'center',
  },
  addedSongText: {
    color: 'black',
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },

  addedSongFade: {
    position: 'absolute',
    backgroundColor: 'clear',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 6,
    top: '99%',
    zIndex: 0,
    alignSelf: 'center',
  },
  addedSongTextFade: {
    color: 'black',
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  listenOnSpot: {
    top: '6%',
    paddingHorizontal: 50,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: Colors.spotify,
  },
  listenOnSpotText: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
});
