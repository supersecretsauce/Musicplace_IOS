import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import Colors from '../assets/utilities/Colors';
import {useEffect, useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const SpotifyPlaylists = props => {
  const playlists = props.playlists;
  const accessToken = props.accessTokenProp;
  const [cleanPlaylists, setCleanPlaylists] = useState(null);
  const [cleanPlaylistInfo, setCleanPlaylistInfo] = useState(null);
  const [eligiblePlaylistArray, setEligiblePlaylistArray] = useState(null);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [playlistTracks, setPlaylistTracks] = useState();
  const [playlistID, setPlaylistID] = useState();

  useEffect(() => {
    if (playlists) {
      setCleanPlaylists(playlists.map(playlist => playlist.images[0]));
    }
  }, [playlists]);

  useEffect(() => {
    if (cleanPlaylists) {
      setEligiblePlaylistArray(
        cleanPlaylists.filter(playlist => playlist !== undefined),
      );
      setCleanPlaylistInfo(
        playlists.filter(playlist => playlist?.images[0] !== undefined),
      );
    }
  }, [cleanPlaylists, playlists]);

  useEffect(() => {
    if (showPlaylist && playlistID) {
      const axiosPlaylistFetch = async () => {
        try {
          // eslint-disable-next-line no-undef
          const response = await axios.get(
            `https://api.spotify.com/v1/playlists/${playlistID}/tracks`,
            {
              headers: {
                Authorization: 'Bearer ' + accessToken,
                'Content-Type': 'application/json',
              },
            },
          );
          console.log(response.data.items);
          console.log('album tracks above');
          setPlaylistTracks(response.data.items);
        } catch (error) {
          console.log(error);
        }
      };
      axiosPlaylistFetch();
    }
  }, [accessToken, playlistID, showPlaylist]);

  return (
    <>
      {eligiblePlaylistArray ? (
        <>
          {showPlaylist ? (
            <>
              <View style={styles.trackScrollContainer}>
                <FlatList
                  contentContainerStyle={{paddingBottom: 20}}
                  style={{width: '100%', height: '100%'}}
                  data={playlistTracks}
                  renderItem={({item, index}) => {
                    return (
                      <TouchableOpacity>
                        <View style={styles.songContainer} key={index}>
                          <Image
                            style={styles.songPhoto}
                            source={{
                              uri: item.track.album.images[0].url,
                            }}
                          />
                          <View style={styles.songInfoContainer}>
                            <View style={styles.trackNameContainer}>
                              <Text numberOfLines={1} style={styles.trackName}>
                                {item.track.name}
                              </Text>
                            </View>
                            <View style={styles.artistContainer}>
                              <Text numberOfLines={1} style={styles.artistText}>
                                {item.track.artists
                                  .map(artist => {
                                    return artist.name;
                                  })
                                  .join(', ')}
                              </Text>
                              <Ionicons
                                style={styles.smallDot}
                                name="ellipse"
                                color={Colors.greyOut}
                                size={3}
                              />
                              <Text numberOfLines={1} style={styles.albumText}>
                                {item.track.album.name}
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
                    );
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowPlaylist(false)}
                  style={styles.backBtn}>
                  <Text style={styles.back}>Back</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <FlatList
              contentContainerStyle={{paddingBottom: 15}}
              style={{width: '100%', height: '100%'}}
              numColumns={2}
              data={cleanPlaylistInfo}
              renderItem={({item, index}) => (
                <View style={styles.photoContainer} key={index}>
                  <TouchableOpacity
                    onPress={() => {
                      setShowPlaylist(true);
                      setPlaylistID(item.id);
                    }}>
                    <Image
                      style={styles.playlistPhotos}
                      source={{
                        uri: item.images[0]?.url,
                      }}
                    />
                    <Text numberOfLines={1} style={styles.playlistName}>
                      {item.name}
                    </Text>
                    <View style={styles.lengthContainer}>
                      <Text style={styles.playlist}>Playlist</Text>
                      <Ionicons
                        style={styles.dot}
                        name="ellipse"
                        color={Colors.greyOut}
                        size={3}
                      />
                      <Text style={styles.playlistLength}>
                        {item.tracks.total} songs
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </>
      ) : null}
    </>
  );
};

export default SpotifyPlaylists;

const styles = StyleSheet.create({
  scrollContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoContainer: {
    padding: 16,
    marginTop: '1%',
  },
  playlistPhotos: {
    height: 160,
    width: 160,
  },
  playlistName: {
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
  playlist: {
    color: Colors.greyOut,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  dot: {
    marginLeft: '2%',
  },
  playlistLength: {
    color: Colors.greyOut,
    marginLeft: '2%',
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },

  // show tracks

  trackScrollContainer: {
    flex: 1,
  },
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
    maxWidth: 120,
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
    marginTop: 450,
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
