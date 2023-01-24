import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import React, {useEffect, useContext, useState, useCallback} from 'react';
import {Context} from '../../context/Context';
import Colors from '../../assets/utilities/Colors';
import firestore from '@react-native-firebase/firestore';
import {FlatList} from 'react-native-gesture-handler';
import FastImage from 'react-native-fast-image';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useFocusEffect} from '@react-navigation/native';
import moment from 'moment';

const FeedScreen = ({navigation}) => {
  const {UID} = useContext(Context);
  const [myUser, setMyUser] = useState(null);
  const [followingList, setFollowingList] = useState(null);
  const [likes, setLikes] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (UID) {
      const subscriber = firestore()
        .collection('users')
        .doc(UID)
        .onSnapshot(documentSnapshot => {
          if (documentSnapshot == null) {
            return;
          }
          setMyUser(documentSnapshot.data());
          console.log('changes');
          let followingArr = [];
          followingArr.push(...documentSnapshot?.data()?.followingList);
          followingArr.push(UID);
          console.log(followingArr);
          setFollowingList(followingArr);
        });

      // Stop listening for updates when no longer required
      return () => subscriber();
    }
  }, [UID]);

  // everytime component is mounted, fetch new likes

  async function fetchDocs() {
    if (followingList && followingList.length > 0) {
      let likesArr = [];
      for (let i = 0; i < followingList.length; i += 10) {
        await firestore()
          .collection('feed')
          .where('user', 'in', followingList.slice(i, i + 10))
          .orderBy('date', 'desc')
          .get()
          .then(resp => {
            if (resp.empty) {
              return;
            } else {
              console.log(resp);
              resp.docs.forEach(doc => {
                likesArr.push(doc.data());
              });
            }
          });
      }
      if (likesArr.length > 0) {
        setLikes(likesArr);
      } else {
        setLikes(null);
      }
    }
  }

  useEffect(() => {
    if (followingList) {
      fetchDocs();
    }
  }, [followingList]);

  useFocusEffect(
    useCallback(() => {
      // do something
      fetchDocs();
      return () => {
        console.log('left screen');
      };
    }, [followingList]),
  );

  useEffect(() => {
    if (refreshing) {
      fetchDocs();
      console.log('refreshing');
      setRefreshing(false);
    }
  }, [refreshing]);

  function handleRefresh() {
    setRefreshing(true);
  }

  function handleFeedNav(item) {
    console.log(item);
    if (item.user == UID) {
      navigation.navigate('ProfileStackScreen');
    } else {
      navigation.navigate('ViewUserScreen', {
        profileID: item.user,
        UID: UID,
        prevRoute: 'FeedScreen',
        myUser: myUser,
      });
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.feedContainer}>
        <Text style={styles.feedText}>Feed</Text>
        <TouchableOpacity
          style={styles.addHeader}
          onPress={() =>
            navigation.navigate('AddFriends', {
              myUser: myUser,
            })
          }>
          <Ionicons name={'person-add-outline'} color={'white'} size={28} />
        </TouchableOpacity>
      </View>

      {followingList ? (
        <>
          {likes ? (
            <View style={styles.flatListContainer}>
              <FlatList
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    tintColor={Colors.greyOut}
                    title="looking for new likes"
                    titleColor="#fff"
                  />
                }
                data={likes}
                showsVerticalScrollIndicator={false}
                renderItem={({item, index}) => {
                  return (
                    <View key={index} style={styles.itemContainer}>
                      <TouchableOpacity
                        style={styles.userContainer}
                        onPress={() => handleFeedNav(item)}>
                        {item.pfpURL ? (
                          <FastImage
                            style={styles.pfp}
                            source={{
                              uri: item.pfpURL,
                              priority: FastImage.priority.high,
                            }}
                          />
                        ) : (
                          <View style={styles.pfp} />
                        )}

                        <View style={styles.textContainer}>
                          <Text style={styles.displayName}>
                            {item.displayName}
                          </Text>
                          <Text style={styles.likeText}>liked a track</Text>
                        </View>
                        <Text style={styles.dot}>•</Text>
                        <Text style={styles.date}>
                          {moment(item.date.toDate()).fromNow()}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.songContainer}
                        onPress={() =>
                          navigation.navigate('ViewPostsScreen', {
                            songInfo: [item],
                            UID: UID,
                          })
                        }>
                        <View style={styles.songInfo}>
                          <View style={styles.songInfoLeft}>
                            <FastImage
                              style={styles.songPhoto}
                              source={{
                                uri: item.songPhoto,
                                priority: FastImage.priority.high,
                              }}
                            />
                            <View style={styles.songDetails}>
                              <Text numberOfLines={1} style={styles.songName}>
                                {item.songName}
                              </Text>
                              <Text numberOfLines={1} style={styles.artists}>
                                {item.artists
                                  .map(artist => {
                                    return artist.name;
                                  })
                                  .join(', ')}
                              </Text>
                            </View>
                          </View>
                          <Ionicons
                            name="chevron-forward"
                            color={Colors.greyBtn}
                            size={20}
                          />
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                }}
              />
            </View>
          ) : (
            <View style={styles.noFriendsContainer}>
              <Text style={styles.noFriendsHeader}>No likes just yet...</Text>
              <Text style={styles.noFriendsDesc}>
                Your friend’s likes will show up here.
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
        </>
      ) : (
        <View style={styles.noFriendsContainer}>
          <Text style={styles.noFriendsHeader}>
            See what your friends are listening to
          </Text>
          <Text style={styles.noFriendsDesc}>
            Your friend’s likes will show up here.
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

export default FeedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  feedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: '6%',
    marginBottom: '4%',
    width: '90%',
  },
  feedText: {
    fontFamily: 'Inter-Bold',
    color: 'white',
    fontSize: 20,
    alignSelf: 'center',
  },
  addHeader: {
    marginLeft: 100,
    position: 'absolute',
    right: 0,
  },
  flatListContainer: {
    flex: 1,
  },
  itemContainer: {
    width: '90%',
    alignSelf: 'center',
    paddingVertical: 10,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pfp: {
    height: 20,
    width: 20,
    borderRadius: 20,
    backgroundColor: Colors.red,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  displayName: {
    color: 'white',
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
    fontSize: 16,
  },
  likeText: {
    color: Colors.greyBtn,
    fontFamily: 'Inter-Medium',
    marginLeft: 5,
    fontSize: 14,
  },
  dot: {
    color: Colors.greyBtn,
    fontFamily: 'Inter-Medium',
    marginLeft: 5,
    fontSize: 14,
  },
  date: {
    color: Colors.greyBtn,
    fontFamily: 'Inter-Medium',
    marginLeft: 5,
    fontSize: 14,
  },
  songContainer: {
    marginTop: 10,
    backgroundColor: 'rgba(52, 52, 52, 0.6)',
    borderRadius: 9,
  },
  songInfo: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  songInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  songPhoto: {
    width: 50,
    height: 50,
    borderRadius: 9,
  },
  songDetails: {
    marginLeft: 10,
  },
  songName: {
    fontFamily: 'SFProRounded-Semibold',
    fontSize: 18,
    color: 'white',
    maxWidth: 240,
  },
  artists: {
    fontFamily: 'SFProRounded-Medium',
    fontSize: 14,
    color: Colors.greyBtn,
    maxWidth: 240,
  },

  noFriendsContainer: {
    flex: 1,
    // backgroundColor: 'red',
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: '20%',
  },
  noFriendsHeader: {
    fontFamily: 'Inter-Bold',
    color: 'white',
    fontSize: 28,
    textAlign: 'center',
  },
  noFriendsDesc: {
    fontFamily: 'Inter-Medium',
    color: Colors.greyOut,
    fontSize: 15,
    textAlign: 'center',
    marginTop: '5%',
  },
  addContainer: {
    marginTop: '8%',
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
