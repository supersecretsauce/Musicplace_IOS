import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Colors from '../../assets/utilities/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Contacts from 'expo-contacts';
import firestore from '@react-native-firebase/firestore';

const ActivityScreen = ({navigation}) => {
  const [contacts, setContacts] = useState(null);
  const [phoneNumbers, setPhoneNumbers] = useState(null);

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
          console.log(localPhoneNumbers);
          setPhoneNumbers(localPhoneNumbers);
        }
      }
    })();
  }, []);

  // useEffect(() => {
  //   if (phoneNumbers) {
  //     async function getExistingUsers() {
  //       let results = [];
  //       for (let i = 0; i < phoneNumbers.length; i += 10) {
  //         let doc = await firestore()
  //           .collection('users')
  //           .where('phoneNumber', 'in', [
  //             phoneNumbers[i],
  //             phoneNumbers[i + 1],
  //             phoneNumbers[i + 2],
  //             phoneNumbers[i + 3],
  //             phoneNumbers[i + 4],
  //             phoneNumbers[i + 5],
  //             phoneNumbers[i + 6],
  //             phoneNumbers[i + 7],
  //             phoneNumbers[i + 8],
  //             phoneNumbers[i + 9],
  //           ])
  //           .get();
  //         console.log(doc);
  //       }
  //       // console.log(results);
  //     }
  //     getExistingUsers();
  //   }
  // }, [phoneNumbers]);

  const defaultActivityText = [
    {
      top: 'No Activity Yet',
      bottom: 'Get started by posting a song.',
    },
  ];
  const defaultMessageText = [
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.activityContainer}>
        <TouchableOpacity
          // style={styles.createIcon}
          onPress={() => {
            navigation.navigate('AddFriends');
          }}>
          <Ionicons name={'person-add-outline'} color={'white'} size={28} />
        </TouchableOpacity>
        <Text style={styles.activityText}>Activity</Text>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('NoMessagesScreen', {
              contacts: contacts,
            });
          }}>
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
                <TouchableOpacity key={index} style={styles.itemContainer}>
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
            data={defaultMessageText}
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
