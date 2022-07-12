import React, {useState, useContext} from 'react';
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
import {Context} from '../../context/Context';
import firestore from '@react-native-firebase/firestore';
import {firebase} from '@react-native-firebase/firestore';

const CreateUsernameScreen = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [submitDone, setSubmitDone] = useState(false);
  const [takenUsername, setTakenUsername] = useState(false);
  const user = firebase.auth().currentUser;

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

  const createUsername = async () => {
    try {
      await firestore().collection('users').doc(user.uid).set({
        phoneNumber: user.phoneNumber,
        createdAt: user.metadata.creationTime,
        lastSignIn: user.metadata.lastSignInTime,
      });
    } catch (error) {
      return;
    }
    try {
      await firestore().collection('usernames').doc(username).set({
        UID: user.uid,
      });
    } catch (error) {
      setTakenUsername(true);
      return;
    }
    if (takenUsername === false) {
      navigation.navigate('ConnectSpotifyScreen');
    }
  };

  const backspace = ({nativeEvent}) => {
    if (nativeEvent.key === 'Backspace') {
      setTakenUsername(false);
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
        <Text style={styles.create}>Create a</Text>
        <Text style={styles.username}>Username</Text>
        {takenUsername ? (
          <Text style={styles.blurbTaken}>
            That username is taken (we know the feeling).
          </Text>
        ) : (
          <Text style={styles.blurb}>
            We get it, you’re the one that found that song.
          </Text>
        )}
      </View>
      <View style={styles.inputContainer}>
        <View style={styles.rectangle}>
          <TextInput
            onKeyPress={backspace}
            keyboardType="default"
            style={styles.inputText}
            placeholder="Username"
            placeholderTextColor="grey"
            value={username}
            autoCapitalize="none"
            onChangeText={text => handleText(text)}
          />
        </View>
      </View>
      <View style={styles.nextBtnContainer}>
        <TouchableOpacity
          style={submitDone ? styles.nextBtnDone : styles.nextBtn}>
          <Text
            onPress={createUsername}
            style={submitDone ? styles.nextTextDone : styles.nextText}>
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
  textContainer: {
    marginTop: '25%',
    marginLeft: '10%',
  },
  create: {
    color: 'white',
    fontFamily: 'Inter-Medium',
    fontSize: 30,
  },
  username: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 45,
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
    marginTop: '22%',
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
