import {StyleSheet, Text, View, Image} from 'react-native';
import React, {useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {FlatList} from 'react-native-gesture-handler';
import Colors from '../assets/utilities/Colors';
const UserPosts = props => {
  const UID = props.UIDProps;
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    if (UID) {
      console.log(UID);
      const fetchUserTracks = async () => {
        firestore()
          .collection('users')
          .doc(UID)
          .onSnapshot(documentSnapshot => {
            setUserPosts(documentSnapshot.data().topSongs);
          });
      };
      fetchUserTracks();
    }
  }, [UID]);

  useEffect(() => {
    if (userPosts) {
      console.log(userPosts);
    }
  }, [userPosts]);
  // console.log(
  //   userPosts[0].artists.map(artist => {
  //     return artist;
  //   }),
  // );
  return (
    <View style={styles.container}>
      <>
        {userPosts ? (
          <>
            <View style={styles.trackScrollContainer}>
              <FlatList
                data={userPosts}
                numColumns={2}
                contentContainerStyle={{paddingBottom: 390}}
                style={{width: '100%', height: '100%', marginTop: 1}}
                renderItem={({item, index}) => {
                  return (
                    <View style={styles.postContainer} key={index}>
                      <Image
                        style={styles.songPhoto}
                        source={{
                          uri: item.songPhoto,
                        }}
                      />
                      <Text numberOfLines={1} style={styles.songName}>
                        {item.songName}
                      </Text>
                      <View>
                        <Text numberOfLines={1} style={styles.artistName}>
                          {item.artists
                            ?.map(artist => {
                              return artist;
                            })
                            .join(', ')}
                        </Text>
                      </View>
                    </View>
                  );
                }}
              />
            </View>
          </>
        ) : (
          <></>
        )}
      </>
    </View>
  );
};

export default UserPosts;

const styles = StyleSheet.create({
  trackScrollContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  postContainer: {
    padding: 16,
    marginTop: '1%',
    paddingHorizontal: '6%',
  },
  songPhoto: {
    height: 150,
    width: 150,
  },
  songName: {
    color: 'white',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginTop: '6%',
    maxWidth: 140,
  },
  artistName: {
    color: Colors.greyOut,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    maxWidth: 140,
    marginTop: '2%',
  },
});
