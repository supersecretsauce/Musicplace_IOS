import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
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
import BottomSheet from '../../components/BottomSheet';

const HomeScreen = () => {
  const [feed, setFeed] = useState();
  const [forYouTrue, setForYouTrue] = useState(true);
  const [like, setLike] = useState(false);
  const [likeFiller, setLikeFiller] = useState(false);
  const [fade, setFade] = useState(false);
  const [postPreviewURL, setPostPreviewURL] = useState();
  const [songIndex, setSongIndex] = useState(0);
  const [songLoaded, setSongLoaded] = useState(false);
  const [trackPlaying, setTrackPlaying] = useState(true);
  const [loopValue, setLoopValue] = useState();
  const {currentTrack, setCurrentTrack, setHomeScreenFocus} =
    useContext(Context);

  const focusHandler = () => {
    setForYouTrue(!forYouTrue);
  };

  useFocusEffect(
    useCallback(() => {
      setHomeScreenFocus(true);
      return () => setHomeScreenFocus(false);
    }, [setHomeScreenFocus]),
  );

  useEffect(() => {
    const fetchFeed = async () => {
      const feedData = await firestore().collection('posts').get();
      if (feedData) {
        console.log(feedData._docs);
        setFeed(feedData._docs);
      }
    };
    fetchFeed();
  }, []);

  useEffect(() => {
    if (feed) {
      setPostPreviewURL(feed[songIndex]._data.previewURL);
    }
  }, [feed, songIndex]);

  useEffect(() => {
    if (postPreviewURL) {
      console.log(postPreviewURL);

      setCurrentTrack(
        new Sound(postPreviewURL, null, error => {
          if (error) {
            console.log('failed to load the sound', error);
            return;
          }
          // loaded successfully
          console.log('loaded');
          setSongLoaded(postPreviewURL);
        }),
      );
    } else {
      setCurrentTrack(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postPreviewURL]);

  // useEffect(() => {
  //   if (currentTrack && songLoaded) {
  //     currentTrack.play(success => {
  //       if (success) {
  //         console.log('successfully finished playing');
  //         setLoopValue(Math.random());
  //       } else {
  //         console.log('playback failed due to audio decoding errors');
  //       }
  //     });
  //   }
  // }, [currentTrack, songLoaded, loopValue]);

  const pauseHandler = () => {
    if (trackPlaying === false) {
      currentTrack.play(success => {
        if (success) {
          console.log('done');
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

  useEffect(() => {
    if (like) {
      // setTimeout(setFade(true), 2000);
      setTimeout(() => setLike(false), 2000);
      console.log('like true');
    } else {
      setTimeout(() => setLike(false), 2000);
    }
  }, [like]);

  useEffect(() => {
    if (fade) {
      setFade(false);
      setLike(true);
      console.log('hey');
    }
  }, [fade]);

  return (
    <>
      {feed ? (
        <>
          <SafeAreaView style={styles.container}>
            {like ? (
              <>
                <View style={fade ? styles.addedSongFade : styles.addedSong}>
                  <Text
                    style={
                      fade ? styles.addedSongTextFade : styles.addedSongText
                    }>
                    {like ? 'Added to liked songs' : 'Removed from liked songs'}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View style={fade ? styles.addedSongFade : styles.addedSong}>
                  <Text
                    style={
                      fade ? styles.addedSongTextFade : styles.addedSongText
                    }>
                    Removed from liked songs
                  </Text>
                </View>
              </>
            )}
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
              }}
              style={styles.swiper}
              showsPagination={false}>
              {feed.map(post => {
                return (
                  <SafeAreaView
                    key={post._data.previewURL}
                    style={styles.postContainer}>
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
                        <Text
                          //   onPress={playTest}
                          numberOfLines={1}
                          style={styles.trackName}>
                          {post._data.songName}
                        </Text>
                        <View style={styles.trackInfoBottom}>
                          <Text numberOfLines={1} style={styles.artistName}>
                            {post._data.artistName.join(', ')}
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
                            }}>
                            <Ionicons
                              style={styles.socialIcon}
                              name={likeFiller ? 'heart' : 'heart-outline'}
                              color={likeFiller ? '#1DB954' : 'grey'}
                              size={24}
                            />
                          </TouchableOpacity>
                          <Text style={styles.likeCount}>10.7k</Text>
                        </View>
                      </View>
                    </View>
                    <BottomSheet captionProps={post._data.caption} />
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

export default HomeScreen;

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
  },
  spotifyButton: {
    marginTop: '4%',
  },
  likesContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  socialIcon: {
    marginRight: 2,
  },
  likeCount: {
    color: 'white',
    fontFamily: 'inter-regular',
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
