import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  SafeAreaView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Musicplace from '../../assets/img/musicplace-signup.svg';

const WaitlistScreen = ({navigation}) => {
  async function handleDiscord() {
    await Linking.openURL('https://discord.gg/q6vNAB63SQ');
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
      <View style={styles.waitlistContainer}>
        <Text style={styles.desc}>You're on the waitlist</Text>
        <Text style={styles.descInfo}>
          If you know a friend on Musicplace they can send you an invite.
          Otherwise, we'll text you when we're ready.
        </Text>
        <TouchableOpacity style={styles.btn} onPress={handleDiscord}>
          <Text style={styles.btnText}>Stay in touch</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default WaitlistScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    // justifyContent: 'center',
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
  waitlistContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  desc: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 30,
    width: 320,
    textAlign: 'center',
    alignSelf: 'center',
    marginTop: '40%',
  },
  descInfo: {
    // textAlign: 'center',
    color: 'white',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    width: 300,
    marginTop: '3%',
    lineHeight: 23,
  },
  btn: {
    backgroundColor: '#7289da',
    borderRadius: 9,
    paddingVertical: 10,
    marginTop: '10%',
    width: '80%',
  },
  btnText: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    textAlign: 'center',
  },
});
