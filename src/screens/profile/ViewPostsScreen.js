import {
  StyleSheet,
  Text,
  View,
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
import Toast from 'react-native-toast-message';
import {firebase} from '@react-native-firebase/firestore';
import {mixpanel} from '../../../mixpanel';
import ShareSheet from '../../components/ShareSheet';
import axios from 'axios';
const ViewPostsScreen = ({route, navigation}) => {
  Sound.setCategory('Playback');
  const {songInfo, UID, openSheet, commentDocID} = route.params ?? {};
  const [likedTracks, setLikedTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const {
    accessToken,
    refreshToken,
    setAccessToken,
    setRefreshToken,
    hasSpotify,
    trackDeepLink,
    setTrackDeepLink,
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
        UID: UID,
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
          mixpanel.track('New Listen');
          // console.log('user left screen');
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
    const unsubscribe = navigation.addListener('gestureStart', e => {
      // Do something
      console.log('swiped');
    });

    return unsubscribe;
  }, []);

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
    } else if (trackDeepLink) {
      firestore()
        .collection('posts')
        .doc(trackDeepLink)
        .get()
        .then(resp => {
          console.log(resp);
          songInfo = resp.data();
          setTrackDeepLink(null);
        });
      return;
    }
  }, [songInfo, trackDeepLink]);

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
        axios
          .get(
            `https://www.musicplaceapi.com/updates/remove-track/${songInfo[0].id}/user/${UID}`,
          )
          .then(resp => {
            console.log(resp);
          })
          .catch(e => {
            console.log(e);
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
        axios
          .get(
            `https://www.musicplaceapi.com/updates/save-track/${songInfo[0].id}/user/${UID}`,
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
    await Linking.openURL(`http://open.spotify.com/track/${songInfo[0].id}`);
  }

  return (
    <View style={styles.container}>
      {songInfo ? (
        <>
          <Swiper loadMinimal={true} loop={false} showsButtons={false}>
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
                      {post?.artists
                        ?.map(artist => {
                          return artist?.name;
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
          <SinglePostBottomSheet
            UID={UID}
            songInfo={songInfo}
            openSheet={openSheet}
            commentDocID={commentDocID}
            showShareSheet={showShareSheet}
          />
          <ShareSheet
            post={songInfo[0]}
            UID={UID}
            setShowShareSheet={setShowShareSheet}
            showShareSheet={showShareSheet}
          />
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

export default ViewPostsScreen;

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
