import {StyleSheet, Text, View, SafeAreaView, Linking} from 'react-native';
import React from 'react';
import {TouchableOpacity} from 'react-native-gesture-handler';

const DirectMessagesScreen = () => {
  const sendSMS = async () => {
    await Linking.openURL('sms:3157659919?body=yo');
  };
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={sendSMS}>
        <Text style={{color: 'white'}}>DirectMessagesScreen</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default DirectMessagesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});
