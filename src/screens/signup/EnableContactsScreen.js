import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import React, {useContext} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Musicplace from '../../assets/img/musicplace-signup.svg';
import ContactEmoji from '../../assets/img/contact-emoji.svg';
import * as Contacts from 'expo-contacts';
import axios from 'axios';
import appCheck from '@react-native-firebase/app-check';
import DeviceInfo from 'react-native-device-info';
import {simKey} from '../../../simKey';
import {WelcomeContext} from '../../context/WelcomeContext';

const EnableContactsScreen = ({navigation}) => {
  const {setRecommendations} = useContext(WelcomeContext);

  async function contactHandler() {
    const {status} = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
      const {data} = await Contacts.getContactsAsync();
      navigation.navigate('PhoneNumberScreen');
      if (data.length > 0) {
        const initialContacts = data;
        let isEmulator = await DeviceInfo.isEmulator();
        let authToken;
        if (!isEmulator) {
          authToken = await appCheck().getToken();
        }
        let axiosData = initialContacts;
        axios
          .post(
            // 'https://musicplace-friendfinder-production.up.railway.app/find-friends',
            'http://max.local:3001/find-friends',
            axiosData,
            {
              headers: {
                accept: 'application/json',
                Authorization: isEmulator
                  ? 'Bearer ' + simKey
                  : 'Bearer ' + authToken.token,
              },
            },
          )
          .then(resp => {
            console.log(resp);
            setRecommendations(resp.data);
          })
          .catch(e => {
            console.log(e);
          });
      }
    } else {
      setRecommendations(null);
    }
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
      <ContactEmoji style={styles.emoji} />
      <Text style={styles.allowText}>Please allow access</Text>
      <Text style={styles.descText}>
        Musicplace needs to suggest you friends to follow.
      </Text>
      <TouchableOpacity style={styles.inTouchBtn} onPress={contactHandler}>
        <Text style={styles.inTouch}>📔 Enable Contacts</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default EnableContactsScreen;

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
  emoji: {
    alignSelf: 'center',
    marginTop: '6%',
  },
  allowText: {
    fontFamily: 'Inter-Bold',
    color: 'white',
    fontSize: 28,
    marginTop: '5%',
    alignSelf: 'center',
  },
  descText: {
    color: 'white',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginTop: '2.5%',
    width: 300,
    lineHeight: 24,
    textAlign: 'center',
    alignSelf: 'center',
  },
  inTouchBtn: {
    backgroundColor: 'rgb(255, 8, 0)',
    borderRadius: 9,
    paddingVertical: 10,
    marginTop: '10%',
    width: '80%',
    alignSelf: 'center',
  },
  inTouch: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    textAlign: 'center',
  },
});
