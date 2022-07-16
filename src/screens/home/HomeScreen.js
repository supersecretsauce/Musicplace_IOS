import {StyleSheet, Text, SafeAreaView} from 'react-native';
import React from 'react';
import auth from '@react-native-firebase/auth';

const HomeScreen = () => {
  return <SafeAreaView style={styles.container}></SafeAreaView>;
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});
