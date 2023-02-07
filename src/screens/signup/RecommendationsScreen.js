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
import FastImage from 'react-native-fast-image';
import firestore from '@react-native-firebase/firestore';
import {mixpanel} from '../../../mixpanel';
import {Context} from '../../context/Context';
const RecommendationsScreen = ({navigation}) => {
  const {setUserLogin} = useContext(Context);
  const currentUser = firebase.auth().currentUser;
  const [myUser, setMyUser] = useState(null);
  const [myName, setMyName] = useState(null);
  const {recommendations} = useContext(WelcomeContext);
  const [contacts, setContacts] = useState(null);
  const [updatedContacts, setUpdatedContacts] = useState(null);
  const [search, setSearch] = useState('');
  const [invitedUsers, setInvitedUsers] = useState([]);
  const [followingList, setFollowingList] = useState([]);

  useEffect(() => {
    if (currentUser) {
      console.log(currentUser);
      firestore()
        .collection('users')
        .doc(currentUser.uid)
        .get()
        .then(resp => {
          setMyUser(resp.data());
        });
    }
  }, [currentUser]);

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

  async function handleFollow(contact) {
    if (myUser) {
      if (followingList.includes(contact.phoneNumber)) {
        console.log('aleady following');
        return;
      } else {
        // mixpanel.track('New Follow');
        HapticFeedback.trigger('selection');
        setFollowingList(prev => [...prev, contact.phoneNumber]);
        firestore()
          .collection('users')
          .doc(contact.UID)
          .update({
            followersList: firestore.FieldValue.arrayUnion(myUser.UID),
            followers: firestore.FieldValue.increment(1),
          })
          .catch(e => {
            console.log(e);
          });
        firestore()
          .collection('users')
          .doc(myUser.UID)
          .update({
            followingList: firestore.FieldValue.arrayUnion(contact.UID),
            following: firestore.FieldValue.increment(1),
          })
          .catch(e => {
            console.log(e);
          });
        firestore()
          .collection('users')
          .doc(contact.UID)
          .collection('activity')
          .add({
            UID: myUser.UID,
            from: 'user',
            type: 'follow',
            timestamp: firestore.FieldValue.serverTimestamp(),
            songInfo: null,
            handle: myUser.handle,
            displayName: myUser.displayName,
            pfpURL: myUser?.pfpURL ? myUser?.pfpURL : null,
            notificationRead: false,
          })
          .catch(e => {
            console.log(e);
          });
      }
    }
  }

  function handleNav() {
    HapticFeedback.trigger('selection');
    mixpanel.track('Signup Completion');
    setUserLogin(true);
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
        <TouchableOpacity style={styles.nextBtn} onPress={handleNav}>
          <Text style={styles.nextText}>Next</Text>
        </TouchableOpacity>
      </View>
      {recommendations ? (
        <View>
          <View style={styles.contactBanner}>
            <Text style={styles.bannerText}>
              {recommendations.length === 1
                ? recommendations.length + ' FRIEND FOUND'
                : recommendations.length + ' FRIENDS FOUND'}
              {/* {recommendations.length + ' FRIEND FOUND'} */}
            </Text>
          </View>
          <FlatList
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              // height: '100%',
              paddingBottom: '30%',
            }}
            data={recommendations}
            renderItem={({item, index}) => {
              return (
                <View style={styles.contactItem}>
                  <View style={styles.contactLeft}>
                    <FastImage
                      style={styles.pfpURL}
                      source={{
                        uri: item.pfpURL,
                      }}
                    />
                    <View style={styles.recMiddle}>
                      <Text style={styles.displayName}>{item.displayName}</Text>
                      <Text style={styles.contactName}>
                        {item?.contactName}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleFollow(item)}>
                    <Text style={styles.followText}>
                      {followingList.includes(item.phoneNumber)
                        ? 'followed'
                        : 'follow'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        </View>
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
    fontFamily: 'Inter-Bold',
  },
  musicplace: {
    alignSelf: 'center',
  },
  nextBtn: {
    position: 'absolute',
    right: 20,
    padding: 14,
    paddingRight: 0,
  },
  nextText: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 15,
  },
  contactBanner: {
    backgroundColor: '#191919',
    width: '100%',
    paddingVertical: 10,
  },
  bannerText: {
    color: 'white',
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    paddingLeft: '7%',
  },
  contactItem: {
    width: '90%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  pfpURL: {
    height: 40,
    width: 40,
    borderRadius: 40,
    backgroundColor: Colors.red,
  },
  recMiddle: {
    marginLeft: 15,
    flexDirection: 'column',
  },
  displayName: {
    color: 'white',
    fontSize: 17,
    fontFamily: 'Inter-Bold',
  },
  contactName: {
    color: 'grey',
    fontFamily: 'Inter-Regular',
  },
  followText: {
    color: 'grey',
    fontSize: 15,
    fontFamily: 'Inter-Bold',
  },
  //no recs
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
