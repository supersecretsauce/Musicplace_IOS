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
import React from 'react';
import {useState, useContext} from 'react';
import {Context} from '../../context/Context';
import auth from '@react-native-firebase/auth';

const PhoneNumber = ({navigation}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSubmitDone, setShowSubmitDone] = useState(false);
  const [firebaseNumberFormat, setFirebaseNumberFormat] = useState('');
  const {verificationId, setVerificationId} = useContext(Context);

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

  async function signInWithPhoneNumber() {
    const confirmation = await auth().signInWithPhoneNumber(
      firebaseNumberFormat,
    );
    console.log(confirmation.confirm);
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={app.options}
        attemptInvisibleVerification={true}
      /> */}
      <TouchableWithoutFeedback onPress={goBack}>
        <View style={styles.touchContainer}>
          <Image
            style={styles.chevron}
            source={require('../../assets/img/ChevronLeft.jpg')}
          />
        </View>
      </TouchableWithoutFeedback>
      <View style={styles.textContainer}>
        <Text style={styles.enter}>Enter your</Text>
        <Text style={styles.number}>Phone Number</Text>
        <Text style={styles.getStarted}>to get started</Text>
      </View>
      <View style={styles.inputContainer}>
        <View style={styles.rectangle}>
          <Text style={styles.areaCode}>US +1</Text>
          <Image
            style={styles.verticalLine}
            source={require('../../assets/img/VerticalLine.jpg')}
          />
          <TextInput
            keyboardType="numeric"
            style={styles.inputText}
            value={inputValue}
            onChangeText={text => handleInput(text)}
            placeholder="(123)-456-7890"
            placeholderTextColor="grey"
          />
        </View>
      </View>
      <View style={styles.nextBtnContainer}>
        <TouchableOpacity
          onPress={signInWithPhoneNumber}
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
  chevron: {
    marginTop: '1%',
  },

  textContainer: {
    marginTop: '25%',
    marginLeft: '10%',
  },
  enter: {
    color: 'white',
    fontFamily: 'Inter-Medium',
    fontSize: 30,
  },
  number: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 45,
    marginTop: '3%',
  },
  getStarted: {
    color: 'white',
    fontFamily: 'Inter-Medium',
    fontSize: 30,
    marginTop: '3%',
  },
  inputContainer: {
    alignItems: 'center',
    marginTop: 68,
  },
  rectangle: {
    backgroundColor: '#282828',
    width: 317,
    height: 44,
    borderRadius: 5,
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
    borderRadius: 5,
    paddingVertical: 10,
    marginTop: '5%',
    width: 317,
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
    borderRadius: 5,
    paddingVertical: 10,
    marginTop: '5%',
    width: 317,
  },

  nextTextDone: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    textAlign: 'center',
  },
});
