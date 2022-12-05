import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import Colors from '../assets/utilities/Colors';
const UserPosts = props => {
  const {profileID, UID, navigation} = props;
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    if (UID) {
      async function getTracks() {
        const userDoc = await firestore()
          .collection('users')
          .doc(profileID)
          .get();
        if (userDoc.exists) {
          if (userDoc.data().topSongs.length > 0) {
            let topSongsArr = [];
            async function getAllTopSongs() {
              for (let i = 0; i < userDoc.data().topSongs.length; i += 10) {
                await firestore()
                  .collection('posts')
                  .where(
                    firestore.FieldPath.documentId(),
                    'in',
                    userDoc.data().topSongs.slice(i, i + 10),
                  )
                  .get()
                  .then(resp => {
                    console.log(resp);
                    resp.docs.forEach(document => {
                      topSongsArr.push(document.data());
                    });
                  });
              }

              setUserPosts(topSongsArr);
            }
            getAllTopSongs();
          }
          setUserPosts(posts._data.userPosts);
        }
      }
      getTracks();
    }
  }, [profileID]);

  return (
    <View style={styles.container}>
      <>
        {userPosts ? (
          <>
            <View style={styles.trackScrollContainer}>
              <FlatList
                data={userPosts}
                numColumns={2}
                contentContainerStyle={{paddingBottom: '90%'}}
                style={{width: '100%', height: '100%', marginTop: 1}}
                renderItem={({item, index}) => {
                  return (
                    <View style={styles.postContainer} key={index}>
                      <TouchableOpacity
                        onPress={() => {
                          navigation.navigate('ViewPostsScreen', {
                            //making the song an array so it works with swiper package
                            songInfo: [userPosts[index]],
                            UID: UID,
                          });
                        }}>
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
                                return artist.name;
                              })
                              .join(', ')}
                          </Text>
                        </View>
                      </TouchableOpacity>
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
  container: {
    marginTop: 215,
  },
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
