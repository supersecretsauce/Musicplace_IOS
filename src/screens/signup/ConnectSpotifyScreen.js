import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Image,
} from 'react-native';
import Color from '../../assets/utilities/Colors';
import React from 'react';

const ConnectSpotifyScreen = ({navigation}) => {
  const goBack = () => {
    navigation.navigate('CreateUsernameScreen');
  };
  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={goBack}>
        <View style={styles.touchContainer}>
          <Image
            style={styles.chevron}
            source={require('../../assets/img/ChevronLeft.jpg')}
          />
        </View>
      </TouchableWithoutFeedback>
      <View style={styles.textContainer}>
        <Text style={styles.connect}>Connect with</Text>
        <Text style={styles.spotify}>Spotify?</Text>
        <Text style={styles.blurb}>
          Liked songs are automaticaly linked with Spotify.{' '}
        </Text>
      </View>
      <View style={styles.spotifyBtnContainer}>
        <TouchableOpacity style={styles.spotifyBtn}>
          <Text style={styles.spotifyText}>Connect with Spotify</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.laterBtnContainer}>
        <TouchableOpacity style={styles.laterBtn}>
          <Text style={styles.laterText}>Maybe Later</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ConnectSpotifyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  touchContainer: {
    width: '15%',
  },
  chevron: {
    marginTop: '1%',
  },
  textContainer: {
    marginTop: '25%',
    marginLeft: '10%',
  },
  connect: {
    color: 'white',
    fontFamily: 'Inter-Medium',
    fontSize: 30,
  },
  spotify: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 45,
    marginTop: '3%',
  },
  blurb: {
    color: Color.greyOut,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginTop: '3%',
  },
  spotifyBtnContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '18%',
  },
  spotifyBtn: {
    backgroundColor: Color.spotify,
    borderRadius: 5,
    paddingVertical: 10,
    marginTop: '5%',
    width: 317,
  },
  spotifyText: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    textAlign: 'center',
  },
  laterBtnContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  laterBtn: {
    backgroundColor: 'rgba(255, 8, 0, 0.5)',
    borderRadius: 5,
    paddingVertical: 10,
    marginTop: '5%',
    width: 317,
  },
  laterText: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    textAlign: 'center',
    opacity: 0.5,
  },
});
