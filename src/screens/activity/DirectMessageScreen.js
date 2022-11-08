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
import React, {useEffect, useState, useContext} from 'react';
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
  const {profileID, userProfile} = route.params;
  const [chatDoc, setChatDoc] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [chatEmpty, setChatEmpty] = useState(null);

  useEffect(() => {
    if (UID) {
      console.log(userProfile);
      const subscriber = firestore()
        .collection('chats')
        .where('users', 'array-contains', UID)
        .onSnapshot(documentSnapshot => {
          console.log('User data: ', documentSnapshot);
          if (documentSnapshot.empty) {
            return;
          } else {
            setChatDoc(documentSnapshot._docs);
          }
        });

      // Stop listening for updates when no longer required
      return () => subscriber();
    }
  }, [UID]);

  const dummyData = [
    {
      test: 'test',
    },
  ];

  //animation work
  const flex = useSharedValue(0.9);
  const style = useAnimatedStyle(() => {
    return {
      flex: flex.value,
    };
  });
  function handleAnimation() {
    flex.value = withSpring(0.5, SPRING_CONFIG);
  }
  function handleAnimationDown() {
    flex.value = withSpring(0.9, SPRING_CONFIG);
  }

  function handleSendMessage() {
    firestore()
      .collection('chats')
      .doc(chatDoc[0].id)
      .collection('messages')
      .add({
        messageText: messageText,
        sendAt: new Date(),
      })
      .then(() => {
        console.log('User added!');
      });
  }

  return (
    <SafeAreaView
      style={styles.container}
      onTouchStart={() => Keyboard.dismiss()}>
      {userProfile ? (
        <>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity style={styles.backBtn}>
                <Ionicons name={'chevron-back'} color="white" size={32} />
              </TouchableOpacity>
              {userProfile.pfpURL ? (
                <Image
                  style={styles.pfp}
                  source={{
                    uri: userProfile.profilePic,
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
            {chatDoc ? (
              <FlatList
                data={dummyData}
                renderItem={({item}) => {
                  return (
                    <View>
                      <Text style={{color: 'white'}}>{item.test}</Text>
                    </View>
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
              />
              <Ionicons name={'send'} color="white" size={18} />
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
  },

  //keyboard and input UI
  keyboardContainer: {
    position: 'absolute',
    bottom: 0,
    paddingBottom: 10,
    alignSelf: 'center',
    width: '100%',
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
