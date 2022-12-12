import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, {useContext} from 'react';
import Colors from '../../assets/utilities/Colors';
import {Context} from '../../context/Context';
import HapticFeedback from 'react-native-haptic-feedback';
import FastImage from 'react-native-fast-image';

const SwipeRightScreen = ({navigation}) => {
  const {setUserLogin} = useContext(Context);
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.swipeText}>Swipe Horizontally</Text>
      <Text style={styles.swipeDesc}>
        Swipe right to navigate to the next song.
      </Text>
      <FastImage
        source={{
          uri: 'https://firebasestorage.googleapis.com/v0/b/musicplace-66f20.appspot.com/o/gif2.gif?alt=media&token=39438028-84f0-4e23-860e-6dbdebd37865',
          priority: FastImage.priority.high,
        }}
        resizeMode={FastImage.resizeMode.contain}
        style={styles.gif}
      />
      <View style={styles.nextBtnContainer}>
        <TouchableOpacity
          onPress={() => {
            HapticFeedback.trigger('impactHeavy');
            setUserLogin(true);
          }}
          style={styles.nextBtn}>
          <Text style={styles.nextText}>Start listening</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SwipeRightScreen;

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
    width: '80%',
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
