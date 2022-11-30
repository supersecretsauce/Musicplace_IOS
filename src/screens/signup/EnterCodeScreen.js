import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useState, useContext} from 'react';
import {Context} from '../../context/Context';
import Musicplace from '../../assets/img/musicplace-signup.svg';
import HapticFeedback from 'react-native-haptic-feedback';
import Toast from 'react-native-toast-message';
import {mixpanel} from '../../../mixpanel';
import Ionicons from 'react-native-vector-icons/Ionicons';

const EnterCodeScreen = ({navigation}) => {
  const [showEnterDone, setShowEnterDone] = useState(false);
  const [verificationCode, setVerificationCode] = useState();
  const {confirm} = useContext(Context);

  const goBack = () => {
    navigation.navigate('PhoneNumberScreen');
  };

  const handleInput = text => {
    const formattedCode = formatCode(text);
    setVerificationCode(formattedCode);
  };

  const formatCode = text => {
    if (!text) {
      return text;
    }
    const code = text.replace(/[^\d]/g, '');
    const codeLength = code.length;
    if (codeLength <= 5) {
      setShowEnterDone(false);
      return code;
    }
    if (codeLength >= 6) {
      setShowEnterDone(true);
      return code.slice(0, 6);
    }
  };

  let enterCode = async () => {
    try {
      HapticFeedback.trigger('impactHeavy');
      mixpanel.track('New Signup');
      await confirm.confirm(verificationCode);
      navigation.navigate('ConnectSpotifyScreen');
    } catch (error) {
      console.log('Invalid code.');
      Toast.show({
        type: 'error',
        text1: 'This code is not valid',
        text2: 'Make sure you entered the correct number.',
        visibilityTime: 3000,
      });
      return;
    }
  };

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
      <Text style={styles.desc}>Enter your confirmation code.</Text>
      <View style={styles.inputContainer}>
        <View style={styles.rectangle}>
          <TextInput
            keyboardType="numeric"
            style={styles.inputText}
            placeholder="123456"
            placeholderTextColor="grey"
            value={verificationCode}
            onChangeText={text => handleInput(text)}
            keyboardAppearance="dark"
            autoFocus="true"
            textContentType="oneTimeCode"
          />
        </View>
      </View>
      <View style={styles.nextBtnContainer}>
        <TouchableOpacity
          style={showEnterDone ? styles.nextBtnDone : styles.nextBtn}
          onPress={enterCode}>
          <Text style={showEnterDone ? styles.nextTextDone : styles.nextText}>
            Submit
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default EnterCodeScreen;

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
    width: '90%',
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
