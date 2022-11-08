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
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Colors from '../../assets/utilities/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

const DirectMessageScreen = ({route, navigation}) => {
  const {profileID, userProfile} = route.params;

  useEffect(() => {
    if (userProfile) {
      console.log(userProfile);
    }
    if (profileID) {
      console.log(profileID);
    }
  }, [userProfile, profileID]);

  const dummyData = [
    {
      test: 'test',
    },
    {
      test: 'test',
    },
    {
      test: 'test',
    },
    {
      test: 'test',
    },
    {
      test: 'test',
    },
    {
      test: 'test',
    },
    {
      test: 'test',
    },
    {
      test: 'test',
    },

    {
      test: 'test',
    },
    {
      test: 'test',
    },
    {
      test: 'test',
    },
    {
      test: 'test',
    },
    {
      test: 'test',
    },
    {
      test: 'test',
    },
    {
      test: 'test',
    },
    {
      test: 'test',
    },
    {
      test: 'test',
    },
    {
      test: 'test',
    },
    {
      test: 'test',
    },
    {
      test: 'test',
    },
    {
      test: 'test',
    },
    {
      test: 'test',
    },
    {
      test: 'test',
    },
    {
      test: 'test',
    },
    {
      test: 'test',
    },
    {
      test: 'test',
    },
    {
      test: 'test',
    },
    {
      test: 'test',
    },
    {
      test: 'test',
    },
    {
      test: 'test',
    },
    {
      test: 'test',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
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
          <KeyboardAvoidingView behavior="position">
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="send a message"
                placeholderTextColor={Colors.greyOut}
                style={styles.textInput}
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
    // flex: 1,
    height: '100%',
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
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#1F1F1F',
    width: '90%',
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
    paddingLeft: 10,
  },
});
