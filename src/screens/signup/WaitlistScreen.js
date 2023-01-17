import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  SafeAreaView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import React, {useEffect, useContext} from 'react';
import {Context} from '../../context/Context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Musicplace from '../../assets/img/musicplace-signup.svg';
import Hourglass from '../../assets/img/hourglass.svg';
import functions from '@react-native-firebase/functions';
import Toast from 'react-native-toast-message';
import auth from '@react-native-firebase/auth';

const WaitlistScreen = ({navigation, route}) => {
  const {firebaseNumberFormat} = route.params;
  const {setConfirm} = useContext(Context);

  async function handleDiscord() {
    await Linking.openURL('https://discord.gg/q6vNAB63SQ');
  }

  useEffect(() => {
    console.log(firebaseNumberFormat);
  }, [firebaseNumberFormat]);

  async function checkEligibility() {
    functions()
      .httpsCallable('checkNumber')(firebaseNumberFormat)
      .then(resp => {
        console.log(resp);
        if (resp.data.exists === 'waitlist error') {
          Toast.show({
            type: 'error',
            text1: 'This number is not eligible yet...',
            visibilityTime: 1500,
          });
        } else if (resp.data.exists === false) {
          async function signInWithPhoneNumber() {
            // HapticFeedback.trigger('impactHeavy');
            try {
              const confirmation = await auth().signInWithPhoneNumber(
                firebaseNumberFormat,
              );
              setConfirm(confirmation);
              navigation.navigate('EnterCodeScreen');
            } catch (error) {
              return signInWithPhoneNumber;
            }
          }
          signInWithPhoneNumber();
        }
      });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topContainer}>
        <TouchableWithoutFeedback
          onPress={() => navigation.goBack()}
          style={styles.touchContainer}>
          <Ionicons
            style={styles.chevron}
            name="chevron-back"
            color="white"
            size={40}
          />
        </TouchableWithoutFeedback>
        <Musicplace style={styles.musicplace} />
      </View>
      <View style={styles.middleContainer}>
        <Hourglass />
        <Text style={styles.waitlistText}>You’re on the waitlist!</Text>
        <Text style={styles.waitlistDesc}>
          If you know a friend on Musicplace, have them send you an invite. If
          not, we’ll send you a text when we’re ready.
        </Text>
      </View>
      <TouchableOpacity onPress={handleDiscord} style={styles.inTouchBtn}>
        <Text style={styles.inTouch}>Stay in touch</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={checkEligibility}>
        <Text style={styles.eligibility}>Check eligibility</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default WaitlistScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  touchContainer: {
    width: '15%',
  },
  topContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 25,
  },
  chevron: {
    position: 'absolute',
    left: 20,
  },
  musicplace: {
    alignSelf: 'center',
  },
  middleContainer: {
    // backgroundColor: 'red',
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: '6%',
    textAlign: 'center',
  },
  waitlistText: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    marginTop: '5%',
  },
  waitlistDesc: {
    marginTop: '5%',
    color: 'white',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    // backgroundColor: 'red',
    width: 345,
    lineHeight: 22,
    textAlign: 'center',
  },
  inTouchBtn: {
    backgroundColor: 'rgb(255, 8, 0)',
    borderRadius: 9,
    paddingVertical: 10,
    marginTop: '10%',
    width: '90%',
    alignSelf: 'center',
  },
  inTouch: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    textAlign: 'center',
  },
  eligibility: {
    marginTop: '5%',
    color: 'white',
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    textAlign: 'center',
  },
});
