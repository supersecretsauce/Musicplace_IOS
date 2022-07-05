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
import {getAuth, PhoneAuthProvider, signInWithCredential} from 'firebase/auth';
import {app, db} from '../../../firebase';
import React from 'react';
import {setDoc, doc} from 'firebase/firestore';

const auth = getAuth();
app;
db;

const EnterCodeScreen = ({navigation}) => {
  const [inputValue, setInputValue] = useState();
  const [showEnterDone, setShowEnterDone] = useState(false);
  const {verificationId, setVerificationId} = useContext(Context);
  const [verificationCode, setVerificationCode] = useState();
  const {userData, setUserData} = useContext(Context);

  const goBack = () => {
    navigation.navigate('PhoneNumberScreen');
  };

  const handleInput = text => {
    const formattedCode = formatCode(text);
    setVerificationCode(formattedCode);
  };

  const formatCode = text => {
    if (!text) return text;
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
    navigation.navigate('CreateUsernameScreen');

    try {
      setVerificationId(verificationId);
      const credential = PhoneAuthProvider.credential(
        verificationId,
        verificationCode,
      );
      let data;
      await signInWithCredential(auth, credential).then(userData => {
        data = userData.user;
        setUserData(data);
        setDoc(doc(db, 'users', data.uid), {
          phoneNumber: data.phoneNumber,
          createdAt: data.metadata.creationTime,
          lastLoginAt: data.metadata.lastSignInTime,
        });
      });
    } catch (err) {
      console.log(err);
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
      <View style={styles.textContainer}>
        <Text style={styles.enter}>Enter the</Text>
        <Text style={styles.number}>Number</Text>
        <Text style={styles.sent}>sent to your phone.</Text>
      </View>
      <View style={styles.inputContainer}>
        <View style={styles.rectangle}>
          <TextInput
            keyboardType="numeric"
            style={styles.inputText}
            placeholder="123456"
            placeholderTextColor="grey"
            value={verificationCode}
            onChangeText={text => handleInput(text)}></TextInput>
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
  sent: {
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
