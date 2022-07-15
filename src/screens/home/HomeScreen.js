import {StyleSheet, Text, SafeAreaView} from 'react-native';
import React from 'react';
import auth from '@react-native-firebase/auth';

const HomeScreen = () => {
  const signOut = async () => {
    auth()
      .signOut()
      .then(() => console.log('User signed out!'));
  };

  return (
    <SafeAreaView>
      <Text onPress={signOut}>HomeScreen</Text>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
