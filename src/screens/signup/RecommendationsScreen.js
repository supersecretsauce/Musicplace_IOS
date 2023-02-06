import {
  View,
  Text,
  TouchableWithoutFeedback,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import Musicplace from '../../assets/img/musicplace-signup.svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {WelcomeContext} from '../../context/WelcomeContext';
import * as Contacts from 'expo-contacts';
import Colors from '../../assets/utilities/Colors';
import functions from '@react-native-firebase/functions';
import {firebase} from '@react-native-firebase/firestore';
import {Toast} from 'react-native-toast-message/lib/src/Toast';
import HapticFeedback from 'react-native-haptic-feedback';

const RecommendationsScreen = ({navigation}) => {
  const [myUser, setMyUser] = useState(firebase.auth().currentUser);
  const [myName, setMyName] = useState(null);
  const {recommendations} = useContext(WelcomeContext);
  const [contacts, setContacts] = useState(null);
  const [updatedContacts, setUpdatedContacts] = useState(null);
  const [search, setSearch] = useState('');
  const [invitedUsers, setInvitedUsers] = useState([]);

  useEffect(() => {
    console.log(recommendations);
    if (recommendations) {
      // do something
    } else {
      async function getContacts() {
        const {status} = await Contacts.requestPermissionsAsync();
        if (status === 'granted') {
          const {data} = await Contacts.getContactsAsync();
          setContacts(data);
          setUpdatedContacts(data);
        }
      }
      getContacts();
    }
  }, [recommendations]);

  // handles contact search
  useEffect(() => {
    if (contacts) {
      let filteredContacts = contacts.filter(contact => {
        return contact.name.toLowerCase().includes(search.toLowerCase());
      });
      setUpdatedContacts(filteredContacts);
    }
  }, [search]);

  useEffect(() => {
    if (contacts && myUser) {
      contacts.forEach(contact => {
        contact.phoneNumbers.forEach(number => {
          if (
            '+' + number === myUser.phoneNumber ||
            '+1' + number === myUser.phoneNumber
          ) {
            setMyName(contact.name);
          } else {
            return;
          }
        });
      });
    }
  }, [contacts, myUser]);

  async function handleInvite(contactNumber) {
    if (contactNumber && myUser.phoneNumber) {
      if (invitedUsers.includes(contactNumber)) {
        return;
      } else {
        HapticFeedback.trigger('selection');
        setInvitedUsers(current => [...current, contactNumber]);
        functions().httpsCallable('inviteContact')({
          name: myName,
          number: contactNumber,
          myPhoneNumber: myUser.phoneNumber,
        });
        Toast.show({
          type: 'success',
          text1: 'Invite sent successfully.',
          visibilityTime: 2000,
        });
      }
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topContainer}>
        <TouchableWithoutFeedback
          onPress={() => navigation.goBack()}
          style={styles.touchContainer}>
          <Ionicons
            style={styles.chevron}
            name="chevron-back"
            color="white"
            size={40}
          />
        </TouchableWithoutFeedback>
        <Musicplace style={styles.musicplace} />
      </View>
      {recommendations ? (
        <View></View>
      ) : (
        <View style={styles.noRecsContainer}>
          <Text style={styles.noContactHeader}>
            None of your contacts are on Musicplace... yet 😏
          </Text>
          <View style={styles.searchContainer}>
            <TextInput
              value={search}
              onChangeText={e => setSearch(e)}
              placeholder="search contacts to invite"
              placeholderTextColor="grey"
              style={styles.searchInput}
              autoCapitalize={false}
            />
          </View>
          <FlatList
            contentContainerStyle={{
              //   backgroundColor: 'red',
              width: '65%',
              paddingTop: '5%',
            }}
            showsVerticalScrollIndicator={false}
            data={updatedContacts}
            renderItem={({item, index}) => {
              return (
                <View key={index} style={styles.localContactContainer}>
                  <View style={styles.contactLeft}>
                    {item.imageAvailable ? (
                      <Image
                        style={styles.localUserImage}
                        source={{
                          uri: item?.image?.uri,
                        }}
                      />
                    ) : (
                      <View style={styles.defaultImage}>
                        {typeof item.firstName === 'string' ? (
                          <Text style={styles.defaultName}>
                            {item?.firstName?.slice(0, 1)}
                          </Text>
                        ) : (
                          <></>
                        )}
                      </View>
                    )}
                    <View style={styles.contactMiddle}>
                      <Text numberOfLines={1} style={styles.localFirstName}>
                        {item?.firstName}
                      </Text>
                      <Text numberOfLines={1} style={styles.localLastName}>
                        {item?.lastName}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleInvite(item?.phoneNumbers[0]?.number)}>
                    <Text style={styles.inviteContactText}>
                      {invitedUsers.includes(item?.phoneNumbers[0]?.number)
                        ? 'invited'
                        : 'invite'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default RecommendationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  touchContainer: {
    width: '15%',
  },
  topContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 25,
  },
  chevron: {
    position: 'absolute',
    left: 20,
  },
  musicplace: {
    alignSelf: 'center',
  },
  noRecsContainer: {
    flex: 1,
    alignItems: 'center',
  },
  noContactHeader: {
    fontFamily: 'Inter-Medium',
    color: 'white',
    fontSize: 20,
    width: '80%',
    textAlign: 'center',
    lineHeight: 28,
  },
  searchContainer: {
    backgroundColor: '#282828',
    width: '90%',
    height: 44,
    borderRadius: 9,
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: '8%',
  },
  searchInput: {
    paddingLeft: 20,
    width: '100%',
    height: 40,
    fontSize: 16,
    color: 'white',
  },
  localContactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    justifyContent: 'space-between',
    alignSelf: 'center',
    width: 350,
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  localUserImage: {
    height: 40,
    width: 40,
    borderRadius: 40,
  },
  defaultImage: {
    height: 40,
    width: 40,
    borderRadius: 40,
    backgroundColor: 'grey',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  defaultName: {
    fontFamily: 'Inter-Bold',
    color: 'white',
    fontSize: 14,
  },
  contactMiddle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: '8%',
  },
  localFirstName: {
    color: 'white',
    fontFamily: 'Inter-SemiBold',
    maxWidth: 200,
  },
  localLastName: {
    color: 'white',
    fontFamily: 'Inter-SemiBold',
    marginLeft: '6%',
    maxWidth: 100,
  },
  inviteContactText: {
    color: Colors.greyOut,
    fontFamily: 'Inter-Regular',
  },
});
