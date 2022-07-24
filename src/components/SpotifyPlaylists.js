import {StyleSheet, Text, View, Image, FlatList} from 'react-native';
import React from 'react';
import Colors from '../assets/utilities/Colors';
import {useEffect, useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SpotifyPlaylists = props => {
  const playlists = props.playlists;
  const [cleanPlaylists, setCleanPlaylists] = useState(null);
  const [cleanPlaylistInfo, setCleanPlaylistInfo] = useState(null);
  const [eligiblePlaylistArray, setEligiblePlaylistArray] = useState(null);

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

  return (
    <View>
      {eligiblePlaylistArray ? (
        <>
          <View style={styles.scrollContainer}>
            <FlatList
              numColumns={2}
              data={cleanPlaylistInfo}
              renderItem={({item, index}) => (
                <View style={styles.photoContainer} key={index}>
                  <Image
                    style={styles.playlistPhotos}
                    source={{
                      uri: item.images[0]?.url,
                    }}
                  />
                  <Text style={styles.playlistName}>
                    {item.name.slice(0, 19)}
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
                </View>
              )}
            />
          </View>
        </>
      ) : null}
    </View>
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
});
