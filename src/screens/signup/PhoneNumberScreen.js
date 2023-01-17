import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useState, useContext} from 'react';
import {Context} from '../../context/Context';
import auth from '@react-native-firebase/auth';
import Musicplace from '../../assets/img/musicplace-signup.svg';
import HapticFeedback from 'react-native-haptic-feedback';
import Toast from 'react-native-toast-message';
import Ionicons from 'react-native-vector-icons/Ionicons';
import functions from '@react-native-firebase/functions';

const PhoneNumber = ({navigation}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSubmitDone, setShowSubmitDone] = useState(false);
  const [firebaseNumberFormat, setFirebaseNumberFormat] = useState('');
  const {setConfirm} = useContext(Context);

  const goBack = () => {
    navigation.navigate('WelcomeScreen');
  };

  const handleInput = text => {
    const formattedPhoneNumber = formatPhoneNumber(text);
    setFirebaseNumberFormat(firebaseFormatter(text));
    setInputValue(formattedPhoneNumber);
  };

  let firebaseFormatter = text => {
    const phoneNumber = text.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength >= 9) {
      let number =
        '' +
        phoneNumber.slice(0, 3) +
        '' +
        phoneNumber.slice(3, 6) +
        '' +
        phoneNumber.slice(6, 10);
      let finalNumber = '+1' + number;
      return finalNumber;
    }
  };

  let formatPhoneNumber = text => {
    if (!text) {
      return text;
    }
    const phoneNumber = text.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) {
      return phoneNumber;
    }
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }

    if (phoneNumberLength <= 9) {
      setShowSubmitDone(false);
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
        3,
        6,
      )}-${phoneNumber.slice(6, 10)}`;
    }
    if (phoneNumberLength >= 10) {
      setShowSubmitDone(true);
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
        3,
        6,
      )}-${phoneNumber.slice(6, 10)}`;
    }
  };

  async function doesNumberExist() {
    Toast.show({
      type: 'info',
      text1: 'Checking waitlist...',
      visibilityTime: 1500,
    });
    functions()
      .httpsCallable('checkNumber')(firebaseNumberFormat)
      .then(resp => {
        console.log(resp);
        if (resp.data.exists === true) {
          Toast.show({
            type: 'error',
            text1: 'This number already exists',
            text2: 'Try logging in instead.',
            visibilityTime: 3000,
          });
        } else if (resp.data.exists === false) {
          signInWithPhoneNumber();
        } else if (resp.data.exists === 'waitlist error') {
          navigation.navigate('WaitlistScreen');
          functions()
            .httpsCallable('addWaitlist')(firebaseNumberFormat)
            .then(resp => console.log(resp))
            .catch(e => {
              console.log(e);
            });
        } else {
          Toast.show({
            type: 'error',
            text1: 'An error occurred',
            text2: 'Please try again later.',
            visibilityTime: 3000,
          });
        }
      })
      .catch(e => {
        console.log(e);
      });
  }

  async function signInWithPhoneNumber() {
    HapticFeedback.trigger('impactHeavy');
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topContainer}>
        <TouchableWithoutFeedback
          onPress={goBack}
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
      <Text style={styles.desc}>Enter your phone number to get started.</Text>
      <View style={styles.inputContainer}>
        <View style={styles.rectangle}>
          <Text style={styles.areaCode}>US +1</Text>
          <Image
            style={styles.verticalLine}
            source={require('../../assets/img/VerticalLine.jpg')}
          />
          <TextInput
            keyboardType="phone-pad"
            style={styles.inputText}
            value={inputValue}
            onChangeText={text => handleInput(text)}
            placeholder="(123)-456-7890"
            placeholderTextColor="grey"
            autoFocus="true"
            keyboardAppearance="dark"
            multiline="true"
            textContentType="telephoneNumber"
          />
        </View>
      </View>
      <View style={styles.nextBtnContainer}>
        <TouchableOpacity
          onPress={doesNumberExist}
          style={showSubmitDone ? styles.nextBtnDone : styles.nextBtn}>
          <Text style={showSubmitDone ? styles.nextTextDone : styles.nextText}>
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PhoneNumber;

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
  desc: {
    color: 'white',
    fontFamily: 'Inter-semibold',
    fontSize: 18,
    width: 250,
    textAlign: 'center',
    alignSelf: 'center',
    marginTop: '3%',
  },
  inputContainer: {
    alignItems: 'center',
    marginTop: '12%',
  },
  rectangle: {
    backgroundColor: '#282828',
    width: '90%',
    height: 44,
    borderRadius: 9,
    alignItems: 'center',
    flexDirection: 'row',
  },
  areaCode: {
    color: 'white',
    marginLeft: 14,
    fontSize: 16,
  },
  verticalLine: {
    marginLeft: 15,
  },
  inputText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 14,
    width: '68%',
    fontFamily: 'Inter-Medium',
    alignSelf: 'center',
  },
  nextBtnContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextBtn: {
    backgroundColor: 'rgba(255, 8, 0, 0.5)',
    borderRadius: 9,
    paddingVertical: 10,
    marginTop: '5%',
    width: '90%',
  },
  nextText: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    textAlign: 'center',
    opacity: 0.5,
  },
  nextBtnDone: {
    backgroundColor: 'rgb(255, 8, 0)',
    borderRadius: 9,
    paddingVertical: 10,
    marginTop: '5%',
    width: '90%',
  },
  nextTextDone: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    textAlign: 'center',
  },
});
