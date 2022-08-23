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
      await confirm.confirm(verificationCode);
      navigation.navigate('CreateUsernameScreen');
    } catch (error) {
      console.log('Invalid code.');
      return;
    }
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
      <Musicplace style={styles.musicplace} />
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
  chevron: {
    marginTop: '1%',
  },
  musicplace: {
    position: 'absolute',
    alignSelf: 'center',
    top: '8.2%',
  },
  desc: {
    color: 'white',
    fontFamily: 'Inter-semibold',
    fontSize: 18,
    width: 250,
    textAlign: 'center',
    alignSelf: 'center',
    marginTop: '8%',
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
