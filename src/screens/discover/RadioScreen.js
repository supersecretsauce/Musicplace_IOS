import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  Linking,
} from 'react-native';
import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import Swiper from 'react-native-swiper';
import Sound from 'react-native-sound';
import Spotify from '../../assets/img/spotify.svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import BottomSheet from '../../components/BottomSheet';
import HapticFeedback from 'react-native-haptic-feedback';
import Toast from 'react-native-toast-message';
import {Context} from '../../context/Context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {mixpanel} from '../../../mixpanel';
import {firebase} from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import ShareSheet from '../../components/ShareSheet';
import axios from 'axios';
import LoadingPost from '../../components/LoadingPost';

const RadioScreen = ({route}) => {
  const {trackID} = route.params;
  Sound.setCategory('Playback');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [likedTracks, setLikedTracks] = useState([]);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [isOnHomeScreen, setIsOnHomeScreen] = useState(true);
  const [initialFeed, setInitialFeed] = useState(true);
  const [feed, setFeed] = useState(null);
  const {
    accessToken,
    refreshToken,
    setAccessToken,
    setRefreshToken,
    setHasSpotify,
    hasSpotify,
    setUID,
    UID,
    isNewUser,
  } = useContext(Context);

  useFocusEffect(
    useCallback(() => {
      setIsOnHomeScreen(true);
      if (currentTrack) {
        currentTrack.play();
        // eslint-disable-next-line react-hooks/exhaustive-deps
        playing = true;
        console.log('new start time set');
        setStartTime(new Date());
      }
      return () => {
        // if a user leaves the homescreen while feed is loading, don't play sound
        setIsOnHomeScreen(false);
        if (currentTrack) {
          currentTrack.pause();
          playing = false;
        }
      };
    }, [currentTrack]),
  );

  useEffect(() => {
    async function checkSpotifyConnection() {
      const spotifyBoolean = await AsyncStorage.getItem('hasSpotify');
      const localRefresh = await AsyncStorage.getItem('spotRefreshToken');
      const localAccess = await AsyncStorage.getItem('spotAccessToken');
      const localUID = await AsyncStorage.getItem('UID');
      if (spotifyBoolean === 'false') {
        setHasSpotify(false);
        setUID(localUID);
      } else if (spotifyBoolean === 'true') {
        setUID(localUID);
        setHasSpotify(true);
        setAccessToken(localAccess);
        setRefreshToken(localRefresh);
      }
    }
    checkSpotifyConnection();
  }, []);

  useEffect(() => {
    if (UID && trackID) {
      console.log(trackID);
      axios
        .get(`https://www.musicplaceapi.com/flow/track/${trackID}/user/${UID}`)
        .then(response => {
          console.log(response);
          setFeed(response.data);
        })
        .catch(e => {
          console.log(e);
        });
    }
  }, [UID, trackID]);

  useEffect(() => {
    if (feed && initialFeed && isOnHomeScreen) {
      let newTrack = new Sound(feed[currentIndex].previewUrl, null, error => {
        if (error) {
          console.log('failed to load the sound', error);
          return;
        } else {
          newTrack.play();
          newTrack.setNumberOfLoops(-1);
        }
      });
      setCurrentTrack(newTrack);
      setInitialFeed(false);
    }
  }, [feed, isOnHomeScreen]);

  useEffect(() => {
    console.log(currentIndex);
    if (feed && isOnHomeScreen) {
      if (currentIndex == Math.floor(feed.length / 2)) {
        // refetch if halfway
        console.log('getting new feed!');
        axios
          .get(
            `https://www.musicplaceapi.com/flow/track/${trackID}/user/${UID}`,
          )
          .then(resp => {
            console.log(resp);
            setFeed(current => [...current, ...resp.data]);
          })
          .catch(e => {
            console.log(e);
          });
      }
    }
  }, [currentIndex, isOnHomeScreen]);

  function handleIndexChange(index) {
    recordTime(index);
    currentTrack.stop();
    playNextTrack(index);
    setCurrentIndex(index);
    mixpanel.track('New Listen');
  }

  function playNextTrack(index) {
    let newTrack = new Sound(feed[index].previewUrl, null, error => {
      if (error) {
        console.log('failed to load the sound', error);
        return;
      } else {
        newTrack.play();
        newTrack.setNumberOfLoops(-1);
      }
    });
    setCurrentTrack(newTrack);
  }

  function recordTime() {
    let endTime = new Date();
    let timeDiff = endTime - startTime;

    firestore()
      .collection('users')
      .doc(UID)
      .collection('watches')
      .add({
        songID: feed[currentIndex].id,
        UID: UID,
        duration: timeDiff,
        date: new Date(),
      })
      .then(() => {
        console.log('added watch document');
        setStartTime(new Date());
      })
      .catch(error => {
        console.log(error);
      });
  }

  useEffect(() => {
    console.log(startTime);
  }, [startTime]);

  let playing = true;
  function pauseHandler() {
    if (playing) {
      currentTrack.pause();
      playing = false;
    } else {
      currentTrack.play();
      playing = true;
    }
  }

  function likeHandler() {
    if (hasSpotify) {
      if (likedTracks.includes(feed[currentIndex].id)) {
        HapticFeedback.trigger('impactLight');
        setLikedTracks(likedTracks.filter(id => id != feed[currentIndex].id));
        Toast.show({
          type: 'success',
          text1: 'Removed from liked songs',
          text2: 'Well that was quick.',
          visibilityTime: 2000,
        });
        axios
          .get(
            `https://www.musicplaceapi.com/updates/remove-track/${feed[currentIndex].id}/user/${UID}`,
          )
          .then(resp => {
            console.log(resp);
          })
          .catch(e => {
            console.log(e);
          });
      } else {
        HapticFeedback.trigger('impactHeavy');
        setLikedTracks(current => [...current, feed[currentIndex].id]);
        Toast.show({
          type: 'success',
          text1: 'Added to liked songs',
          text2: "Don't believe us? Check your spotify library.",
          visibilityTime: 2000,
        });
        axios
          .get(
            `https://www.musicplaceapi.com/updates/save-track/${feed[currentIndex].id}/user/${UID}`,
          )
          .then(resp => {
            console.log(resp);
          })
          .catch(e => {
            console.log(e);
          });
      }
    } else {
      Toast.show({
        type: 'info',
        text1: 'Connect to Spotify',
        text2: 'Connect to Spotify to save this track to your library.',
        visibilityTime: 2000,
      });
    }
  }

  async function listenOnSpotify() {
    await Linking.openURL(
      `http://open.spotify.com/track/${feed[currentIndex].id}`,
    );
  }

  return (
    <View style={styles.container}>
      {feed ? (
        <>
          <Swiper
            loadMinimal={true}
            onIndexChanged={index => handleIndexChange(index)}
            loop={false}
            showsButtons={false}>
            {feed.map((post, index) => {
              return (
                <View key={index}>
                  <TouchableWithoutFeedback onPress={pauseHandler}>
                    <Image
                      style={styles.songPhoto}
                      source={{
                        uri: post.songPhoto,
                      }}
                      resizeMode="cover"
                    />
                  </TouchableWithoutFeedback>
                  <View style={styles.topRow}>
                    <View style={styles.topRowLeft}>
                      <Spotify />
                      <Text numberOfLines={1} style={styles.songName}>
                        {post.songName}
                      </Text>
                    </View>
                    <View style={styles.topRowRight}>
                      <TouchableOpacity
                        style={styles.shareBtn}
                        onPress={() => setShowShareSheet(true)}>
                        <Ionicons name="share-outline" color="grey" size={28} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={likeHandler}>
                        <Ionicons
                          style={styles.likeIcon}
                          name={
                            likedTracks.includes(post.id)
                              ? 'heart'
                              : 'heart-outline'
                          }
                          color={
                            likedTracks.includes(post.id) ? '#1DB954' : 'grey'
                          }
                          size={28}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.bottomRow}>
                    <Text numberOfLines={1} style={styles.artistName}>
                      {post.artists
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
                    <Text numberOfLines={1} style={styles.albumName}>
                      {post.albumName}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.listenOnSpotifyBtn}
                    onPress={listenOnSpotify}>
                    <Spotify />
                    <Text style={styles.listenOnSpotifyText}>
                      LISTEN ON SPOTIFY
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </Swiper>
          <BottomSheet
            showShareSheet={showShareSheet}
            UID={UID}
            feed={feed}
            currentIndex={currentIndex}
          />
          <ShareSheet
            post={feed[currentIndex]}
            UID={UID}
            setShowShareSheet={setShowShareSheet}
            showShareSheet={showShareSheet}
          />
        </>
      ) : (
        <>
          <LoadingPost />
        </>
      )}
    </View>
  );
};

export default RadioScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  songPhoto: {
    height: 350,
    width: 350,
    alignSelf: 'center',
    marginTop: '13%',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 350,
    alignSelf: 'center',
    marginTop: 15,
  },
  topRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  songName: {
    color: 'white',
    fontFamily: 'Inter-bold',
    fontSize: 24,
    maxWidth: 250,
    marginLeft: 6,
  },
  topRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareBtn: {
    marginBottom: 4,
  },
  likeIcon: {
    marginLeft: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 350,
    alignSelf: 'center',
    paddingVertical: 5,
  },
  artistName: {
    color: 'white',
    fontFamily: 'Inter-regular',
    fontSize: 16,
    marginRight: 5,
    maxWidth: 170,
  },
  albumName: {
    color: 'white',
    fontFamily: 'Inter-regular',
    fontSize: 16,
    marginLeft: 5,
    maxWidth: 170,
  },
  listenOnSpotifyBtn: {
    position: 'absolute',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#1F1F1F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    top: 510,
  },
  listenOnSpotifyText: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginLeft: 10,
  },
});