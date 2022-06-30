import {StyleSheet, Text, View, SafeAreaView, Image} from 'react-native';
import React from 'react';
import {TouchableOpacity} from 'react-native';
import Color from '../../assets/utilities/Colors';

const WelcomeScreen = ({navigation}) => {
  const pressHandler = () => {
    navigation.navigate('PhoneNumberScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.welcomeContainer}>
        <Text style={styles.signUp}>Signup</Text>
        <View style={styles.musicplaceContainer}>
          <Text style={styles.signupFor}>for</Text>
          <Text style={styles.musicplace}> Musicplace</Text>
        </View>
      </View>
      <View style={styles.captionContainer}>
        <Image source={require('../../assets/img/Sparkles.png')} />
        <Text style={styles.caption}>Music discovery starts here.</Text>
      </View>
      <TouchableOpacity onPress={pressHandler} style={styles.signUpBtn}>
        <Text style={styles.signUpText}>Sign up</Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Text style={styles.login}>Login</Text>
      </TouchableOpacity>
      <Text style={styles.tos}>
        By continuing , you agree to our{' '}
        <Text style={styles.highlight}> Terms of Service</Text> and acknowledge
        that you have read our
        <Text style={styles.highlight}> Privacy Policy</Text> to learn how we
        collect, use, and share your data.
      </Text>
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
    marginTop: 186,
    marginLeft: 37,
  },
  signUp: {
    color: 'white',
    // fontFamily: 'Inter_500Medium',
    fontSize: 40,
  },
  musicplaceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  signupFor: {
    color: 'white',
    // fontFamily: 'Inter_500Medium',
    fontSize: 40,
  },
  musicplace: {
    color: 'white',
    // fontFamily: 'Inter_700Bold',
    fontSize: 45,
  },
  captionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 73,
    marginTop: 18,
  },
  caption: {
    marginLeft: 7,
    color: 'white',
    fontSize: 16,
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
    // fontFamily: 'Inter_700Bold',
    fontSize: 20,
    textAlign: 'center',
  },
  login: {
    color: Color.red,
    marginTop: 24,
    // fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    fontSize: 16,
  },
  tos: {
    color: Color.greyOut,
    marginTop: 250,
    width: 317,
    textAlign: 'center',
    marginLeft: 37,
    fontSize: 12,
  },
  highlight: {
    color: 'white',
  },
});
