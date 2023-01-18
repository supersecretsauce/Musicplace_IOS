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
  const [memberInfo, setMemberInfo] = useState(null);
  const [myUser, setMyUser] = useState(null);
  const [activity, setActivity] = useState(null);
  const [myPhoneNumber, setMyPhoneNumber] = useState(null);
  const {UID, setInvitesRemaining, invitesRemaining} = useContext(Context);

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
              let filteredNumber = arr.filter(
                n =>
                  n !== '(' && n !== ')' && n !== '-' && n !== ' ' && n !== '+',
              );
              return {number: filteredNumber.join(''), name: person.firstName};
            } else {
              return;
            }
          });
          setPhoneNumbers(localPhoneNumbers);
        }
      }
    })();
  }, []);

  useEffect(() => {
    if (UID) {
      const subscriber = firestore()
        .collection('users')
        .doc(UID)
        .onSnapshot(resp => {
          console.log(resp.data());
          setMyUser(resp._data);
          setMyPhoneNumber(resp.data().phoneNumber);
          setInvitesRemaining(resp.data().invitesRemaining);
        });

      return () => subscriber();
    }
  }, [UID]);

  useEffect(() => {
    console.log(invitesRemaining);
  }, [invitesRemaining]);

  useEffect(() => {
    if (UID && myUser) {
      // check if a user has messages
      const subscriber = firestore()
        .collection('chats')
        .where(`members.${UID}`, '==', true)
        .where('blocked', '==', false)
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
  }, [UID, myUser]);

  useEffect(() => {
    if (UID) {
      const subscriber = firestore()
        .collection('users')
        .doc(UID)
        .collection('activity')
        .orderBy('timestamp', 'desc')
        .onSnapshot(snapshot => {
          let docArr = [];
          snapshot.docs.forEach(doc => {
            docArr.push(doc);
          });
          docArr.unshift({
            top: 'Musicplace Team',
            nav: 'InviteContactsScreen',
            from: 'musicplace',
          });
          setActivity(docArr);
        });

      // Stop listening for updates when no longer required
      return () => subscriber();
    }
  }, [UID, invitesRemaining]);

  function handleNav(nav) {
    navigation.navigate(nav, {
      contacts: contacts,
      myPhoneNumber: myPhoneNumber,
      phoneNumbers: phoneNumbers,
      UID: UID,
    });
  }

  function handleMessageNav(item) {
    if (item && myUser) {
      navigation.navigate('DMDrawerRoute', {
        screen: 'DirectMessageScreen',
        params: {
          profileID: item.UID,
          userProfile: item,
          myUser: myUser,
          prevRoute: 'ActivityScreen',
        },
      });
    }
  }

  function newMessageNav() {
    navigation.navigate('NewChatScreen', {
      myUser: myUser,
    });

    // navigation.navigate('NoMessagesScreen');
  }

  function viewLikeNav(item) {
    console.log(item);
    navigation.navigate('ViewPostsScreen', {
      songInfo: [item?._data?.songInfo],
      UID: UID,
      openSheet: true,
      commentDocID: item?._data?.commentDocID,
    });

    firestore()
      .collection('users')
      .doc(UID)
      .collection('activity')
      .doc(item.id)
      .update({
        notificationRead: true,
      });
  }

  function viewFollowNav(item) {
    navigation.navigate('ViewUserScreen', {
      myUser: myUser,
      UID: UID,
      profileID: item?._data?.UID,
      prevRoute: 'ActivityScreen',
    });
    firestore()
      .collection('users')
      .doc(UID)
      .collection('activity')
      .doc(item.id)
      .update({
        notificationRead: true,
      });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.activityContainer}>
        <TouchableOpacity
          // style={styles.createIcon}
          onPress={() => {
            navigation.navigate('AddFriends', {
              myUser: myUser,
              prevRoute: 'ActivityScreen',
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
        <View style={styles.newActivityHeader}>
          <Text style={styles.newActivity}>New Activity</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ViewAllActivityScreen', {
                contacts: contacts,
                UID: UID,
                myUser: myUser,
              })
            }>
            <Text style={styles.viewMore}>view all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.activityFlatListContainer}>
          {activity && (
            <FlatList
              data={activity}
              renderItem={({item, index}) => {
                return (
                  <>
                    {item.from === 'musicplace' ? (
                      <TouchableOpacity
                        key={index}
                        style={styles.itemContainer}
                        onPress={() => handleNav(item.nav)}>
                        <View style={styles.itemLeft}>
                          <View style={styles.musicplaceLogo} />
                          <View style={styles.itemMiddle}>
                            <Text style={styles.topText}>{item.top}</Text>
                            <Text style={styles.bottomText}>
                              You have {invitesRemaining}{' '}
                              {invitesRemaining === 1 ? 'invite' : 'invites'}{' '}
                              remaining.
                            </Text>
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
                    ) : (
                      <>
                        {item?._data?.type === 'like' ? (
                          <TouchableOpacity
                            style={styles.itemContainer}
                            onPress={() => viewLikeNav(item)}>
                            <View style={styles.itemLeft}>
                              {item?._data?.pfpURL ? (
                                <Image
                                  style={styles.musicplaceLogo}
                                  source={{
                                    uri: item?._data?.pfpURL,
                                  }}
                                />
                              ) : (
                                <View style={styles.musicplaceLogo} />
                              )}
                              <View style={styles.itemMiddle}>
                                <Text style={styles.topText}>New Like</Text>
                                <Text style={styles.bottomText}>
                                  {`${item?._data?.displayName} liked your comment.`}
                                </Text>
                              </View>
                            </View>
                            <View style={styles.notiContainer}>
                              {item?._data?.notificationRead ? (
                                <></>
                              ) : (
                                <View style={styles.notificationDot} />
                              )}

                              <Ionicons
                                name={'chevron-forward'}
                                color={'white'}
                                size={20}
                              />
                            </View>
                          </TouchableOpacity>
                        ) : (
                          <>
                            {item?._data?.type === 'follow' ? (
                              <TouchableOpacity
                                style={styles.itemContainer}
                                onPress={() => viewFollowNav(item)}>
                                <View style={styles.itemLeft}>
                                  {item?._data?.pfpURL ? (
                                    <Image
                                      style={styles.musicplaceLogo}
                                      source={{
                                        uri: item?._data?.pfpURL,
                                      }}
                                    />
                                  ) : (
                                    <View style={styles.musicplaceLogo} />
                                  )}
                                  <View style={styles.itemMiddle}>
                                    <Text style={styles.topText}>
                                      New Follow
                                    </Text>
                                    <Text style={styles.bottomText}>
                                      {`${item?._data?.displayName} just followed you.`}
                                    </Text>
                                  </View>
                                </View>
                                <View style={styles.notiContainer}>
                                  {item?._data?.notificationRead ? (
                                    <></>
                                  ) : (
                                    <View style={styles.notificationDot} />
                                  )}

                                  <Ionicons
                                    name={'chevron-forward'}
                                    color={'white'}
                                    size={20}
                                  />
                                </View>
                              </TouchableOpacity>
                            ) : (
                              <TouchableOpacity
                                style={styles.itemContainer}
                                onPress={() => viewLikeNav(item)}>
                                <View style={styles.itemLeft}>
                                  {item?._data?.pfpURL ? (
                                    <Image
                                      style={styles.musicplaceLogo}
                                      source={{
                                        uri: item?._data?.pfpURL,
                                      }}
                                    />
                                  ) : (
                                    <View style={styles.musicplaceLogo} />
                                  )}
                                  <View style={styles.itemMiddle}>
                                    <Text style={styles.topText}>
                                      New Reply
                                    </Text>
                                    <Text style={styles.bottomText}>
                                      {`${item?._data?.displayName} replied to your comment.`}
                                    </Text>
                                  </View>
                                </View>
                                <View style={styles.notiContainer}>
                                  {item?._data?.notificationRead ? (
                                    <></>
                                  ) : (
                                    <View style={styles.notificationDot} />
                                  )}

                                  <Ionicons
                                    name={'chevron-forward'}
                                    color={'white'}
                                    size={20}
                                  />
                                </View>
                              </TouchableOpacity>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </>
                );
              }}
            />
          )}
        </View>
      </View>
      <View style={styles.messagesContainer}>
        <View style={styles.newActivityHeader}>
          <Text style={styles.messagesText}>Messages</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ViewAllMessagesScreen', {
                UID: UID,
                // contacts: contacts,
                // UID: UID,
                myUser: myUser,
              })
            }>
            <Text style={styles.viewMore}>view all</Text>
          </TouchableOpacity>
        </View>
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
  newActivityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  newActivity: {
    fontFamily: 'Inter-Medium',
    color: 'white',
    fontSize: 18,
  },
  viewMore: {
    color: Colors.greyOut,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
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
