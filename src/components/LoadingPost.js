import {StyleSheet, Text, View, Image, ViewBase} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';

const LoadingPost = () => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF0800', '#000000']}
        style={styles.songPhoto}
      />
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
  },
  songPhoto: {
    height: 350,
    width: 350,
    alignSelf: 'center',
    marginTop: '13%',
    // backgroundColor: 'grey',
  },
  loadingText: {
    color: 'white',
    fontFamily: 'Inter-Regular',
    alignSelf: 'center',
    marginTop: '30%',
    width: '75%',
    textAlign: 'center',
    lineHeight: 25,
  },
});
