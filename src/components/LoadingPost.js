import {StyleSheet, Text, View, Image, ActivityIndicator} from 'react-native';
import React from 'react';

const LoadingPost = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={'white'} />
      <Text style={styles.loadingText}>
        hang tight, we're getting you the best possible songs.
      </Text>
    </View>
  );
};

export default LoadingPost;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: 'white',
    fontFamily: 'Inter-Regular',
    alignSelf: 'center',
    width: '75%',
    textAlign: 'center',
    lineHeight: 25,
    marginTop: '5%',
  },
});
