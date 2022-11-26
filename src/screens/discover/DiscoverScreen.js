import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Keyboard,
} from 'react-native';
import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useMemo,
} from 'react';
import {Context} from '../../context/Context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../assets/utilities/Colors';
// import {authFetch} from '../../services/SpotifyService2';
import {debounce} from 'lodash';
import Animated, {
  useAnimatedGestureHandler,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {SPRING_CONFIG} from '../../assets/utilities/reanimated-2';
import Toast from 'react-native-toast-message';
import firestore from '@react-native-firebase/firestore';
import {useSpotifyService} from '../../hooks/useSpotifyService';
const DiscoverScreen = ({navigation}) => {
  const {
    accessToken,
    refreshToken,
    setAccessToken,
    setRefreshToken,
    hasSpotify,
  } = useContext(Context);
  const [results, setResults] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [playlists, setPlaylists] = useState(null);
  const {authFetch} = useSpotifyService();

  // useEffect(() => {
  //   authFetch(accessToken, refreshToken, setAccessToken, setRefreshToken)
  //     .get('/browse/featured-playlists?limit=50')
  //     .then(resp => {
  //       console.log(resp);
  //       // setPlaylists(resp.data.playlists.items);

  //       async function uploadPlaylists() {
  //         let trackHREF = resp.data.playlists.items[9].tracks.href;
  //         let playlistID = resp.data.playlists.items[9].id;
  //         // let docID = resp.data.playlists.items[0].id;
  //         await firestore()
  //           .collection('playlists')
  //           .doc(resp.data.playlists.items[9].id)
  //           .set({
  //             name: resp.data.playlists.items[9].name,
  //             playlistImage: resp.data.playlists.items[9].images[0].url,
  //             playlistID: resp.data.playlists.items[9].id,
  //             href: resp.data.playlists.items[9].href,
  //             description: resp.data.playlists.items[9].description,
  //             externalURL: resp.data.playlists.items[9].external_urls.spotify,
  //           })
  //           .then(resp => {
  //             authFetch(
  //               accessToken,
  //               refreshToken,
  //               setAccessToken,
  //               setRefreshToken,
  //             )
  //               .get(trackHREF)
  //               .then(resp => {
  //                 console.log(resp);
  //                 async function uploadPlaylistTracks() {
  //                   for (let i = 0; i < resp.data.items.length; i++) {
  //                     // use song id as doc id
  //                     await firestore()
  //                       .collection('posts')
  //                       .doc(resp.data.items[i].track.id)
  //                       .set({
  //                         albumId: resp.data.items[i].track.album.id,
  //                         albumName: resp.data.items[i].track.album.name,
  //                         artists: resp.data.items[i].track.artists,
  //                         availableMarkets:
  //                           resp.data.items[i].track.available_markets,
  //                         durationInMs: resp.data.items[i].track.duration_ms,
  //                         id: resp.data.items[i].track.id,
  //                         isExplicit: resp.data.items[i].track.explicit,
  //                         popularity: resp.data.items[i].track.popularity,
  //                         previewUrl: resp.data.items[i].track.preview_url,
  //                         releaseDate:
  //                           resp.data.items[i].track.album.release_date,
  //                         songName: resp.data.items[i].track.name,
  //                         songPhoto:
  //                           resp.data.items[i].track.album.images[0].url,
  //                         playlistID: playlistID,
  //                       })
  //                       .then(() => {
  //                         console.log('doc added');
  //                         // console.log('doc deleted');
  //                       })
  //                       .catch(e => {
  //                         console.log(e);
  //                       });
  //                   }
  //                 }
  //                 uploadPlaylistTracks();
  //               });
  //           })
  //           .catch(e => {
  //             console.log(e);
  //           });
  //       }
  //       uploadPlaylists();
  //     });
  // }, []);
  useEffect(() => {
    firestore()
      .collection('playlists')
      .get()
      .then(resp => {
        let playlistArr = [];
        resp.docs.forEach(doc => {
          playlistArr.push(doc.data());
        });
        console.log(playlistArr);
        setPlaylists(playlistArr);
      });
  }, []);

  const handleDebounce = debounce(value => {
    getData(value);
  }, 500);

  function getData(value) {
    authFetch(value)
      .get(
        `https://api.spotify.com/v1/search?type=track&include_external=audio&q=${value}`,
      )
      .then(resp => {
        if (resp && resp.status == 200) {
          console.log(resp.data.tracks.items);
          setResults(resp.data.tracks.items);
        }
      })
      .catch(e => {
        console.log(e);
      });
  }

  function handleSearchEnabling() {
    if (!hasSpotify) {
      Toast.show({
        type: 'error',
        text1: 'You need spotify to access this feature ',
        visibilityTime: 2000,
      });
    }
  }

  const width = useSharedValue('100%');
  const style = useAnimatedStyle(() => {
    return {
      width: width.value,
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      {!searchFocused && (
        <View style={styles.headerContainer}>
          <Text style={styles.discoverText}>Discover</Text>
        </View>
      )}
      <View style={styles.animatedContainer}>
        <Animated.View style={[styles.searchContainer, style]}>
          <Ionicons name={'search'} color={Colors.greyOut} size={20} />
          <TextInput
            editable={hasSpotify ? true : false}
            onPressIn={handleSearchEnabling}
            onFocus={() => {
              setSearchFocused(true);
              width.value = withSpring('80%', SPRING_CONFIG);
            }}
            onBlur={() => {
              setSearchFocused(false);
              width.value = withSpring('100%', SPRING_CONFIG);
            }}
            onChangeText={text => handleDebounce(text)}
            style={styles.textInput}
            placeholder="search for a track"
            placeholderTextColor={Colors.greyOut}
          />
        </Animated.View>
        <TouchableOpacity
          style={styles.cancelContainer}
          onPress={() => {
            Keyboard.dismiss();
            setSearchFocused(false);
          }}>
          <Text style={styles.cancelText}>cancel</Text>
        </TouchableOpacity>
      </View>
      {results && searchFocused ? (
        <View style={styles.resultsContainer}>
          <FlatList
            contentContainerStyle={{paddingBottom: '25%'}}
            data={results}
            renderItem={({item, index}) => {
              return (
                <TouchableOpacity
                  style={styles.songItem}
                  key={index}
                  onPress={() =>
                    navigation.navigate('HomeScreen', {
                      prevScreen: 'DiscoverScreen',
                      trackID: item.id,
                    })
                  }>
                  <View style={styles.songItemLeft}>
                    <Image
                      style={styles.songPhoto}
                      source={{
                        uri: item?.album?.images[0].url,
                      }}
                    />
                    <View style={styles.songItemMiddle}>
                      <Text numberOfLines={1} style={styles.songName}>
                        {item.name}
                      </Text>
                      <Text style={styles.artistName}>
                        {item.artists
                          .map(artist => {
                            return artist.name;
                          })
                          .join(', ')}
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name={'chevron-forward'}
                    color={Colors.greyOut}
                    size={20}
                  />
                </TouchableOpacity>
              );
            }}
          />
        </View>
      ) : (
        <></>
      )}
      {!searchFocused && playlists ? (
        <View style={styles.flatListContainer}>
          <FlatList
            contentContainerStyle={{alignSelf: 'center'}}
            data={playlists}
            numColumns={2}
            renderItem={({item, index}) => {
              return (
                <TouchableOpacity
                  style={styles.itemContainer}
                  onPress={() => {
                    navigation.navigate('PlaylistTracksScreen', {
                      playlistID: item.playlistID,
                    });
                  }}>
                  <Image
                    style={styles.playlistPhoto}
                    source={{
                      uri: item.playlistImage,
                    }}
                  />
                </TouchableOpacity>
              );
            }}
          />
        </View>
      ) : (
        <></>
      )}
    </SafeAreaView>
  );
};

export default DiscoverScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  headerContainer: {
    marginTop: '8%',
    alignItems: 'center',
    alignSelf: 'center',
  },
  discoverText: {
    fontFamily: 'Inter-Bold',
    color: 'white',
    fontSize: 18,
    alignSelf: 'center',
  },
  animatedContainer: {
    width: '90%',
    alignSelf: 'center',
    justifyContent: 'flex-start',
  },
  searchContainer: {
    marginTop: '8%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    paddingVertical: 10,
    borderRadius: 12,
    paddingLeft: 10,
  },
  textInput: {
    paddingLeft: 10,
    color: 'white',
    fontFamily: 'Inter-Regular',
    // backgroundColor: 'red',
    width: '90%',
    paddingVertical: 2,
  },
  cancelContainer: {
    position: 'absolute',
    right: '1.5%',
    top: 39,
    zIndex: -1,
  },
  cancelText: {
    color: 'white',
    fontFamily: 'Inter-SemiBold',
  },
  resultsContainer: {
    backgroundColor: 'black',
    alignSelf: 'center',
    width: '90%',
    height: '100%',
    marginTop: 10,
    zIndex: 2,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    width: '100%',
    justifyContent: 'space-between',
  },
  songItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  songPhoto: {
    height: 50,
    width: 50,
  },
  songItemMiddle: {
    marginLeft: 15,
  },
  songName: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: 'white',
    maxWidth: 250,
  },
  artistName: {
    color: Colors.greyOut,
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    maxWidth: 250,
  },
  //genre flatlist
  flatListContainer: {
    width: '90%',
    alignSelf: 'center',
    alignItems: 'center',
    // backgroundColor: 'red',
    justifyContent: 'center',
    flex: 1,
    marginTop: '5%',
  },
  itemContainer: {
    height: 135,
    width: 135,
    marginHorizontal: '5%',
    marginVertical: '5%',
  },
  playlistPhoto: {
    height: 135,
    width: 135,
  },
  playlistInfoContainer: {
    width: 135,
    height: 135,
    backgroundColor: 'grey',
  },
});
