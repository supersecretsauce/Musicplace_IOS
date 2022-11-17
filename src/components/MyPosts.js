import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import React, {useEffect, useState, useContext} from 'react';
import firestore from '@react-native-firebase/firestore';
import Colors from '../assets/utilities/Colors';
import {Context} from '../context/Context';
const MyPosts = props => {
  const {UID, navigation, userProfile} = props;
  const {hasSpotify} = useContext(Context);
  const [userPosts, setUserPosts] = useState(null);

  useEffect(() => {
    if (UID) {
      const subscriber = firestore()
        .collection('posts')
        .where('users', 'array-contains', UID)
        .get()
        .then(resp => {
          setUserPosts(resp.docs);
        });
      return () => subscriber;
    }
  }, [UID]);

  return (
    <View style={styles.container}>
      <>
        {userPosts ? (
          <>
            <View style={styles.trackScrollContainer}>
              <FlatList
                data={userPosts}
                numColumns={2}
                contentContainerStyle={{paddingBottom: '40%'}}
                style={{width: '100%', height: '100%', marginTop: 1}}
                renderItem={({item, index}) => {
                  return (
                    <View style={styles.postContainer} key={index}>
                      <TouchableOpacity
                        onPress={() => {
                          navigation.navigate('ViewPostsScreen', {
                            //making the song an array so it works with swiper package
                            songInfo: [userPosts[index]],
                            UID: UID,
                          });
                        }}>
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
                          <Text numberOfLines={1} style={styles.artistName}>
                            {item._data.artists
                              ?.map(artist => {
                                return artist.name;
                              })
                              .join(', ')}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                }}
              />
            </View>
          </>
        ) : (
          <>
            {hasSpotify ? (
              <View style={styles.loadingContainer}>
                <Image
                  style={styles.loadingGif}
                  source={require('../assets/img/pacman.gif')}
                />
                <Text style={styles.loadingText}>
                  Getting your top songs from Spotify.
                </Text>
              </View>
            ) : (
              <>
                <Text> Connect to Spotify to get your top songs.</Text>
              </>
            )}
          </>
        )}
      </>
    </View>
  );
};

export default MyPosts;

const styles = StyleSheet.create({
  container: {
    marginTop: 215,
  },
  trackScrollContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  postContainer: {
    padding: 16,
    marginTop: '1%',
    paddingHorizontal: '6%',
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
  loadingContainer: {
    alignSelf: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 60,
  },
  loadingGif: {
    height: 100,
    width: 100,
  },
  loadingText: {
    color: 'white',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
});
