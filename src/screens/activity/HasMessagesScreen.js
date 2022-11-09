import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Context} from '../../context/Context';
import Colors from '../../assets/utilities/Colors';
import firestore from '@react-native-firebase/firestore';

const HasMessagesScreen = ({route, navigation}) => {
  const {messages, myUser} = route.params;
  const {UID} = useContext(Context);
  const [memberInfo, setMemberInfo] = useState(null);

  useEffect(() => {
    if (messages && UID) {
      let filteredMemberInfo = messages.map(messageDoc => {
        return messageDoc.memberInfo.filter(member => {
          return member.UID !== UID;
        });
      });
      console.log(filteredMemberInfo);
      setMemberInfo(filteredMemberInfo);
    }
  }, [messages, UID]);

  function handleNav(item) {
    if (item && myUser) {
      navigation.navigate('DirectMessageScreen', {
        profileID: item.UID,
        userProfile: item,
        myUser: myUser,
      });
    } else {
      return;
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => navigation.goBack()}>
          <Ionicons name={'chevron-back'} color={'white'} size={28} />
        </TouchableOpacity>
        <Text style={styles.newChatText}>New Chat</Text>
      </View>
      {messages && (
        <View style={styles.flatListContainer}>
          <FlatList
            data={memberInfo}
            renderItem={({item}) => {
              return (
                <TouchableOpacity
                  style={styles.itemContainer}
                  onPress={() => handleNav(item[0])}>
                  <View style={styles.itemLeft}>
                    <Image
                      style={styles.pfp}
                      source={{
                        uri: item[0].pfpURL,
                      }}
                    />
                    <View style={styles.middleContainer}>
                      <Text style={styles.handle}>{item[0].handle}</Text>
                      <Text style={styles.displayName}>
                        {item[0].displayName}
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name={'chevron-forward'}
                    color={'white'}
                    size={28}
                  />
                </TouchableOpacity>
              );
            }}
          />
        </View>
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
  flatListContainer: {
    width: '90%',
    flex: 1,
    alignSelf: 'center',
    paddingTop: '5%',
  },
  itemContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pfp: {
    width: 50,
    height: 50,
    borderRadius: 50,
    marginLeft: 5,
  },
  middleContainer: {
    marginLeft: '10%',
  },
  handle: {
    fontFamily: 'Inter-Bold',
    color: 'white',
    fontSize: 16,
  },
  displayName: {
    fontFamily: 'Inter-Regular',
    color: Colors.greyOut,
    marginTop: 5,
  },
});
