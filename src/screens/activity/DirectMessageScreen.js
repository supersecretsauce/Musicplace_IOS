import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  FlatList,
  Keyboard,
  TouchableWithoutFeedback,
  Linking,
} from 'react-native';
import React, {useEffect, useState, useContext, useRef} from 'react';
import Colors from '../../assets/utilities/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Animated, {
  useAnimatedGestureHandler,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {SPRING_CONFIG} from '../../assets/utilities/reanimated-2';
import firestore from '@react-native-firebase/firestore';
import {Context} from '../../context/Context';
import EmptyChatUI from '../../components/EmptyChatUI';
import Spotify from '../../assets/img/spotify.svg';

const DirectMessageScreen = ({route, navigation}) => {
  const {UID} = useContext(Context);
  const {profileID, userProfile, myUser, prevRoute} = route.params;
  const [chatDoc, setChatDoc] = useState(null);
  const [messageDocs, setMessageDocs] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [chatDocID, setChatDocID] = useState(null);
  const flatlistRef = useRef();

  useEffect(() => {
    if (UID) {
      console.log(UID);
      const subscriber = firestore()
        .collection('chats')
        .where(`members.${profileID}`, '==', true)
        .where(`members.${UID}`, '==', true)
        .onSnapshot(documentSnapshot => {
          console.log('User data: ', documentSnapshot);
          if (documentSnapshot.empty) {
            return;
          } else {
            setChatDoc(documentSnapshot._docs[0]);
            let memberInfo = documentSnapshot._docs[0]._data[profileID];
            if (memberInfo.sentLastMessage && !memberInfo.messageRead) {
              firestore()
                .collection('chats')
                .doc(documentSnapshot._docs[0].id)
                .update({
                  [profileID + '.messageRead']: true,
                })
                .then(() => {
                  console.log('marked msg as read');
                });
            }
          }
        });

      // Stop listening for updates when no longer required
      return () => subscriber();
    }
  }, [UID]);

  useEffect(() => {
    if (chatDoc) {
      const subscriber = firestore()
        .collection('chats')
        .doc(chatDoc.id)
        .collection('messages')
        .orderBy('sentAt', 'desc')
        .onSnapshot(documentSnapshot => {
          if (documentSnapshot.empty) {
            console.log('no messages');
          } else {
            console.log('got messages', documentSnapshot._docs);
            setMessageDocs(documentSnapshot._docs);
          }
        });
      // Stop listening for updates when no longer required
      return () => subscriber();
    }
  }, [chatDoc]);

  function handleSendMessage() {
    Keyboard.dismiss();
    if (messageText === '') {
      return;
    }
    setMessageText('');
    if (!chatDoc) {
      firestore()
        .collection('chats')
        .add({
          members: {
            [profileID]: true,
            [UID]: true,
          },
          createdAt: firestore.FieldValue.serverTimestamp(),
          lastMessageAt: firestore.FieldValue.serverTimestamp(),
          [profileID]: {
            UID: profileID,
            displayName: userProfile.displayName,
            handle: userProfile.handle,
            pfpURL: userProfile?.pfpURL ? userProfile?.pfpURL : false,
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
          setChatDocID(resp.id);
          firestore()
            .collection('chats')
            .doc(resp.id)
            .collection('messages')
            .add({
              messageText: messageText,
              sentAt: firestore.FieldValue.serverTimestamp(),
              from: UID,
              to: profileID,
            })
            .then(() => {
              console.log('message doc added!');
            });
        });
    } else {
      firestore()
        .collection('chats')
        .doc(chatDoc.id)
        .collection('messages')
        .add({
          messageText: messageText,
          sentAt: firestore.FieldValue.serverTimestamp(),
          from: UID,
          to: profileID,
        })
        .then(() => {
          console.log('message doc added!');
        });
      firestore()
        .collection('chats')
        .doc(chatDoc.id)
        .update({
          lastMessageAt: firestore.FieldValue.serverTimestamp(),
          [profileID + '.messageRead']: false,
          [profileID + '.sentLastMessage']: false,
          [UID + '.messageRead']: false,
          [UID + '.sentLastMessage']: true,
        })
        .then(() => {
          console.log('updated lastMessageAt!');
        });
    }
  }

  //animation work
  const flex = useSharedValue(0.86);
  const style = useAnimatedStyle(() => {
    return {
      flex: flex.value,
    };
  });
  function handleAnimation() {
    flex.value = withSpring(0.5, SPRING_CONFIG);
  }
  function handleAnimationDown() {
    flex.value = withSpring(0.86, SPRING_CONFIG);
  }

  function handleNavigation() {
    if (prevRoute === 'ActivityScreen') {
      navigation.navigate('ActivityScreen');
    } else if (prevRoute === 'HasMessagesScreen') {
      navigation.goBack();
    } else if (prevRoute === 'IsFollowingScreen') {
      navigation.goBack();
    } else if (prevRoute === 'ViewUserScreen') {
      navigation.goBack();
    } else if (prevRoute === 'ViewAllMessagesScreen') {
      navigation.goBack();
    } else {
      navigation.navigate('ViewUserScreen', {
        profileID: profileID,
        myUser: myUser,
        userProfile: userProfile,
        prevRoute: prevRoute,
      });
    }
  }

  function handleUserNav() {
    navigation.navigate('ViewUserScreen', {
      profileID: profileID,
      myUser: myUser,
      UID: UID,
      prevRoute: 'DirectMessageScreen',
    });
  }

  function handleSongNav(item) {
    let songArr = [];
    songArr.push(item);
    console.log(songArr);
    navigation.navigate('ViewPostsScreen', {
      UID: UID,
      songInfo: songArr,
    });
  }

  async function handleDeepLinking(item) {
    await Linking.openURL(`http://open.spotify.com/track/${item}`);
  }

  return (
    <SafeAreaView
      style={styles.container}
      // onTouchStart={() => Keyboard.dismiss()}
    >
      {userProfile ? (
        <>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={handleNavigation}>
                <Ionicons name={'chevron-back'} color="white" size={32} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerUserContainer}
                onPress={handleUserNav}>
                {userProfile.pfpURL ? (
                  <Image
                    style={styles.pfp}
                    source={{
                      uri: userProfile.pfpURL,
                    }}
                  />
                ) : (
                  <View style={styles.pfp} />
                )}
                <View style={styles.headerMiddle}>
                  <Text style={styles.displayName}>
                    {userProfile.displayName}
                  </Text>
                  <Text style={styles.handle}>@{userProfile.handle}</Text>
                </View>
              </TouchableOpacity>
            </View>
            <TouchableOpacity>
              <Ionicons
                name={'information-circle-outline'}
                color="white"
                size={24}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.line} />
          <Animated.View style={[style, styles.flatListContainer]}>
            {messageDocs ? (
              <FlatList
                ref={flatlistRef}
                data={messageDocs}
                inverted
                renderItem={({item}) => {
                  return (
                    <>
                      {item?._data?.songInfo ? (
                        <>
                          {item?._data.from === profileID ? (
                            <View style={styles.fromSongContainer}>
                              <TouchableOpacity
                                onPress={() =>
                                  handleSongNav(item?._data?.songInfo)
                                }>
                                <Image
                                  style={styles.songPhoto}
                                  source={{
                                    uri: item?._data?.songInfo?.songPhoto,
                                  }}
                                />
                              </TouchableOpacity>
                              <View style={styles.fromSongInfoContainer}>
                                <View style={styles.songTop}>
                                  {/* <Spotify height={20} /> */}
                                  <Text
                                    numberOfLines={1}
                                    style={styles.songName}>
                                    {item?._data?.songInfo?.songName}
                                  </Text>
                                </View>
                                <View style={styles.songMiddle}>
                                  <Text
                                    numberOfLines={1}
                                    style={styles.artistName}>
                                    {item?._data?.songInfo?.artists
                                      .map(artist => {
                                        return artist.name;
                                      })
                                      .join(', ')}
                                  </Text>
                                  <Ionicons
                                    style={styles.smallDot}
                                    name="ellipse"
                                    color="white"
                                    size={3}
                                  />
                                  <Text
                                    numberOfLines={1}
                                    style={styles.albumName}>
                                    {item?._data?.songInfo?.albumName}
                                  </Text>
                                </View>
                                <View>
                                  <TouchableOpacity
                                    style={styles.spotifyBtn}
                                    onPress={() => {
                                      handleDeepLinking(
                                        item?._data?.songInfo?.id,
                                      );
                                    }}>
                                    <Spotify height={16} />
                                    <Text style={styles.spotifyText}>
                                      LISTEN ON SPOTIFY
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              </View>
                              {item?._data?.messageText && (
                                <View style={styles.fromSongTextContainer}>
                                  <Text style={styles.messageText}>
                                    {item._data.messageText}
                                  </Text>
                                </View>
                              )}
                            </View>
                          ) : (
                            <View style={styles.mySongContainer}>
                              <TouchableOpacity
                                onPress={() =>
                                  handleSongNav(item?._data?.songInfo)
                                }>
                                <Image
                                  style={styles.songPhoto}
                                  source={{
                                    uri: item?._data?.songInfo?.songPhoto,
                                  }}
                                />
                              </TouchableOpacity>
                              <View style={styles.fromSongInfoContainer}>
                                <View style={styles.songTop}>
                                  {/* <Spotify height={20} /> */}
                                  <Text
                                    style={styles.songName}
                                    numberOfLines={1}>
                                    {item?._data?.songInfo?.songName}
                                  </Text>
                                </View>
                                <View style={styles.songMiddle}>
                                  <Text
                                    numberOfLines={1}
                                    style={styles.artistName}>
                                    {item?._data?.songInfo?.artists
                                      .map(artist => {
                                        return artist.name;
                                      })
                                      .join(', ')}
                                  </Text>
                                  <Ionicons
                                    style={styles.smallDot}
                                    name="ellipse"
                                    color="white"
                                    size={3}
                                  />
                                  <Text
                                    numberOfLines={1}
                                    style={styles.albumName}>
                                    {item?._data?.songInfo?.albumName}
                                  </Text>
                                </View>
                                <View>
                                  <TouchableOpacity
                                    style={styles.spotifyBtn}
                                    onPress={() => {
                                      handleDeepLinking(
                                        item?._data?.songInfo?.id,
                                      );
                                    }}>
                                    <Spotify height={16} />
                                    <Text style={styles.spotifyText}>
                                      LISTEN ON SPOTIFY
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              </View>
                              {item?._data?.messageText && (
                                <View style={styles.mySongTextContainer}>
                                  <Text style={styles.messageText}>
                                    {item._data.messageText}
                                  </Text>
                                </View>
                              )}
                            </View>
                          )}
                        </>
                      ) : (
                        <>
                          {item._data.from === profileID ? (
                            <View style={styles.fromContainer}>
                              <Text style={styles.messageText}>
                                {item._data.messageText}
                              </Text>
                            </View>
                          ) : (
                            <View style={styles.myUserContainer}>
                              <Text style={styles.messageText}>
                                {item._data.messageText}
                              </Text>
                            </View>
                          )}
                        </>
                      )}
                    </>
                  );
                }}
              />
            ) : (
              <EmptyChatUI userProfile={userProfile} />
            )}
          </Animated.View>
          <KeyboardAvoidingView
            style={styles.keyboardContainer}
            behavior="position">
            <View style={styles.inputContainer}>
              <TextInput
                onFocus={handleAnimation}
                onBlur={handleAnimationDown}
                placeholder="send a message"
                placeholderTextColor={Colors.greyOut}
                style={styles.textInput}
                onSubmitEditing={handleSendMessage}
                onChangeText={text => setMessageText(text)}
                value={messageText}
                keyboardAppearance="dark"
                returnKeyType="send"
              />
              <Ionicons
                name={'send'}
                color="white"
                size={18}
                onPress={handleSendMessage}
              />
            </View>
          </KeyboardAvoidingView>
        </>
      ) : (
        <View>
          <Text>something is wrong</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default DirectMessageScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
  headerUserContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pfp: {
    height: 30,
    width: 30,
    borderRadius: 30,
    backgroundColor: Colors.red,
    marginLeft: '7%',
  },
  headerMiddle: {
    marginLeft: 14,
  },
  displayName: {
    color: 'white',
    fontSize: 15,
    fontFamily: 'Inter-bold',
  },
  handle: {
    color: 'white',
    fontFamily: 'Inter-Regular',
    fontSize: 10,
  },
  line: {
    borderBottomColor: Colors.darkGrey,
    borderWidth: 0.5,
  },

  // if a song was shared:
  fromSongContainer: {
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    marginLeft: '5%',
    marginVertical: 5,
  },
  mySongContainer: {
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
    marginRight: '5%',
    marginVertical: 5,
  },
  songPhoto: {
    height: 250,
    width: 250,
  },
  fromSongInfoContainer: {
    height: 100,
    width: 250,
    backgroundColor: '#1F1F1F',
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    paddingLeft: 8,
    paddingVertical: 10,
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  songTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  songName: {
    color: 'white',
    fontFamily: 'Inter-bold',
    fontSize: 16,
    marginLeft: 5,
    maxWidth: 220,
  },
  songMiddle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 5,
  },
  artistName: {
    color: 'white',
    fontFamily: 'Inter-regular',
    fontSize: 13,
    maxWidth: 110,
  },
  smallDot: {
    marginHorizontal: 5,
  },
  albumName: {
    color: 'white',
    fontFamily: 'Inter-regular',
    fontSize: 13,
    maxWidth: 110,
  },
  spotifyBtn: {
    backgroundColor: '#303030',
    width: 175,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  spotifyText: {
    fontFamily: 'Inter-Bold',
    color: 'white',
    fontSize: 12,
    marginLeft: 5,
    marginRight: 10,
  },
  fromSongTextContainer: {
    backgroundColor: '#1F1F1F',
    textAlign: 'left',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 12,
    maxWidth: '75%',
    alignSelf: 'flex-start',
    borderRadius: 20,
    marginVertical: 5,
  },
  mySongTextContainer: {
    backgroundColor: 'rgba(255, 8, 0, 0.8);',
    textAlign: 'left',
    alignItems: 'flex-end',
    paddingVertical: 10,
    paddingHorizontal: 12,
    maxWidth: '75%',
    alignSelf: 'flex-end',
    borderRadius: 20,
    marginVertical: 5,
  },
  // from user
  fromContainer: {
    backgroundColor: '#1F1F1F',
    textAlign: 'left',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 12,
    maxWidth: '75%',
    alignSelf: 'flex-start',
    borderRadius: 20,
    marginVertical: 5,
    marginLeft: '5%',
  },

  // my user
  myUserContainer: {
    backgroundColor: 'rgba(255, 8, 0, 0.8);',
    textAlign: 'right',
    alignItems: 'flex-end',
    paddingVertical: 10,
    paddingHorizontal: 12,
    maxWidth: '75%',
    alignSelf: 'flex-end',
    borderRadius: 20,
    marginVertical: 5,
    marginRight: '5%',
  },

  messageText: {
    color: 'white',
    fontFamily: 'Inter-Regular',
  },

  //keyboard and input UI
  keyboardContainer: {
    position: 'absolute',
    bottom: 0,
    paddingBottom: '5%',
    paddingTop: '5%',
    alignSelf: 'center',
    width: '100%',
    // backgroundColor: 'red',
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#1F1F1F',
    width: '95%',
    alignSelf: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 10,
    paddingVertical: 10,
    borderRadius: 20,
    paddingHorizontal: 15,
  },
  textInput: {
    // backgroundColor: 'yellow',
    width: 290,
    paddingLeft: 10,
    color: 'white',
  },
});
