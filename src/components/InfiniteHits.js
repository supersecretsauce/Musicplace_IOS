import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useContext, useState} from 'react';
import {useInfiniteHits} from 'react-instantsearch-hooks';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../assets/utilities/Colors';
import {Context} from '../context/Context';
import firestore from '@react-native-firebase/firestore';
import HapticFeedback from 'react-native-haptic-feedback';

const InfiniteHits = ({...props}) => {
  const {hits, isLastPage, showMore} = useInfiniteHits(props);
  const {navigation, myUser, prevRoute} = props;
  const {UID} = useContext(Context);
  const [followingList, setFollowingList] = useState([]);
  function handleNav(item) {
    console.log(item);
    navigation.navigate('ViewUserScreen', {
      profileID: item.objectID,
      UID: UID,
      myUser: myUser,
      prevRoute: 'search',
    });
  }

  function followHandler(item) {
    if (followingList.includes(item.objectID)) {
      let filteredList = followingList.filter(id => id !== item.objectID);
      setFollowingList(filteredList);
      firestore()
        .collection('users')
        .doc(UID)
        .update({
          followingList: firestore.FieldValue.arrayRemove(item.objectID),
          following: firestore.FieldValue.increment(-1),
        });
      firestore()
        .collection('users')
        .doc(item.objectID)
        .update({
          followersList: firestore.FieldValue.arrayRemove(UID),
          followers: firestore.FieldValue.increment(-1),
        });
    } else {
      setFollowingList(current => [...current, item.objectID]);
      firestore()
        .collection('users')
        .doc(UID)
        .update({
          followingList: firestore.FieldValue.arrayUnion(item.objectID),
          following: firestore.FieldValue.increment(1),
        });
      firestore()
        .collection('users')
        .doc(item.objectID)
        .update({
          followersList: firestore.FieldValue.arrayUnion(UID),
          followers: firestore.FieldValue.increment(1),
        });
      firestore()
        .collection('users')
        .doc(item.objectID)
        .collection('activity')
        .add({
          UID: UID,
          from: 'user',
          type: 'follow',
          timestamp: firestore.FieldValue.serverTimestamp(),
          songInfo: null,
          handle: myUser.handle,
          displayName: myUser.displayName,
          pfpURL: myUser?.pfpURL ? myUser?.pfpURL : null,
          notificationRead: false,
        })
        .then(() => {
          console.log('added doc to parent user');
        });
    }
  }
  return (
    <>
      {UID ? (
        <FlatList
          data={hits}
          onEndReached={() => {
            if (!isLastPage) {
              showMore();
            }
          }}
          renderItem={({item}) => (
            <>
              {item.objectID === UID ? (
                <></>
              ) : (
                <TouchableOpacity
                  onPress={() => handleNav(item)}
                  style={styles.item}>
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
                    <View style={styles.itemMiddle}>
                      <Text style={styles.displayName}>{item.displayName}</Text>
                      <Text style={styles.handle}>@{item.handle}</Text>
                    </View>
                  </View>
                  {prevRoute == 'ShareSheet' ? (
                    <TouchableOpacity
                      onPress={() => {
                        HapticFeedback.trigger('selection');
                        followHandler(item);
                      }}>
                      <Text style={styles.followText}>
                        {followingList.includes(item.objectID)
                          ? 'unfollow'
                          : 'follow'}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Ionicons
                      style={styles.socialIcon}
                      name={'chevron-forward'}
                      color={'white'}
                      size={20}
                    />
                  )}
                </TouchableOpacity>
              )}
            </>
          )}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default InfiniteHits;

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    alignSelf: 'center',
    paddingVertical: 10,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pfp: {
    backgroundColor: Colors.red,
    width: 40,
    height: 40,
    borderRadius: 40,
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
    color: 'white',
    fontSize: 11,
    marginTop: 5,
    fontFamily: 'Inter-Regular',
  },

  followButton: {
    marginRight: 10,
  },
  followText: {
    color: Colors.greyOut,
    fontFamily: 'Inter-Regular',
  },
});
