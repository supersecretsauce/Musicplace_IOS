import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import React, {useState, useEffect, useContext, useCallback} from 'react';
import Colors from '../../assets/utilities/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Spotify from '../../assets/img/spotify.svg';
import firestore from '@react-native-firebase/firestore';
import Swiper from 'react-native-swiper';
import Sound from 'react-native-sound';
import {Context} from '../../context/Context';
import {useFocusEffect} from '@react-navigation/native';
import BottomSheetCopy from '../../components/BottomSheetCopy';
import Toast from 'react-native-toast-message';
import {authFetch} from '../../services/SpotifyService';
import AsyncStorage from '@react-native-async-storage/async-storage';
const HomeScreenCopy = () => {
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

  const {
    currentTrack,
    setCurrentTrack,
    setHomeScreenFocus,
    accessToken,
    refreshToken,
    setAccessToken,
    setRefreshToken,
  } = useContext(Context);

  // check if user has spotify connected to display proper screens
  useEffect(() => {
    const checkForSpotifyConnection = async () => {
      const spotifyBoolean = await AsyncStorage.getItem('hasSpotify');
      const localRefresh = await AsyncStorage.getItem('spotRefreshToken');
      const localAccess = await AsyncStorage.getItem('spotAccessToken');

      if (spotifyBoolean === 'false') {
        console.log('not connected');
      } else if (spotifyBoolean === 'true') {
        setAccessToken(localAccess);
        setRefreshToken(localRefresh);
        console.log(accessToken);
      }
    };
    checkForSpotifyConnection();
  }, [accessToken, setAccessToken, setRefreshToken]);

  const focusHandler = () => {
    setForYouTrue(!forYouTrue);
  };

  useFocusEffect(
    useCallback(() => {
      setHomeScreenFocus(true);
      return () => setHomeScreenFocus(false);
    }, [setHomeScreenFocus]),
  );

  // update this to run less often?
  useEffect(() => {
    const fetchFeed = async () => {
      const feedData = await firestore().collection('posts').get();
      if (feedData) {
        setFeed(feedData._docs);
      }
    };
    fetchFeed();
  }, []);

  //set the song preview url based on index of feed
  useEffect(() => {
    if (feed) {
      setPostPreviewURL(feed[songIndex]._data.previewUrl);
      console.log(feed);
    }
  }, [feed, songIndex]);

  //set the sound of the current track
  useEffect(() => {
    if (postPreviewURL) {
      setCurrentTrack(
        new Sound(postPreviewURL, null, error => {
          if (error) {
            console.log('failed to load the sound', error);
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
          console.log('successfully finished playing');
          setLoopValue(Math.random());
        } else {
          console.log('playback failed due to audio decoding errors');
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
          console.log('playback failed due to audio decoding errors');
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
          console.log(response);
        })
        .catch(error => {
          console.log(error);
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
          console.log(response);
        })
        .catch(error => {
          console.log(error);
          return error;
        });
    }
  };

  useEffect(() => {
    if (feed) {
      setSongID(feed[0].id);
    }
  }, [feed]);

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
            <Swiper
              horizontal={true}
              showsButtons={false}
              index={0}
              loadMinimal={true}
              onIndexChanged={index => {
                setSongIndex(index);
                setTrackPlaying(true);
                currentTrack.pause();
                setSongID(feed[index].id);
              }}
              showsPagination={false}>
              {feed.map(post => {
                return (
                  <SafeAreaView key={post.id} style={styles.postContainer}>
                    <TouchableOpacity
                      onPress={pauseHandler}
                      style={{
                        width: '100%',
                        alignSelf: 'center',
                        alignItems: 'center',
                      }}>
                      <Image
                        style={styles.coverArt}
                        source={{
                          uri: post._data.songPhoto,
                        }}
                      />
                    </TouchableOpacity>
                    <View style={styles.middleContainer}>
                      <View style={styles.trackInfoContainer}>
                        <Text numberOfLines={1} style={styles.trackName}>
                          {post._data.songName}
                        </Text>
                        <View style={styles.trackInfoBottom}>
                          <Text numberOfLines={1} style={styles.artistName}>
                            {Object.values(post._data.artists)
                              .map(artist => artist)
                              .join(', ')}
                          </Text>
                          <Ionicons
                            style={styles.smallDot}
                            name="ellipse"
                            color="white"
                            size={5}
                          />
                          <Text numberOfLines={1} style={styles.albumName}>
                            {post._data.albumName}
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
                              name={likeFiller ? 'heart' : 'heart-outline'}
                              color={likeFiller ? '#1DB954' : 'grey'}
                              size={28}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                    <BottomSheetCopy
                      songIDProps={songID}
                      captionProps={post._data.caption}
                    />
                  </SafeAreaView>
                );
              })}
            </Swiper>
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

export default HomeScreenCopy;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    flex: 1,
  },
  topContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
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
    alignItems: 'center',
  },
  coverArt: {
    marginTop: '5%',
    height: 350,
    width: '90%',
  },
  middleContainer: {
    width: '90%',
    marginVertical: '5%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: '11%',
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
});
