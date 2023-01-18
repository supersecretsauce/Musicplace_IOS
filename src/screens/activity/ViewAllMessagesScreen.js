import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../assets/utilities/Colors';
import firestore from '@react-native-firebase/firestore';

const ViewAllMessagesScreen = ({navigation, route}) => {
  const {UID, myUser} = route.params;
  const [memberInfo, setMemberInfo] = useState(null);

  useEffect(() => {
    if (UID) {
      // check if a user has messages
      const subscriber = firestore()
        .collection('chats')
        .where(`members.${UID}`, '==', true)
        .onSnapshot(snapshot => {
          let sortedMsgs = snapshot.docs.sort((a, z) => {
            return z.data().lastMessageAt - a.data().lastMessageAt;
          });
          let allMessageDocs = [];
          let allIDs = [];
          let filteredMemberInfo = [];
          sortedMsgs.forEach(doc => {
            allMessageDocs.push(doc._data);
            Object.keys(doc._data.members).forEach(key => {
              if (key !== UID) {
                allIDs.push(key);
              } else {
                return;
              }
            });
          });
          for (let i = 0; i < allMessageDocs.length; i++) {
            let IdNumber = allIDs[i];
            let messageDoc = allMessageDocs[i];
            let memberData = messageDoc[IdNumber];
            filteredMemberInfo.push(memberData);
          }
          setMemberInfo(filteredMemberInfo);
        });
      // Stop listening for updates when no longer required
      return () => subscriber();
    }
  }, [UID]);

  function handleMessageNav(item) {
    if (item && myUser) {
      navigation.navigate('DMDrawerRoute', {
        screen: 'DirectMessageScreen',
        params: {
          profileID: item.UID,
          userProfile: item,
          myUser: myUser,
          prevRoute: 'ViewAllMessagesScreen',
        },
      });
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.activityContainer}>
        <TouchableOpacity
          style={styles.createIcon}
          onPress={() => {
            navigation.navigate('ActivityScreen');
          }}>
          <Ionicons name={'chevron-back'} color={'white'} size={32} />
        </TouchableOpacity>
        <Text style={styles.activityText}>All Messages</Text>
      </View>
      <View style={styles.line} />
      <View style={styles.messagesFlatListContainer}>
        <FlatList
          data={memberInfo}
          renderItem={({item, index}) => {
            return (
              <TouchableOpacity
                key={index}
                style={styles.itemContainer}
                onPress={() => handleMessageNav(item)}>
                <View style={styles.itemLeft}>
                  {item?.pfpURL ? (
                    <Image
                      style={styles.musicplaceLogo}
                      source={{
                        uri: item.pfpURL,
                      }}
                    />
                  ) : (
                    <View style={styles.musicplaceLogo} />
                  )}
                  <View style={styles.itemMiddle}>
                    <Text style={styles.topText}>{item?.displayName}</Text>
                    <Text style={styles.bottomText}>@{item?.handle}</Text>
                  </View>
                </View>
                <View style={styles.notiContainer}>
                  {item?.sentLastMessage && !item.messageRead ? (
                    <View style={styles.notificationDot} />
                  ) : (
                    <></>
                  )}
                  <Ionicons
                    name={'chevron-forward'}
                    color={'white'}
                    size={20}
                  />
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default ViewAllMessagesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  activityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: '6%',
  },
  activityText: {
    fontFamily: 'Inter-Bold',
    color: 'white',
    fontSize: 18,
    alignSelf: 'center',
  },
  createIcon: {
    position: 'absolute',
    right: 210,
  },
  line: {
    borderColor: Colors.darkGrey,
    width: '100%',
    borderWidth: 0.5,
    alignSelf: 'center',
    marginTop: '6%',
  },
  messagesFlatListContainer: {
    // backgroundColor: 'grey',
    flex: 1,
    marginTop: '3%',
    width: '90%',
    alignSelf: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  musicplaceLogo: {
    height: 40,
    width: 40,
    borderRadius: 40,
    backgroundColor: Colors.red,
  },
  itemMiddle: {
    marginLeft: 10,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  topText: {
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    fontSize: 14,
    paddingVertical: 2,
  },
  bottomText: {
    fontFamily: 'Inter-Regular',
    color: 'white',
    fontSize: 11,
    paddingVertical: 2,
  },
  notiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationDot: {
    height: 10,
    width: 10,
    borderRadius: 10,
    backgroundColor: Colors.red,
    marginRight: 10,
  },
});
