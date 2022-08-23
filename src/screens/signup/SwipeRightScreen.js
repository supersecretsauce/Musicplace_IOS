import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, {useContext} from 'react';
import HorizontalGif from '../../assets/img/horizontal-gif.gif';
import Colors from '../../assets/utilities/Colors';
import {Context} from '../../context/Context';
import HapticFeedback from 'react-native-haptic-feedback';

const SwipeRightScreen = ({navigation}) => {
  const {setUserLogin} = useContext(Context);
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.swipeText}>Swipe Horizontally</Text>
      <Text style={styles.swipeDesc}>
        Swipe right to navigate to the next song.
      </Text>
      <Image source={HorizontalGif} style={styles.gif} />
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