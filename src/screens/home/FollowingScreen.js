import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {firebase} from '@react-native-firebase/firestore';

const FollowingScreen = () => {
  const [UID, setUID] = useState();
  const [followingList, setFollowingList] = useState();
  const [followingData, setFollowingData] = useState();
  const [followingSongIDs, setFollowingSongIDs] = useState();

  useEffect(() => {
    const checkforUID = async () => {
      const userUID = await AsyncStorage.getItem('UID');
      if (userUID) {
        console.log(userUID);
        setUID(userUID);
      }
    };
    checkforUID();
  }, []);

  useEffect(() => {
    if (UID) {
      const getUserProfile = async () => {
        const user = await firestore().collection('users').doc(UID).get();
        console.log(user);
        setFollowingList(user._data.followingList);
      };
      getUserProfile();
    }
  }, [UID]);

  useEffect(() => {
    if (followingList) {
      firestore()
        .collection('users')
        // Filter results
        .where(firebase.firestore.FieldPath.documentId(), 'in', followingList)
        .get()
        .then(querySnapshot => {
          console.log(querySnapshot);
          setFollowingData(querySnapshot._docs);
        });
    }
  }, [UID, followingList]);

  useEffect(() => {
    if (followingData) {
      setFollowingSongIDs(
        followingData.map(user => {
          return user._data.posts;
          // user._data.posts.map(song => {
          //   return song.id;
          // });
        }),
      );
    }
  }, [followingData]);

  useEffect(() => {
    if (followingSongIDs) {
      console.log(followingSongIDs);
    }
  }, [followingSongIDs]);

  return (
    <View>
      <Text>FollowingScreen</Text>
    </View>
  );
};

export default FollowingScreen;

const styles = StyleSheet.create({});
