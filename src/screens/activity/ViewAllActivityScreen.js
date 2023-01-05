import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import React, {useState, useEffect, useContext} from 'react';
import {Context} from '../../context/Context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../assets/utilities/Colors';
import firestore from '@react-native-firebase/firestore';

const ViewAllActivityScreen = ({navigation, route}) => {
  const {invitesRemaining, setInvitesRemaining} = useContext(Context);
  const {contacts, UID, myUser} = route.params;
  const [activity, setActivity] = useState(null);

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
  }, [UID]);

  function handleNav(nav) {
    navigation.navigate(nav, {
      contacts: contacts,
    });
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
      prevRoute: 'ViewAllActivityScreen',
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
          style={styles.createIcon}
          onPress={() => {
            navigation.navigate('ActivityScreen');
          }}>
          <Ionicons name={'chevron-back'} color={'white'} size={32} />
        </TouchableOpacity>
        <Text style={styles.activityText}>All Activity</Text>
      </View>
      <View style={styles.line} />
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
                                  <Text style={styles.topText}>New Follow</Text>
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
                                  <Text style={styles.topText}>New Reply</Text>
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
    </SafeAreaView>
  );
};

export default ViewAllActivityScreen;

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
    right: 200,
  },
  line: {
    borderColor: Colors.darkGrey,
    width: '100%',
    borderWidth: 0.5,
    alignSelf: 'center',
    marginTop: '6%',
  },
  activityFlatListContainer: {
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
