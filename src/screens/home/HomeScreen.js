import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import React, {useState} from 'react';
import Colors from '../../assets/utilities/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Spotify from '../../assets/img/spotify.svg';
const HomeScreen = () => {
  const windowSize = Dimensions.get('screen');
  const {width, height} = windowSize;
  console.log(width);
  const [forYouTrue, setForYouTrue] = useState(true);

  const focusHandler = () => {
    setForYouTrue(!forYouTrue);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topContainer}>
        <Text
          onPress={focusHandler}
          style={forYouTrue ? styles.unFocus : styles.Focus}>
          Following
        </Text>
        <Text
          onPress={focusHandler}
          style={forYouTrue ? styles.Focus : styles.unFocus}>
          For You
        </Text>
      </View>
      <Image
        resizeMode="cover"
        style={styles.coverArt}
        source={{
          uri: 'https://i.scdn.co/image/ab67616d0000b273f41c94f8b2ba32c8823813a6',
        }}
      />
      <View style={styles.middleContainer}>
        <View style={styles.trackInfoContainer}>
          <Text style={styles.trackName}>Beachside</Text>
          <Text style={styles.artistName}>Relyae</Text>
          <Text style={styles.albumName}>Album</Text>
        </View>
        <View style={styles.interactContainer}>
          <View style={styles.likesContainer}>
            <Ionicons
              style={styles.socialIcon}
              name="heart-outline"
              color="grey"
              size={24}
            />
            <Text style={styles.likeCount}>likes</Text>
          </View>
          {/* <Image
            style={styles.spotifyButton}
            source={require('../../assets/img/spotify-icon.svg')}
          /> */}
          <Spotify style={{height: 25, width: 25}} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
  },
  topContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  unFocus: {
    color: Colors.greyOut,
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginHorizontal: '5%',
  },
  Focus: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginHorizontal: '5%',
  },

  coverArt: {
    marginTop: '5%',
    marginBottom: '3%',
    height: '46%',
    width: '90%',
  },
  middleContainer: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: '11.5%',
  },
  trackInfoContainer: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  trackName: {
    color: 'white',
    fontFamily: 'Inter-bold',
    fontSize: 24,
  },
  artistName: {
    color: 'white',
    fontFamily: 'Inter-regular',
    fontSize: 16,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  albumName: {
    color: 'white',
    fontFamily: 'Inter-regular',
    fontSize: 16,
  },

  interactContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  likesContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  likeCount: {
    color: 'white',
  },
  spotifyButton: {
    height: 25,
    width: 25,
  },
});
