import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Animated, {
  useAnimatedGestureHandler,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {PanGestureHandler} from 'react-native-gesture-handler';
import {SPRING_CONFIG} from '../assets/utilities/reanimated-2';
import firestore from '@react-native-firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../assets/utilities/Colors';
import {useNavigation} from '@react-navigation/native';
import ShareOptions from './ShareOptions';

const ShareSheet = props => {
  const {navigate} = useNavigation();
  const {showShareSheet, setShowShareSheet, UID, post} = props;
  const dimensions = useWindowDimensions();
  const [myUser, setMyUser] = useState(null);
  const [followingData, setFollowingData] = useState(null);
  const [messageText, setMessageText] = useState(null);
  const [userItemSelections, setUserItemSelections] = useState([]);
  const [showDirectMessages, setShowDirectMessages] = useState(false);
  const [userDisplayNameSelections, setUserDisplayNameSelections] = useState(
    [],
  );

  async function getFollowingList() {
    const subscriber = firestore()
      .collection('users')
      .doc(UID)
      .onSnapshot(documentSnapshot => {
        console.log('User data: ', documentSnapshot.data());
        setMyUser(documentSnapshot.data());
        let followingList = documentSnapshot.data().followingList;
        if (followingList.length > 0) {
          async function getFollowingDocs() {
            let docsArray = [];
            for (let i = 0; i < followingList.length; i += 10) {
              await firestore()
                .collection('users')
                .where('UID', 'in', followingList.slice(i, i + 10))
                .get()
                .then(resp => {
                  resp._docs.forEach(doc => {
                    docsArray.push(doc._data);
                  });
                });
            }
            console.log(docsArray);
            setFollowingData(docsArray);
          }
          getFollowingDocs();
        }
      });

    // Stop listening for updates when no longer required
    return () => subscriber();
  }

  useEffect(() => {
    if (showShareSheet) {
      top.value = withSpring(dimensions.height / 1.4, SPRING_CONFIG);
      getFollowingList();
    }
  }, [showShareSheet]);

  useEffect(() => {
    if (showDirectMessages) {
      top.value = withSpring(dimensions.height / 7, SPRING_CONFIG);
    }
  }, [showDirectMessages]);

  const top = useSharedValue(1000);
  const style = useAnimatedStyle(() => {
    return {
      top: top.value,
    };
  });

  const gestureHandler = useAnimatedGestureHandler({
    onStart(_, context) {
      context.startTop = top.value;
    },
    onActive(event, context) {
      top.value = context.startTop + event.translationY;
    },
    onEnd() {
      if (top.value > dimensions.height / 7) {
        top.value = withSpring(1000, SPRING_CONFIG);
        runOnJS(setShowShareSheet)(false);
        runOnJS(setShowDirectMessages)(false);
      }
    },
  });

  function handleSelections(item) {
    if (userDisplayNameSelections.includes(item.displayName)) {
      setUserDisplayNameSelections(
        userDisplayNameSelections.filter(name => name != item.displayName),
      );
      setUserItemSelections(
        userItemSelections.filter(user => user.UID != item.UID),
      );
    } else {
      setUserDisplayNameSelections([
        ...userDisplayNameSelections,
        item.displayName,
      ]);
      setUserItemSelections([...userItemSelections, item]);
    }
  }

  //first get all documents where my user is a member of with selected user
  //then for each docID, add to the messages subcollection

  async function handleShare(item) {
    // firestore().collection("chats")
    setShowShareSheet(false);
    top.value = withSpring(1000, SPRING_CONFIG);
    for (let i = 0; i < userItemSelections.length; i++) {
      let doc = await firestore()
        .collection('chats')
        .where(`members.${userItemSelections[i].UID}`, '==', true)
        .where(`members.${UID}`, '==', true)
        .get();
      if (doc.empty) {
        await firestore()
          .collection('chats')
          .add({
            members: {
              [userItemSelections[i].UID]: true,
              [UID]: true,
            },
            createdAt: new Date(),
            lastMessageAt: new Date(),
            [userItemSelections[i].UID]: {
              UID: userItemSelections[i].UID,
              displayName: userItemSelections[i].displayName,
              handle: userItemSelections[i].handle,
              pfpURL: userItemSelections[i]?.pfpURL
                ? userItemSelections[i]?.pfpURL
                : false,
              sentLastMessage: false,
              messageRead: false,
            },
            [UID]: {
              UID: UID,
              displayName: myUser.displayName,
              handle: myUser.handle,
              pfpURL: myUser?.pfpURL ? myUser?.pfpURL : false,
              sentLastMessage: true,
              messageRead: false,
            },
          })
          .then(resp => {
            console.log('create chat doc', resp);
            // setChatDocID(resp.id);
            if (messageText) {
              firestore()
                .collection('chats')
                .doc(resp.id)
                .collection('messages')
                .add({
                  messageText: messageText,
                  songInfo: post,
                  sentAt: new Date(),
                  from: UID,
                  to: userItemSelections[i].UID,
                })
                .then(() => {
                  console.log('message doc added!');
                  setMessageText(null);
                  setUserDisplayNameSelections([]);
                  setUserItemSelections([]);
                });
            } else {
              firestore()
                .collection('chats')
                .doc(resp.id)
                .collection('messages')
                .add({
                  songInfo: post,
                  sentAt: new Date(),
                  from: UID,
                  to: userItemSelections[i].UID,
                })
                .then(() => {
                  console.log('message doc added!');
                  setMessageText(null);
                  setUserDisplayNameSelections([]);
                  setUserItemSelections([]);
                });
            }
          });
      } else {
        if (messageText) {
          await firestore()
            .collection('chats')
            .doc(doc._docs[0].id)
            .collection('messages')
            .add({
              sentAt: new Date(),
              from: UID,
              to: userItemSelections[i].UID,
              messageText: messageText,
              songInfo: post,
            })
            .then(() => {
              console.log('message added');
              setMessageText(null);
              setUserDisplayNameSelections([]);
              setUserItemSelections([]);
            });
        } else {
          await firestore()
            .collection('chats')
            .doc(doc._docs[0].id)
            .collection('messages')
            .add({
              sentAt: new Date(),
              from: UID,
              to: userItemSelections[i].UID,
              songInfo: post,
            })
            .then(() => {
              console.log('message added without text!');
              setMessageText(null);
              setUserDisplayNameSelections([]);
              setUserItemSelections([]);
            });
        }
        await firestore()
          .collection('chats')
          .doc(doc._docs[0].id)
          .update({
            lastMessageAt: new Date(),
            [userItemSelections[i].UID + '.messageRead']: false,
            [userItemSelections[i].UID + '.sentLastMessage']: false,
            [UID + '.messageRead']: false,
            [UID + '.sentLastMessage']: true,
          })
          .then(() => {
            console.log('updated lastMessageAt!');
            setMessageText(null);
            setUserDisplayNameSelections([]);
            setUserItemSelections([]);
          });
      }
    }
  }

  return (
    <>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.shareSheet, style]}>
          {showDirectMessages ? (
            <>
              <View style={styles.tab} />
              <Text style={styles.shareText}>
                {userDisplayNameSelections.length > 0
                  ? 'send separately'
                  : 'send via direct message'}
              </Text>
              <View style={styles.toContainer}>
                <Text style={styles.toText}>To:</Text>

                {userDisplayNameSelections.length > 0 ? (
                  <View style={styles.toFlatListContainer}>
                    <FlatList
                      contentContainerStyle={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                      horizontal
                      data={userDisplayNameSelections}
                      renderItem={({item, index}) => {
                        return (
                          <View style={styles.toItemContainer} key={index}>
                            <Text style={styles.toName}>{item}</Text>
                          </View>
                        );
                      }}
                    />
                  </View>
                ) : (
                  <></>
                )}
              </View>
              {followingData ? (
                <View style={styles.flatListContainer}>
                  <FlatList
                    data={followingData}
                    renderItem={({item, index}) => {
                      return (
                        <View style={styles.item} key={index}>
                          <View style={styles.itemLeft}>
                            {item?.pfpURL ? (
                              <Image
                                style={styles.pfp}
                                source={{
                                  uri: item.pfpURL,
                                }}
                              />
                            ) : (
                              <View style={styles.pfp} />
                            )}
                            <View style={styles.itemMiddle}>
                              <Text style={styles.displayName}>
                                {item?.displayName}
                              </Text>
                              <Text style={styles.handle}>@{item?.handle}</Text>
                            </View>
                          </View>
                          <TouchableOpacity
                            onPress={() => handleSelections(item)}>
                            {userDisplayNameSelections.includes(
                              item.displayName,
                            ) ? (
                              <Ionicons
                                name={'radio-button-on'}
                                color={'white'}
                                size={28}
                              />
                            ) : (
                              <Ionicons
                                name={'radio-button-off'}
                                color={Colors.greyOut}
                                size={28}
                              />
                            )}
                          </TouchableOpacity>
                        </View>
                      );
                    }}
                  />
                </View>
              ) : (
                <View style={styles.notFollowingContainer}>
                  <Text style={styles.notFollowingText}>
                    You must be following someone in order to send a direct
                    message.
                  </Text>
                  <TouchableOpacity
                    style={styles.addContainer}
                    onPress={() => {
                      navigate('AddFriends', {
                        myUser: myUser,
                        prevRoute: 'PlaylistTracksScreen',
                      });
                    }}>
                    <Text style={styles.addText}>add friends</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            <ShareOptions
              top={top}
              setShowDirectMessages={setShowDirectMessages}
              setShowShareSheet={setShowShareSheet}
              post={post}
            />
          )}
        </Animated.View>
      </PanGestureHandler>
      {showShareSheet && followingData && showDirectMessages ? (
        <KeyboardAvoidingView behavior="position">
          <View style={styles.btnsContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="add a comment..."
              placeholderTextColor={Colors.greyOut}
              keyboardAppearance="dark"
              autoCapitalize={'none'}
              onChangeText={text => setMessageText(text)}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleShare}>
              <Text style={styles.sendText}>send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      ) : (
        <></>
      )}
    </>
  );
};

export default ShareSheet;

const styles = StyleSheet.create({
  shareSheet: {
    position: 'absolute',
    backgroundColor: '#1F1F1F',
    height: '100%',
    bottom: 0,
    width: '100%',
    borderTopEndRadius: 30,
    borderTopStartRadius: 30,
  },
  tab: {
    height: 5,
    width: 50,
    backgroundColor: 'white',
    alignSelf: 'center',
    marginTop: 7,
    borderRadius: 10,
  },
  shareText: {
    fontFamily: 'Inter-Bold',
    fontSize: 15,
    color: 'white',
    alignSelf: 'center',
    paddingVertical: 10,
  },
  toContainer: {
    width: '90%',
    alignSelf: 'center',
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toText: {
    color: Colors.greyOut,
    marginLeft: 5,
    fontFamily: 'Inter-bold',
  },
  toFlatListContainer: {
    marginLeft: 10,
    width: '90%',
  },
  toItemContainer: {
    marginRight: 10,
    padding: 5,
    paddingHorizontal: 10,
    borderColor: Colors.greyOut,
    borderWidth: 0.5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toName: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: 'white',
  },
  //flatlist
  flatListContainer: {
    marginTop: 90,
    position: 'absolute',
    // backgroundColor: 'white',
    height: '60%',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    paddingVertical: 10,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pfp: {
    height: 40,
    width: 40,
    borderRadius: 40,
    backgroundColor: 'red',
  },
  itemMiddle: {
    marginLeft: 10,
  },
  displayName: {
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    fontSize: 14,
  },
  handle: {
    color: Colors.greyOut,
    fontSize: 11,
    marginTop: 5,
    fontFamily: 'Inter-Regular',
  },

  notFollowingContainer: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.7,
    width: '90%',
  },
  notFollowingText: {
    fontFamily: 'Inter-Regular',
    color: 'white',
    textAlign: 'center',
    lineHeight: 20,
    width: '80%',
  },
  addContainer: {
    marginTop: 25,
    paddingHorizontal: 50,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#1F1F1F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  addText: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  btnsContainer: {
    backgroundColor: 'black',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 20,
  },
  textInput: {
    backgroundColor: '#1F1F1F',
    width: 350,
    paddingVertical: 10,
    borderRadius: 20,
    paddingLeft: 15,
    color: 'white',
  },
  sendBtn: {
    // backgroundColor: 'red',
    width: 350,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'grey',
    borderRadius: 20,
    justifyContent: 'center',
    marginTop: 10,
  },
  sendText: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: 'white',
  },
});
