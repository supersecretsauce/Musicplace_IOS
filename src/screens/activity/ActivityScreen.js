import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, {useEffect, useState, useContext} from 'react';
import Colors from '../../assets/utilities/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Contacts from 'expo-contacts';
import firestore from '@react-native-firebase/firestore';
import {Context} from '../../context/Context';

const ActivityScreen = ({navigation}) => {
  const [contacts, setContacts] = useState(null);
  const [phoneNumbers, setPhoneNumbers] = useState(null);
  // const [followingList, setFollowingList] = useState(null);
  const [messages, setMessages] = useState(null);
  const [memberInfo, setMemberInfo] = useState(null);
  const [myUser, setMyUser] = useState(null);
  const [messagingUIDS, setMessagingUIDS] = useState([]);
  const {UID} = useContext(Context);

  useEffect(() => {
    (async () => {
      const {status} = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const {data} = await Contacts.getContactsAsync();

        if (data.length > 0) {
          const contacts = data;
          setContacts(contacts);
          let localPhoneNumbers = contacts.map(person => {
            if (person.phoneNumbers) {
              let ogNumber = person?.phoneNumbers[0]?.number;
              let arr = ogNumber.split('');
              let filteredNumber = arr.filter(n => n !== '(' && n !== ')');
              return filteredNumber.join('');
            } else {
              return;
            }
          });
          setPhoneNumbers(localPhoneNumbers);
        }
      }
    })();
  }, []);

  // useEffect(() => {
  //   if (UID) {
  //     const subscriber = firestore()
  //       .collection('users')
  //       .doc(UID)
  //       .onSnapshot(documentSnapshot => {
  //         console.log('User data: ', documentSnapshot.data());
  //         setFollowingList(documentSnapshot.data().followingList);
  //       });

  //     // Stop listening for updates when no longer required
  //     return () => subscriber();
  //   }
  // }, [UID]);

  useEffect(() => {
    if (UID) {
      firestore()
        .collection('users')
        .doc(UID)
        .get()
        .then(resp => {
          setMyUser(resp._data);
        });
    }
  }, [UID]);

  useEffect(() => {
    if (UID) {
      // check if a user has messages
      const subscriber = firestore()
        .collection('chats')
        .where(`members.${UID}`, '==', true)
        .onSnapshot(snapshot => {
          let allMessageDocs = [];
          let allIDs = [];
          let filteredMemberInfo = [];
          snapshot._docs.forEach(doc => {
            console.log(doc);
            allMessageDocs.push(doc._data);
            Object.keys(doc._data.members).forEach(key => {
              if (key !== UID) {
                allIDs.push(key);
              } else {
                return;
              }
            });
            for (let i = 0; i < allMessageDocs.length; i++) {
              let IdNumber = allIDs[i];
              let messageDoc = allMessageDocs[i];
              let memberData = messageDoc[IdNumber];
              filteredMemberInfo.push(memberData);
            }
            console.log(filteredMemberInfo);
          });
          setMemberInfo(filteredMemberInfo);
        });
      // Stop listening for updates when no longer required
      return () => subscriber();
    }
  }, [UID]);

  const defaultActivityText = [
    {
      top: 'Musicplace Team',
      bottom: 'Get started by adding your friends.',
      nav: 'NoMessagesScreen',
    },
    {
      top: 'Musicplace Team',
      bottom: 'Invite your friends on to Musicplace.',
      nav: 'InviteContactsScreen',
    },
  ];

  function handleNav(nav) {
    navigation.navigate(nav, {
      contacts: contacts,
    });
  }

  function handleMessageNav(item) {
    if (item && myUser) {
      navigation.navigate('DirectMessageScreen', {
        profileID: item.UID,
        userProfile: item,
        myUser: myUser,
        prevRoute: 'ActivityScreen',
      });
    }
  }

  function newMessageNav() {
    navigation.navigate('IsFollowingScreen', {
      myUser: myUser,
    });

    // navigation.navigate('NoMessagesScreen');
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.activityContainer}>
        <TouchableOpacity
          // style={styles.createIcon}
          onPress={() => {
            navigation.navigate('AddFriends', {
              myUser: myUser,
            });
          }}>
          <Ionicons name={'person-add-outline'} color={'white'} size={28} />
        </TouchableOpacity>
        <Text style={styles.activityText}>Activity</Text>
        <TouchableOpacity onPress={newMessageNav}>
          <Ionicons name={'create-outline'} color={'white'} size={32} />
        </TouchableOpacity>
      </View>
      <View style={styles.line} />
      <View style={styles.newActivityContainer}>
        <Text style={styles.newActivity}>New Activity</Text>
        <View style={styles.activityFlatListContainer}>
          <FlatList
            data={defaultActivityText}
            renderItem={({item, index}) => {
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.itemContainer}
                  onPress={() => handleNav(item.nav)}>
                  <View style={styles.itemLeft}>
                    <View style={styles.musicplaceLogo} />
                    <View style={styles.itemMiddle}>
                      <Text style={styles.topText}>{item.top}</Text>
                      <Text style={styles.bottomText}>{item.bottom}</Text>
                    </View>
                  </View>
                  <View>
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
      </View>
      <View style={styles.messagesContainer}>
        <Text style={styles.messagesText}>Messages</Text>
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
                    {item.pfpURL ? (
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
                      <Text style={styles.topText}>{item.displayName}</Text>
                      <Text style={styles.bottomText}>@{item.handle}</Text>
                    </View>
                  </View>
                  <View>
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
      </View>
    </SafeAreaView>
  );
};

export default ActivityScreen;

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
    width: '90%',
    justifyContent: 'space-between',
  },
  activityText: {
    fontFamily: 'Inter-Bold',
    color: 'white',
    fontSize: 18,
    alignSelf: 'center',
  },
  line: {
    borderColor: Colors.darkGrey,
    width: '100%',
    borderWidth: 0.5,
    alignSelf: 'center',
    marginTop: '6%',
  },
  newActivityContainer: {
    width: '90%',
    height: 185,
    alignSelf: 'center',
    marginVertical: '7%',
    // backgroundColor: 'red',
  },
  newActivity: {
    fontFamily: 'Inter-Medium',
    color: 'white',
    fontSize: 18,
  },
  activityFlatListContainer: {
    // backgroundColor: 'grey',
    height: 185,
    marginTop: '3%',
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

  //messages
  messagesContainer: {
    width: '90%',
    flex: 1,
    alignSelf: 'center',
    marginTop: '3%',
  },
  messagesText: {
    fontFamily: 'Inter-Medium',
    color: 'white',
    fontSize: 18,
  },
  messagesFlatListContainer: {
    // backgroundColor: 'grey',
    flex: 1,
    marginTop: '3%',
  },
});
