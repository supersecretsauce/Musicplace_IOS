import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  Linking,
} from 'react-native';
import React, {useState, useEffect, useContext, useCallback} from 'react';
import Swiper from 'react-native-swiper';
import Sound from 'react-native-sound';
import Spotify from '../../assets/img/spotify.svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import BottomSheet2 from '../../components/BottomSheet2';
import HapticFeedback from 'react-native-haptic-feedback';
import Toast from 'react-native-toast-message';
import {authFetch} from '../../services/SpotifyService';
import {Context} from '../../context/Context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';

const HomeScreen = () => {
  Sound.setCategory('Playback');
  const [feed, setFeed] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [likedTracks, setLikedTracks] = useState([]);
  const [hasSpotify, setHasSpotify] = useState(null);
  const {accessToken, refreshToken, setAccessToken, setRefreshToken} =
    useContext(Context);

  useFocusEffect(
    useCallback(() => {
      if (currentTrack) {
        currentTrack.play();
      }
      return () => {
        if (currentTrack) {
          currentTrack.pause();
        }
      };
    }, [currentTrack]),
  );

  useEffect(() => {
    async function getFeed() {
      const docs = await firestore().collection('posts').get();
      console.log(docs);
      setFeed(docs._docs);
    }
    getFeed();
    async function checkSpotifyConnection() {
      const spotifyBoolean = await AsyncStorage.getItem('hasSpotify');
      const localRefresh = await AsyncStorage.getItem('spotRefreshToken');
      const localAccess = await AsyncStorage.getItem('spotAccessToken');
      const localUID = await AsyncStorage.getItem('UID');
      if (spotifyBoolean === 'false') {
        setHasSpotify(false);
      } else if (spotifyBoolean === 'true') {
        setHasSpotify(true);
        setAccessToken(localAccess);
        setRefreshToken(localRefresh);
      }
    }
    checkSpotifyConnection();
  }, []);

  useEffect(() => {
    if (feed) {
      let newTrack = new Sound(
        feed[currentIndex]._data.previewUrl,
        null,
        error => {
          if (error) {
            console.log('failed to load the sound', error);
            return;
          } else {
            newTrack.play();
            newTrack.setNumberOfLoops(-1);
          }
        },
      );
      setCurrentTrack(newTrack);
    }
  }, [currentIndex, feed]);

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
    if (likedTracks.includes(feed[currentIndex]._data.id)) {
      HapticFeedback.trigger('impactLight');
      setLikedTracks(
        likedTracks.filter(id => id != feed[currentIndex]._data.id),
      );
      Toast.show({
        type: 'success',
        text1: 'Removed from liked songs',
        text2: 'Well that was quick.',
        visibilityTime: 2000,
      });
      authFetch(accessToken, refreshToken, setAccessToken, setRefreshToken)
        .delete(`/me/tracks?ids=${feed[currentIndex]._data.id}`)
        .then(response => {
          console.log(response);
        })
        .catch(error => {
          console.log(error);
          return error;
        });
    } else {
      HapticFeedback.trigger('impactHeavy');
      setLikedTracks(current => [...current, feed[currentIndex]._data.id]);
      Toast.show({
        type: 'success',
        text1: 'Added to liked songs',
        text2: "Don't believe us? Check your spotify library.",
        visibilityTime: 2000,
      });
      authFetch(accessToken, refreshToken, setAccessToken, setRefreshToken)
        .put(`/me/tracks?ids=${feed[currentIndex]._data.id}`)
        .then(response => {
          console.log(response);
        })
        .catch(error => {
          console.log(error);
          return error;
        });
    }
  }

  async function listenOnSpotify() {
    await Linking.openURL(
      `http://open.spotify.com/track/${feed[currentIndex]._data.id}`,
    );
  }

  return (
    <View style={styles.container}>
      {feed ? (
        <>
          <Swiper
            loadMinimal={true}
            onIndexChanged={index => {
              currentTrack.stop();
              setCurrentIndex(index);
            }}
            loop={false}
            showsButtons={false}>
            {feed.map((post, index) => {
              return (
                <View key={index}>
                  <TouchableWithoutFeedback onPress={pauseHandler}>
                    <Image
                      style={styles.songPhoto}
                      source={{
                        uri: post._data.songPhoto,
                      }}
                      resizeMode="cover"
                    />
                  </TouchableWithoutFeedback>
                  <View style={styles.topRow}>
                    <Text numberOfLines={1} style={styles.songName}>
                      {post._data.songName}
                    </Text>
                    <View style={styles.topRowRight}>
                      <Spotify />
                      <TouchableOpacity onPress={likeHandler}>
                        <Ionicons
                          style={styles.likeIcon}
                          name={
                            likedTracks.includes(post._data.id)
                              ? 'heart'
                              : 'heart-outline'
                          }
                          color={
                            likedTracks.includes(post._data.id)
                              ? '#1DB954'
                              : 'grey'
                          }
                          size={28}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.bottomRow}>
                    <Text numberOfLines={1} style={styles.artistName}>
                      {post._data.artists
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
                      {post._data.albumName}
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
          <BottomSheet2 />
        </>
      ) : (
        <>
          <View>
            <Text>loading</Text>
          </View>
        </>
      )}
    </View>
  );
};

export default HomeScreen;

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
  songName: {
    color: 'white',
    fontFamily: 'Inter-bold',
    fontSize: 24,
    width: 275,
  },
  topRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
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
