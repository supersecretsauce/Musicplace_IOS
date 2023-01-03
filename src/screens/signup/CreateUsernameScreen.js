import React, {useState} from 'react';

import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableWithoutFeedback,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Color from '../../assets/utilities/Colors';
import firestore from '@react-native-firebase/firestore';
import {firebase} from '@react-native-firebase/firestore';
import Musicplace from '../../assets/img/musicplace-signup.svg';
import HapticFeedback from 'react-native-haptic-feedback';
import Toast from 'react-native-toast-message';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CreateUsernameScreen = ({navigation}) => {
  const [submitDone, setSubmitDone] = useState(false);
  const [username, setUsername] = useState(null);
  const userInfo = firebase.auth().currentUser;

  const goBack = () => {
    navigation.goBack();
  };

  const handleText = text => {
    const formattedName = formatName(text);
    setUsername(formattedName);
  };

  const formatName = text => {
    const removeExtraStuff = text.replace(
      /([@#%=;:~`\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&\s])/g,
      '',
    );
    const nameLength = removeExtraStuff.length;
    if (nameLength === 0) {
      setSubmitDone(false);
      return removeExtraStuff;
    }
    if (nameLength >= 1) {
      setSubmitDone(true);
      return removeExtraStuff;
    }
    if (nameLength >= 3) {
      setSubmitDone(true);
      return removeExtraStuff.slice(0, 29);
    }
  };

  const checkIfUsernameTaken = async () => {
    if (username === '') {
      console.log("can't enter empty string");
      return;
    } else {
      HapticFeedback.trigger('impactHeavy');
      try {
        await firestore().collection('usernames').doc(username).set({
          UID: userInfo.uid,
        });
        await firestore().collection('users').doc(userInfo.uid).update({
          displayName: username,
          handle: username,
        });
        setUsername('');
        navigation.navigate('SwipeUpScreen');
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'This username is taken',
          text2: 'Try entering another username.',
          visibilityTime: 3000,
        });
        console.log(error);
        return;
      }
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
      <Text style={styles.desc}>
        Create a username so everyone knows it’s you.
      </Text>
      <View style={styles.inputContainer}>
        <View style={styles.rectangle}>
          <TextInput
            maxLength={20}
            keyboardType="default"
            style={styles.inputText}
            placeholder="Username"
            placeholderTextColor="grey"
            value={username}
            autoCapitalize="none"
            onChangeText={text => {
              handleText(text);
            }}
            keyboardAppearance="dark"
            autoFocus="true"
            textContentType="username"
          />
        </View>
      </View>
      <View style={styles.nextBtnContainer}>
        <TouchableOpacity
          onPress={checkIfUsernameTaken}
          style={submitDone ? styles.nextBtnDone : styles.nextBtn}>
          <Text style={submitDone ? styles.nextTextDone : styles.nextText}>
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CreateUsernameScreen;

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
    width: 300,
    textAlign: 'center',
    alignSelf: 'center',
    marginTop: '3%',
  },
  blurb: {
    color: Color.greyOut,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginTop: '3%',
  },
  blurbTaken: {
    color: Color.greyOut,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginTop: '3%',
    width: '90%',
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
    borderRadius: 5,
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
