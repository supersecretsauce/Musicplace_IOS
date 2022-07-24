import {StyleSheet, Text, View, FlatList, Image} from 'react-native';
import React, {useState, useEffect} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../assets/utilities/Colors';
const SpotifyLikedSongs = props => {
  const likedSongs = props.likedSongsProp;
  const [likedSongsArray, setLikedSongsArray] = useState(null);
  console.log(likedSongs);

  useEffect(() => {
    if (likedSongs) {
      setLikedSongsArray(likedSongs);
    }
  }, [likedSongs]);

  //   useEffect(() => {
  //     if (likedSongsArray) {
  //       console.log(likedSongsArray.map(song => song.track.artists[1].name));
  //     }
  //   }, [likedSongsArray]);
  return (
    <View>
      {likedSongsArray ? (
        <>
          <View style={styles.scrollContainer}>
            <FlatList
              contentContainerStyle={{paddingBottom: 260}}
              style={{width: '100%', height: '100%'}}
              data={likedSongsArray}
              renderItem={({item, index}) => {
                console.log(item);
                return (
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
                      name="ellipse-outline"
                      color={Colors.greyOut}
                      size={30}
                    />
                  </View>
                );
              }}
            />
          </View>
        </>
      ) : null}
    </View>
  );
};

export default SpotifyLikedSongs;

const styles = StyleSheet.create({
  text: {
    color: 'white',
  },
  scrollContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  songContainer: {
    marginTop: '5%',
    flexDirection: 'row',
    padding: 5,
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
    marginLeft: '90%',
  },
});
