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
import axios from 'axios';
import appCheck from '@react-native-firebase/app-check';

const UserPosts = props => {
  const {profileID, UID, navigation} = props;
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    if (profileID && UID) {
      appCheck()
        .getToken()
        .then(resp => {
          axios
            .get(
              `http://167.99.22.22/fetch/library?userId=${profileID}&viewerId=${UID}`,
              {
                headers: {
                  accept: 'application/json',
                  Authorization: 'Bearer ' + resp.token,
                },
              },
            )
            .then(response => {
              console.log(response);
              setUserPosts(response.data.data);
            })
            .catch(e => {
              console.log(e);
            });
        });
    }
  }, [profileID, UID]);

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
