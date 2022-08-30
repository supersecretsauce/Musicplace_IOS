import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import Colors from '../../assets/utilities/Colors';
import HapticFeedback from 'react-native-haptic-feedback';

const SwipeUpScreen = ({navigation}) => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.swipeText}>Swipe Vertically</Text>
      <Text style={styles.swipeDesc}>
        Expand the comment section or listen to a song on Spotify.
      </Text>
      <Image
        source={{
          uri: 'https://firebasestorage.googleapis.com/v0/b/musicplace-66f20.appspot.com/o/vertical-gif.gif?alt=media&token=2e20d893-d078-4ffe-93e6-edbe86ceb5fc',
        }}
        style={styles.gif}
      />
      <View style={styles.nextBtnContainer}>
        <TouchableOpacity
          onPress={() => {
            HapticFeedback.trigger('impactHeavy');
            navigation.navigate('SwipeRightScreen');
          }}
          style={styles.nextBtn}>
          <Text style={styles.nextText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SwipeUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
  },
  swipeText: {
    color: 'white',
    fontFamily: 'Inter-bold',
    fontSize: 35,
    marginTop: '10%',
  },
  swipeDesc: {
    color: 'white',
    fontFamily: 'inter-regular',
    fontSize: 20,
    width: '85%',
    marginTop: '3%',
    lineHeight: 28,
    textAlign: 'center',
  },
  gif: {
    height: '60%',
    width: '90%',
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: '3%',
  },
  nextBtnContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '5%',
  },
  nextBtn: {
    backgroundColor: Colors.red,
    borderRadius: 9,
    paddingVertical: 10,
    marginTop: '5%',
    width: 317,
  },
  nextText: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    textAlign: 'center',
  },
});
