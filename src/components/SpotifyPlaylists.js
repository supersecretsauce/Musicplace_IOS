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
  const [eligiblePlaylistArray, setEligiblePlaylistArray] = useState(null);
  const [playlistURL, setPlaylistURL] = useState(null);

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
    }
  }, [cleanPlaylists]);

  useEffect(() => {
    console.log(eligiblePlaylistArray);
  }, [playlistURL, eligiblePlaylistArray]);

  return (
    <View>
      {eligiblePlaylistArray ? (
        <>
          {/* <ScrollView numColumn={2} style={styles.scrollContainer}>
            {eligiblePlaylistArray.map(playlist => {
              return (
                <View style={styles.playlistContainer} key={playlist.url}>
                  <Image
                    style={styles.playlistPhotos}
                    source={{
                      uri: playlist.url,
                    }}
                  />
                </View>
              );
            })}
          </ScrollView> */}
          <FlatList
            data={eligiblePlaylistArray}
            renderItem={({item, index}) => (
              <View key={index}>
                <Image
                  style={styles.playlistPhotos}
                  source={{
                    uri: item.url,
                  }}
                />
              </View>
            )}
          />
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
    marginLeft: '4%',
  },
  playlistContainer: {
    marginTop: '6%',
  },
  playlistPhotos: {
    height: 160,
    width: 160,
  },
});
