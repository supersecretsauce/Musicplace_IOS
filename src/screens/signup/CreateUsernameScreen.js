import React, {useState, useContext} from 'react';
import {Context} from '../../context/Context';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableWithoutFeedback,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import Color from '../../assets/utilities/Colors';
import firestore from '@react-native-firebase/firestore';
import {firebase} from '@react-native-firebase/firestore';
import Musicplace from '../../assets/img/musicplace-signup.svg';
import HapticFeedback from 'react-native-haptic-feedback';
import Toast from 'react-native-toast-message';

const CreateUsernameScreen = ({navigation}) => {
  const [submitDone, setSubmitDone] = useState(false);
  const [userNames, setUsernames] = useState(null);
  const userInfo = firebase.auth().currentUser;
  const {username, setUsername} = useContext(Context);

  const goBack = () => {
    navigation.navigate('EnterCodeScreen');
  };

  const handleText = text => {
    const formattedName = formatName(text);
    setUsername(formattedName);
  };

  const formatName = text => {
    const removeExtraStuff = text.replace(
      /([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,
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

  // get all usernames and set them in state
  const getAllUsernames = async () => {
    let docIDs = await firestore()
      .collection('usernames')
      .get()
      .then(resp => {
        return resp.docs.map(doc => {
          return doc.id;
        });
      });
    setUsernames(docIDs);
  };

  getAllUsernames();

  const checkIfUsernameTaken = async () => {
    if (username === '') {
      console.log("can't enter empty string");
      return;
    }
    if (userNames.includes(username)) {
      console.log('this name is taken');
      Toast.show({
        type: 'error',
        text1: 'This username is taken',
        text2: 'Try entering another username.',
        visibilityTime: 3000,
      });
    } else {
      console.log('this name is not taken');
      HapticFeedback.trigger('impactHeavy');
      try {
        await firestore().collection('usernames').doc(username).set({
          UID: userInfo.uid,
        });
        navigation.navigate('ConnectSpotifyScreen', {
          username: username,
        });
      } catch (error) {
        console.log('error uploading username to db');
        return;
      }
    }
  };

  const backspace = ({nativeEvent}) => {
    if (nativeEvent.key === 'Backspace') {
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
      <Text style={styles.desc}>
        Create a username so everyone knows it’s you.
      </Text>
      <View style={styles.inputContainer}>
        <View style={styles.rectangle}>
          <TextInput
            maxLength={10}
            onKeyPress={backspace}
            keyboardType="default"
            style={styles.inputText}
            placeholder="Username"
            placeholderTextColor="grey"
            value={username}
            autoCapitalize="none"
            onChangeText={text => handleText(text)}
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
    width: 300,
    textAlign: 'center',
    alignSelf: 'center',
    marginTop: '8%',
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
