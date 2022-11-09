import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  Image,
} from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

const HasMessagesScreen = ({route}) => {
  const {messages} = route.params;

  console.log(messages);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          style={styles.backIcon}
          name={'chevron-back'}
          color={'white'}
          size={28}
        />
        <Text style={styles.newChatText}>New Chat</Text>
      </View>
      {messages && (
        <FlatList
          data={messages}
          renderItem={({item}) => {
            return (
              <View>
                <Image so />
                <Text>{item.messageText}</Text>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default HasMessagesScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: '6%',
  },
  newChatText: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    alignSelf: 'center',
  },
  backIcon: {
    position: 'absolute',
    right: 195,
  },
});
