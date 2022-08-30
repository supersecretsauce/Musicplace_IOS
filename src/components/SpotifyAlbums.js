import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../assets/utilities/Colors';
import axios from 'axios';

const SpotifyAlbums = props => {
  const albums = props.savedAlbumsProp;
  const accessToken = props.accessTokenProp;
  const navigation = props.navigationProp;
  const [showAlbum, setShowAlbum] = useState(false);
  const [albumID, setAlbumID] = useState();
  const [albumTracks, setAlbumTracks] = useState();
  const [albumPhoto, setAlbumPhoto] = useState();
  const [idFilter, setIdFilter] = useState();
  const [albumName, setAlbumName] = useState();

  useEffect(() => {
    if (albums && showAlbum && albumID) {
      setIdFilter(albums.filter(array => array.album.id === albumID));
    }
  }, [albums, showAlbum, albumID]);

  useEffect(() => {
    if (idFilter) {
      setAlbumPhoto(idFilter[0].album.images[0].url);
    }
  }, [idFilter]);

  useEffect(() => {
    if (showAlbum && albumID) {
      const axiosAlbumFetch = async () => {
        try {
          // eslint-disable-next-line no-undef
          const response = await axios.get(
            `https://api.spotify.com/v1/albums/${albumID}/tracks`,
            {
              headers: {
                Authorization: 'Bearer ' + accessToken,
                'Content-Type': 'application/json',
              },
            },
          );

          setAlbumTracks(response.data.items);
        } catch (error) {
          console.log(error);
        }
      };
      axiosAlbumFetch();
    }
  }, [accessToken, albumID, showAlbum]);

  return (
    <>
      {showAlbum ? (
        <>
          <FlatList
            contentContainerStyle={{paddingBottom: 20}}
            style={{width: '100%', height: '100%'}}
            data={albumTracks}
            renderItem={({item, index}) => {
              return (
                <View key={index}>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('CompletePostScreen', {
                        song: item,
                        songPhoto: albumPhoto,
                        albumName: albumName,
                      });
                    }}>
                    <View style={styles.songContainer} key={index}>
                      <Image
                        style={styles.songPhoto}
                        source={{
                          uri: albumPhoto,
                        }}
                      />
                      <View style={styles.songInfoContainer}>
                        <View style={styles.trackNameContainer}>
                          <Text numberOfLines={1} style={styles.trackName}>
                            {item.name}
                          </Text>
                        </View>
                        <View style={styles.artistContainer}>
                          <Text numberOfLines={1} style={styles.artistText}>
                            {item.artists
                              .map(artist => {
                                return artist.name;
                              })
                              .join(', ')}
                          </Text>
                        </View>
                      </View>
                      <Ionicons
                        style={styles.circleClick}
                        name="chevron-forward"
                        color={Colors.greyOut}
                        size={25}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
          <TouchableOpacity
            onPress={() => setShowAlbum(false)}
            style={styles.backBtn}>
            <Text style={styles.back}>Back</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.trackScrollContainer}>
          <FlatList
            contentContainerStyle={{paddingBottom: 250}}
            style={{width: '100%', height: '100%'}}
            numColumns={2}
            data={albums}
            renderItem={({item, index}) => (
              <View style={styles.photoContainer} key={index}>
                <TouchableOpacity
                  onPress={() => {
                    setShowAlbum(true);
                    setAlbumID(item.album.id);
                    setAlbumName(item.album.name);
                  }}>
                  <Image
                    style={styles.albumPhotos}
                    source={{
                      uri: item.album.images[0]?.url,
                    }}
                  />
                  <Text numberOfLines={1} style={styles.albumName}>
                    {item.album.name}
                  </Text>
                  <View style={styles.lengthContainer}>
                    <Text numberOfLines={1} style={styles.artistName}>
                      {item.album.artists.map(artist => {
                        return artist.name;
                      })}
                    </Text>
                    <Ionicons
                      style={styles.dot}
                      name="ellipse"
                      color={Colors.greyOut}
                      size={3}
                    />
                    <Text style={styles.albumLength}>
                      {item.album.tracks.total} songs
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      )}
    </>
  );
};

export default SpotifyAlbums;

const styles = StyleSheet.create({
  trackScrollContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoContainer: {
    padding: 16,
    marginTop: '1%',
  },
  albumPhotos: {
    height: 160,
    width: 160,
  },
  albumName: {
    color: 'white',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginTop: '6%',
    maxWidth: 160,
  },
  lengthContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: '2%',
  },
  artistName: {
    color: Colors.greyOut,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    maxWidth: 100,
  },
  dot: {
    marginLeft: '2%',
  },
  albumLength: {
    color: Colors.greyOut,
    marginLeft: '2%',
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },

  //show tracks
  songContainer: {
    marginTop: '5%',
    flexDirection: 'row',
    marginLeft: '4%',
    alignItems: 'center',
  },
  songPhoto: {
    height: 50,
    width: 50,
  },
  songInfoContainer: {
    marginLeft: 10,
  },
  trackNameContainer: {
    marginBottom: 5,
  },
  trackName: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: 'white',
    width: 240,
  },
  artistContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  artistText: {
    color: Colors.greyOut,
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    maxWidth: 220,
  },
  smallDot: {
    marginLeft: 5,
  },
  albumText: {
    color: Colors.greyOut,
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    marginLeft: 5,
    width: 100,
  },
  circleClick: {
    position: 'absolute',
    marginLeft: '87%',
  },

  backBtn: {
    backgroundColor: Colors.red,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    marginTop: 688,
    marginLeft: '4%',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 9,
  },
  back: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
});
