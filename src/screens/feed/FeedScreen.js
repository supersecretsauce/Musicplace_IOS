import {StyleSheet, Text, View, SafeAreaView} from 'react-native';
import React from 'react';
import Colors from '../../assets/utilities/Colors';

const FeedScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text>FeedScreen</Text>
    </SafeAreaView>
  );
};

export default FeedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});
