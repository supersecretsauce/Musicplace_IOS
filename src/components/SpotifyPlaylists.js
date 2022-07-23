import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  FlatList,
} from 'react-native';
import React from 'react';
import {useEffect, useState} from 'react';

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

  //   useEffect(() => {
  //     if (cleanPlaylistInfo) {
  //       console.log(cleanPlaylistInfo);
  //     }
  //   }, [cleanPlaylistInfo]);

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
                  <Text style={styles.text}>{item.name}</Text>
                </View>
              )}
            />
            {/* {cleanPlaylistInfo.map(playlist => {
              return (
                <>
                  <View key={playlist.id}>
                    <Text style={styles.text}>{playlist.name}</Text>
                  </View>
                </>
              );
            })} */}
          </View>
        </>
      ) : null}
    </View>
  );
};

export default SpotifyPlaylists;

const styles = StyleSheet.create({
  text: {
    color: 'white',
  },
  scrollContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoContainer: {
    padding: 19,
    marginTop: '5%',
  },
  playlistPhotos: {
    height: 160,
    width: 160,
  },
});
