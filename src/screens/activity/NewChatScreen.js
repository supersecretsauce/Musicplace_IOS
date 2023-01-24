import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Context} from '../../context/Context';
import Colors from '../../assets/utilities/Colors';
import firestore from '@react-native-firebase/firestore';
import {Toast} from 'react-native-toast-message/lib/src/Toast';

const NewChatScreen = ({route, navigation}) => {
  const {myUser} = route.params;
  const {UID} = useContext(Context);
  const [followingList, setFollowingList] = useState(null);
  const [followingData, setFollowingData] = useState(null);

  useEffect(() => {
    if (UID) {
      console.log(UID);
      firestore()
        .collection('users')
        .doc(UID)
        .onSnapshot(resp => {
          if (resp == null) {
            return;
          }
          console.log(resp._data.followingList);
          setFollowingList(resp._data.followingList);
        });
    }
  }, [UID]);

  useEffect(() => {
    if (followingList && followingList?.length > 0) {
      async function getDocs() {
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
      getDocs();
    }
  }, [followingList]);

  function handleNav(item) {
    if (item && myUser) {
      if (item.blockList.includes(UID) || myUser.blockList.includes(item.UID)) {
        Toast.show({
          type: 'error',
          text1: 'Unable to message this user.',
        });
        return;
      } else {
        navigation.navigate('DMDrawerRoute', {
          screen: 'DirectMessageScreen',
          params: {
            profileID: item.UID,
            userProfile: item,
            myUser: myUser,
            prevRoute: 'IsFollowingScreen',
          },
        });
      }
    } else {
      return;
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => navigation.goBack()}>
          <Ionicons name={'chevron-back'} color={'white'} size={28} />
        </TouchableOpacity>
        <Text style={styles.newChatText}>New Chat</Text>
      </View>
      {followingData ? (
        <View style={styles.flatListContainer}>
          <Text style={styles.followingText}>Following</Text>
          <FlatList
            data={followingData}
            renderItem={({item}) => {
              return (
                <TouchableOpacity
                  style={styles.itemContainer}
                  onPress={() => handleNav(item)}>
                  <View style={styles.itemLeft}>
                    {item.pfpURL ? (
                      <Image
                        style={styles.pfp}
                        source={{
                          uri: item.pfpURL,
                        }}
                      />
                    ) : (
                      <View style={styles.pfp} />
                    )}
                    <View style={styles.middleContainer}>
                      <Text style={styles.displayName}>{item.displayName}</Text>
                      <Text style={styles.handle}>@{item.handle}</Text>
                    </View>
                  </View>
                  <Ionicons
                    name={'chevron-forward'}
                    color={'white'}
                    size={20}
                  />
                </TouchableOpacity>
              );
            }}
          />
        </View>
      ) : (
        <View style={styles.notFollowingContainer}>
          <Text style={styles.notFollowingText}>
            You must be following someone in order to send a direct message.
          </Text>
          <TouchableOpacity
            style={styles.addContainer}
            onPress={() => {
              navigation.navigate('AddFriends', {
                myUser: myUser,
              });
            }}>
            <Text style={styles.addText}>add friends</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default NewChatScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: '6%',
  },
  newChatText: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    alignSelf: 'center',
  },
  backIcon: {
    position: 'absolute',
    right: 195,
  },
  flatListContainer: {
    width: '90%',
    flex: 1,
    alignSelf: 'center',
  },
  followingText: {
    fontFamily: 'Inter-MEdium',
    color: Colors.greyOut,
    marginTop: 20,
    marginBottom: 10,
  },
  itemContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pfp: {
    width: 40,
    height: 40,
    borderRadius: 40,
    backgroundColor: Colors.red,
  },
  middleContainer: {
    marginLeft: 10,
  },
  displayName: {
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    fontSize: 14,
  },
  handle: {
    color: 'white',
    fontSize: 11,
    marginTop: 5,
    fontFamily: 'Inter-Regular',
  },
  notFollowingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
});
