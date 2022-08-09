import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import React, {useState, useEffect, useContext, useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Swiper from 'react-native-swiper';
import Spotify from '../../assets/img/spotify.svg';
import {firebase} from '@react-native-firebase/firestore';
import BottomSheet from '../../components/BottomSheet';
import Sound from 'react-native-sound';
import {Context} from '../../context/Context';
const ViewPostsScreen = ({route, navigation}) => {
  const {userPosts} = route.params;
  const [postIndex, setPostIndex] = useState(0);
  const [postIDs, setPostIDs] = useState();
  const [likeFiller, setLikeFiller] = useState(false);
  const [like, setLike] = useState(false);
  const [firestoreQ, setFirestoreQ] = useState();
  const [postPreviewURL, setPostPreviewURL] = useState();
  const {currentPost, setCurrentPost, setProfileScreenFocus} =
    useContext(Context);
  const [songLoaded, setSongLoaded] = useState(false);
  const [loopValue, setLoopValue] = useState();
  const [trackPlaying, setTrackPlaying] = useState(true);
  const [postID, setPostID] = useState();

  useEffect(() => {
    if (userPosts) {
      console.log(userPosts);
      setPostIDs(userPosts.map(post => post.id));
    }
  }, [postIndex, userPosts]);

  useFocusEffect(
    useCallback(() => {
      setProfileScreenFocus(true);
      return () => setProfileScreenFocus(false);
    }, [setProfileScreenFocus]),
  );

  // get the first 10 tracks
  useEffect(() => {
    if (postIDs) {
      firestore()
        .collection('posts')
        // Filter results
        .where(
          firebase.firestore.FieldPath.documentId(),
          'in',
          postIDs.slice(0, 10),
        )
        .get()
        .then(querySnapshot => {
          console.log(querySnapshot._docs);
          setFirestoreQ(querySnapshot._docs);
        });
    }
  }, [postIDs]);

  //set the song preview url based on index of feed
  useEffect(() => {
    if (firestoreQ) {
      setPostPreviewURL(firestoreQ[postIndex]._data.previewUrl);
    }
  }, [firestoreQ, postIndex]);

  //set the sound of the current track
  useEffect(() => {
    if (postPreviewURL) {
      setCurrentPost(
        new Sound(postPreviewURL, null, error => {
          if (error) {
            console.log('failed to load the sound', error);
            return;
          }
          setSongLoaded(postPreviewURL);
          console.log('got sound');
        }),
      );
    } else {
      setCurrentPost(null);
    }
  }, [postPreviewURL]);

  //autoplay the track and keep playing when finished
  useEffect(() => {
    if (currentPost && songLoaded) {
      currentPost.play(success => {
        if (success) {
          console.log('successfully finished playing');
          setLoopValue(Math.random());
        } else {
          console.log('playback failed due to audio decoding errors');
        }
      });
    }
  }, [currentPost, songLoaded, loopValue]);

  const pauseHandler = () => {
    if (trackPlaying === false) {
      currentPost.play(success => {
        if (success) {
          setTrackPlaying(false);
          setLoopValue(Math.random());
        } else {
          console.log('playback failed due to audio decoding errors');
        }
      });
      setTrackPlaying(true);
    } else {
      currentPost.pause();
      setTrackPlaying(false);
    }
  };

  return (
    <>
      {firestoreQ ? (
        <>
          <SafeAreaView style={styles.container}>
            {/* <View style={styles.chevronContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('ProfileScreen')}>
              <Ionicons
                style={styles.chevron}
                name="chevron-back"
                color="white"
                size={50}
              />
            </TouchableOpacity>
          </View> */}
            <Swiper
              horizontal={true}
              showsButtons={false}
              index={0}
              loadMinimal={true}
              loop={false}
              onIndexChanged={index => {
                setPostIndex(index);
                setTrackPlaying(true);
                currentPost.pause();
                setPostID(firestoreQ[index].id);
              }}
              showsPagination={false}>
              {firestoreQ.map(post => {
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
                              //   showToast();
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
                    <BottomSheet captionProps={post._data.caption} />
                  </SafeAreaView>
                );
              })}
            </Swiper>
          </SafeAreaView>
        </>
      ) : (
        <>
          <SafeAreaView style={styles.container}>
            <Text>nothing here</Text>
          </SafeAreaView>
        </>
      )}
    </>
  );
};

export default ViewPostsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    // alignItems: 'center',
  },

  // chevronContainer: {
  //   width: '90%',
  //   marginTop: '2%',
  // },
  // swiper: {
  //   width: '100%',
  // },
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
