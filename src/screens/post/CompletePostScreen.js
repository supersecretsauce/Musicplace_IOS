import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Colors from '../../assets/utilities/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CompletePostScreen = ({route, navigation}) => {
  const {song, songPhoto} = route.params;
  const [songIMG, setSongIMG] = useState();
  console.log(song);
  useEffect(() => {
    if (songPhoto) {
      setSongIMG(songPhoto);
    }
  }, [songPhoto]);

  return (
    <>
      {songIMG ? (
        <></>
      ) : (
        <View style={styles.container}>
          <View style={styles.postContainer}>
            <View style={styles.topContainer}>
              <Ionicons
                style={styles.chevron}
                name="chevron-back"
                color="white"
                size={50}
              />
              <Text style={styles.post}>Post</Text>
            </View>
          </View>
          <View style={styles.trackContainer}>
            <Image
              style={styles.songIMG}
              source={{
                uri: song.album.images[0].url,
              }}
            />
            <View style={styles.songInfoContainer}>
              <Text style={styles.songName}>{song.name}</Text>
              <View style={styles.artistContainer}>
                <Text style={styles.byText}>by </Text>
                <Text style={styles.artists}>
                  {song.artists.map(artist => artist.name).join(', ')}
                </Text>
              </View>
              <View style={styles.albumContainer}>
                <Text style={styles.byText}>from </Text>
                <Text style={styles.albumName}>{song.album.name}</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </>
  );
};

export default CompletePostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  postContainer: {
    backgroundColor: Colors.lightBlack,
    height: '18%',
  },
  topContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '18%',
  },
  chevron: {
    marginRight: '85%',
  },
  post: {
    position: 'absolute',
    color: 'white',
    fontFamily: 'Inter-Semibold',
    fontSize: 22,
  },

  trackContainer: {
    marginTop: '10%',
    flexDirection: 'row',
  },
  songIMG: {
    height: 140,
    width: 140,
  },
  songInfoContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  songName: {
    color: 'white',
    fontFamily: 'Inter-bold',
    fontSize: 30,
  },
  artistContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  byText: {
    color: 'white',
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  artists: {
    color: 'white',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  albumContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  albumName: {
    color: 'white',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
});
