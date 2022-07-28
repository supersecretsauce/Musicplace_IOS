import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../assets/utilities/Colors';
import axios from 'axios';

const SpotifyArtists = props => {
  const [artistID, setArtistID] = useState();
  const [showArtist, setShowArtist] = useState();
  const [artistTracks, setArtistTracks] = useState();
  const artists = props.userFollowingProp;
  const accessToken = props.accessTokenProp;
  const navigation = props.navigationProp;
  const numFormat = new Intl.NumberFormat('en');
  //   console.log(artists);

  useEffect(() => {
    if (artistID && showArtist) {
      const axiosArtistTracksFetch = async () => {
        try {
          // eslint-disable-next-line no-undef
          const response = await axios.get(
            `https://api.spotify.com/v1/artists/${artistID}/top-tracks?market=US`,
            {
              headers: {
                Authorization: 'Bearer ' + accessToken,
                'Content-Type': 'application/json',
              },
            },
          );

          setArtistTracks(response.data.tracks);
        } catch (error) {
          console.log(error);
        }
      };
      axiosArtistTracksFetch();
    }
  }, [accessToken, artistID, showArtist]);

  return (
    <>
      {showArtist ? (
        <>
          <FlatList
            contentContainerStyle={{paddingBottom: 20}}
            style={{width: '100%', height: '100%'}}
            data={artistTracks}
            renderItem={({item, index}) => {
              return (
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('CompletePostScreen', {
                      song: item,
                    });
                  }}>
                  <View style={styles.songContainer} key={index}>
                    <Image
                      style={styles.songPhoto}
                      source={{
                        uri: item.album.images[0]?.url,
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
              );
            }}
          />
          <TouchableOpacity
            onPress={() => setShowArtist(false)}
            style={styles.backBtn}>
            <Text style={styles.back}>Back</Text>
          </TouchableOpacity>
        </>
      ) : (
        <FlatList
          contentContainerStyle={{paddingBottom: 20}}
          style={{width: '100%', height: '100%'}}
          numColumns={2}
          data={artists}
          renderItem={({item, index}) => (
            <View style={styles.photoContainer} key={index}>
              <TouchableOpacity
                onPress={() => {
                  setShowArtist(true);
                  setArtistID(item.id);
                }}>
                <Image
                  style={styles.albumPhotos}
                  source={{
                    uri: item.images[0]?.url,
                  }}
                />
                <Text numberOfLines={1} style={styles.albumName}>
                  {item.name}
                </Text>
                <View style={styles.lengthContainer}>
                  <Text numberOfLines={1} style={styles.artistName}>
                    {numFormat.format(item.followers.total)} followers
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </>
  );
};

export default SpotifyArtists;

const styles = StyleSheet.create({
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
