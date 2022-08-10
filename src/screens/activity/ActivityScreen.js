import {StyleSheet, Text, View, SafeAreaView} from 'react-native';
import React from 'react';
import Colors from '../../assets/utilities/Colors';
const ActivityScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topContainer}>
        <Text style={styles.activityText}>Activity</Text>
        <View style={styles.line} />
      </View>
      <Text>ActivityScreen</Text>
    </SafeAreaView>
  );
};

export default ActivityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  topContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityText: {
    fontFamily: 'Inter-Bold',
    color: 'white',
    fontSize: 18,
    marginTop: '2%',
  },
  line: {
    borderColor: Colors.greyOut,
    width: '100%',
    borderWidth: 0.5,
    alignSelf: 'center',
    marginTop: '5%',
  },
});
