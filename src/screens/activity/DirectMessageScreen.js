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
    setMessageText('');
    if (!chatDoc) {
      firestore()
        .collection('chats')
        .add({
          members: {
            [profileID]: true,
            [UID]: true,
          },
          createdAt: new Date(),
          lastMessageAt: new Date(),
          memberInfo: [
            {
              UID: profileID,
              displayName: userProfile.displayName,
              handle: userProfile.handle,
              pfpURL: userProfile?.pfpURL ? userProfile?.pfpURL : false,
            },
            {
              UID: myUser.UID,
              displayName: myUser.displayName,
              handle: myUser.handle,
              pfpURL: myUser?.pfpURL ? myUser?.pfpURL : false,
            },
          ],
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
              sentAt: new Date(),
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
          sentAt: new Date(),
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
          lastMessageAt: new Date(),
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
    } else {
      navigation.navigate('ViewUserScreen', {
        profileID: profileID,
        myUser: myUser,
        userProfile: userProfile,
        prevRoute: prevRoute,
      });
    }
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
                <Text style={styles.handle}>{userProfile.handle}</Text>
              </View>
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
                // onLayout={() => flatlistRef.scrollToEnd({animated: true})}
                renderItem={({item}) => {
                  return (
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
    paddingVertical: 14,
    justifyContent: 'space-between',
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
    marginLeft: '6%',
  },
  displayName: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-bold',
  },
  handle: {
    color: 'white',
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  line: {
    borderBottomColor: Colors.darkGrey,
    borderWidth: 0.5,
  },
  flatListContainer: {
    // backgroundColor: 'red',
    // paddingTop: 10,
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
