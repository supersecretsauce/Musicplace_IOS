import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import Swiper from 'react-native-swiper';
import {firebase} from '@react-native-firebase/firestore';
import Spotify from '../../assets/img/spotify.svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import BottomSheet2 from '../../components/BottomSheet2';
const HomeScreen = () => {
  const [feed, setFeed] = useState(null);

  useEffect(() => {
    async function getFeed() {
      const docs = await firestore().collection('posts').get();
      console.log(docs);
      setFeed(docs._docs);
    }
    getFeed();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <>
        {feed ? (
          <>
            <Swiper showsButtons={false}>
              {feed.map(post => {
                return (
                  <View>
                    <Image
                      style={styles.songPhoto}
                      source={{
                        uri: post._data.songPhoto,
                      }}
                      resizeMode="cover"
                    />
                    {/* <View style={styles.topRow}>
                      <Text numberOfLines={1} style={styles.songName}>
                        {post._data.songName}
                      </Text>
                      <View style={styles.topRowRight}>
                        <Spotify />
                        <Ionicons
                          style={styles.likeIcon}
                          name={'heart-outline'}
                          color={'grey'}
                          size={28}
                        />
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
                    <TouchableOpacity style={styles.listenOnSpotifyBtn}>
                      <Spotify />
                      <Text style={styles.listenOnSpotifyText}>
                        LISTEN ON SPOTIFY
                      </Text>
                    </TouchableOpacity> */}
                  </View>
                );
              })}
            </Swiper>
            <View
              style={{
                backgroundColor: 'red',
                height: 500,
                width: 500,
                position: 'absolute',
              }}
            />
            {/* <BottomSheet2 /> */}
          </>
        ) : (
          <>
            <View>
              <Text>loading</Text>
            </View>
          </>
        )}
      </>
    </SafeAreaView>
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
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 350,
    alignSelf: 'center',
    marginTop: 10,
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
    top: 460,
  },
  listenOnSpotifyText: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginLeft: 10,
  },
});
