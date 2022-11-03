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
  const {UID} = props;
  const [userPosts, setUserPosts] = useState([]);
  const [songID, setSongID] = useState();

  useEffect(() => {
    if (UID) {
      async function getTracks() {
        const posts = await firestore().collection('users').doc(UID).get();
        if (posts.exists) {
          console.log(posts._data.userPosts);
          setUserPosts(posts._data.userPosts);
        }
      }
      getTracks();
    }
  }, [UID]);

  return (
    <View style={styles.container}>
      <>
        {userPosts ? (
          <>
            <View style={styles.trackScrollContainer}>
              <FlatList
                data={userPosts}
                numColumns={2}
                contentContainerStyle={{paddingBottom: 10}}
                style={{width: '100%', height: '100%', marginTop: 1}}
                renderItem={({item, index}) => {
                  return (
                    <View style={styles.postContainer} key={index}>
                      <TouchableOpacity
                        onPress={() => {
                          setSongID(item.id);
                          // navigation.navigate('ViewPostsScreen', {
                          //   userPosts: userPosts,
                          //   selectedPostIndex: index,
                          // });
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
    // flex: 1,
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
