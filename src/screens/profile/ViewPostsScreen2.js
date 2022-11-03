import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import React, {useEffect, useState, useCallback, useContext} from 'react';
import {Context} from '../../context/Context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Spotify from '../../assets/img/spotify.svg';
import SinglePostBottomSheet from '../../components/SinglePostBottomSheet';
import Swiper from 'react-native-swiper';
import Sound from 'react-native-sound';
import firestore from '@react-native-firebase/firestore';
import {useFocusEffect} from '@react-navigation/native';
import HapticFeedback from 'react-native-haptic-feedback';
import {authFetch} from '../../services/SpotifyService';
import Toast from 'react-native-toast-message';

// USE MIXPANEL LISTENS

const ViewPostsScreen2 = ({route}) => {
  Sound.setCategory('Playback');
  const {songInfo, UID} = route.params;
  const [likedTracks, setLikedTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const {
    accessToken,
    refreshToken,
    setAccessToken,
    setRefreshToken,
    hasSpotify,
  } = useContext(Context);

  let playing = true;
  let startTime = new Date();

  function recordTime() {
    let endTime = new Date();
    let timeDiff = endTime - startTime;
    startTime = new Date();
    firestore()
      .collection('users')
      .doc(UID)
      .collection('watches')
      .add({
        songID: songInfo[0].id,
        duration: timeDiff,
        date: new Date(),
      })
      .then(() => {
        console.log('added watch document');
      })
      .catch(error => {
        console.log(error);
      });
  }

  useFocusEffect(
    useCallback(() => {
      if (currentTrack) {
        currentTrack.play();
        // eslint-disable-next-line react-hooks/exhaustive-deps
        playing = true;
      }
      return () => {
        if (currentTrack) {
          currentTrack.pause();
          playing = false;
          recordTime();
          console.log('user left screen');
        }
      };
    }, [currentTrack]),
  );

  function pauseHandler() {
    if (playing) {
      currentTrack.pause();
      playing = false;
    } else {
      currentTrack.play();
      playing = true;
    }
  }

  useEffect(() => {
    if (songInfo) {
      console.log(songInfo);
      let newTrack = new Sound(songInfo[0].previewUrl, null, error => {
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
  }, [songInfo]);

  function likeHandler() {
    if (hasSpotify) {
      if (likedTracks.includes(songInfo[0].id)) {
        HapticFeedback.trigger('impactLight');
        setLikedTracks(likedTracks.filter(id => id != songInfo[0].id));
        Toast.show({
          type: 'success',
          text1: 'Removed from liked songs',
          text2: 'Well that was quick.',
          visibilityTime: 2000,
        });
        authFetch(accessToken, refreshToken, setAccessToken, setRefreshToken)
          .delete(`/me/tracks?ids=${songInfo[0].id}`)
          .then(response => {
            console.log(response);
          })
          .catch(error => {
            console.log(error);
            return error;
          });
      } else {
        HapticFeedback.trigger('impactHeavy');
        setLikedTracks(current => [...current, songInfo[0].id]);
        Toast.show({
          type: 'success',
          text1: 'Added to liked songs',
          text2: "Don't believe us? Check your spotify library.",
          visibilityTime: 2000,
        });
        authFetch(accessToken, refreshToken, setAccessToken, setRefreshToken)
          .put(`/me/tracks?ids=${songInfo[0].id}`)
          .then(response => {
            console.log(response);
          })
          .catch(error => {
            console.log(error);
            return error;
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
    await Linking.openURL(`http://open.spotify.com/track/${songInfo[0].id}`);
  }

  return (
    <View style={styles.container}>
      {songInfo ? (
        <>
          <Swiper
            loadMinimal={true}
            onIndexChanged={index => {
              //   currentTrack.stop();
              //   setCurrentIndex(index);
              //   mixpanel.track('New Listen');
              //   recordTime();
            }}
            loop={false}
            showsButtons={false}>
            {songInfo.map((post, index) => {
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
                    <Text numberOfLines={1} style={styles.songName}>
                      {post.songName}
                    </Text>
                    <View style={styles.topRowRight}>
                      <Spotify />
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
          <SinglePostBottomSheet UID={UID} songInfo={songInfo} />
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

export default ViewPostsScreen2;

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
