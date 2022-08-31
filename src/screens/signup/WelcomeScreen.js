import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  useCallback,
} from 'react-native';
import {TouchableOpacity} from 'react-native';
import Color from '../../assets/utilities/Colors';
import Musicplace from '../../assets/img/musicplace-welcome.svg';
import HapticFeedback from 'react-native-haptic-feedback';
const WelcomeScreen = ({navigation}) => {
  const signupHandler = () => {
    navigation.navigate('PhoneNumberScreen');
    HapticFeedback.trigger('impactHeavy');
  };
  const loginHandler = () => {
    navigation.navigate('ExistingPhoneNumberScreen');
    HapticFeedback.trigger('impactHeavy');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.welcomeContainer}>
        <Text style={styles.signUp}>Signup</Text>
        <View style={styles.musicplaceContainer}>
          <Text style={styles.signupFor}>for</Text>
          <Musicplace style={styles.musicplace} />
        </View>
      </View>
      <View style={styles.captionContainer}>
        <Image source={require('../../assets/img/Sparkles.png')} />
        <Text style={styles.caption}>Music discovery starts here.</Text>
      </View>
      <TouchableOpacity onPress={signupHandler} style={styles.signUpBtn}>
        <Text style={styles.signUpText}>Sign up</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={loginHandler}>
        <Text style={styles.login}>Login</Text>
      </TouchableOpacity>
      {/* <Text style={styles.tos}>
        By continuing , you agree to our{' '}
        <Text style={styles.highlight}> Terms of Service</Text> and acknowledge
        that you have read our
        <Text style={styles.highlight}> Privacy Policy</Text> to learn how we
        collect, use, and share your data.
      </Text> */}
    </SafeAreaView>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    flex: 1,
  },
  welcomeContainer: {
    marginTop: '38%',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  signUp: {
    color: 'white',
    fontFamily: 'Inter-Black',
    fontWeight: '500',
    fontSize: 40,
    textAlign: 'left',
  },
  musicplaceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  signupFor: {
    color: 'white',
    fontFamily: 'Inter-Medium',
    fontSize: 40,
  },
  musicplace: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontWeight: '600',
    fontSize: 45,
    marginTop: 6,
    marginLeft: 12,
  },
  captionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  caption: {
    marginLeft: 7,
    color: 'white',
    fontSize: 18,
    fontFamily: 'Inter-Medium',
  },
  signUpBtn: {
    backgroundColor: Color.red,
    borderRadius: 5,
    paddingVertical: 10,
    marginTop: 50,
    width: 317,
    marginLeft: 37,
  },
  signUpText: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    textAlign: 'center',
  },
  login: {
    color: Color.red,
    marginTop: 24,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    fontSize: 16,
  },
  // tos: {
  //   position: 'absolute',
  //   color: Color.greyOut,
  //   bottom: 30,
  //   width: 317,
  //   textAlign: 'center',
  //   marginLeft: 37,
  //   fontSize: 12,
  //   fontFamily: 'Inter-Regular',
  // },
  // highlight: {
  //   color: 'white',
  // },
});
