import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Colors from '../assets/utilities/Colors';
import axios from 'axios';
import appCheck from '@react-native-firebase/app-check';
import DeviceInfo from 'react-native-device-info';
import {simKey} from '../../simKey';

const UserPosts = props => {
  const {profileID, UID, navigation} = props;
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    if (profileID && UID) {
      async function fetchUsersTracks() {
        let isEmulator = await DeviceInfo.isEmulator();
        let authToken;
        if (!isEmulator) {
          authToken = await appCheck().getToken();
        }
        axios
          .get(
            `http://167.99.22.22/fetch/library?userId=${profileID}&viewerId=${UID}`,
            {
              headers: {
                accept: 'application/json',
                Authorization: isEmulator
                  ? 'Bearer ' + simKey
                  : 'Bearer ' + authToken.token,
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
      }
      fetchUsersTracks();
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
                      <TouchableWithoutFeedback
                        onPress={() => {
                          navigation.navigate('ViewPostsScreen', {
                            //making the song an array so it works with swiper package
                            songInfo: [userPosts[index]],
                            UID: UID,
                          });
                        }}>
                        <View>
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
                        </View>
                      </TouchableWithoutFeedback>
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
    marginTop: 182,
  },
  trackScrollContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  postContainer: {
    paddingHorizontal: '5%',
    paddingVertical: '4%',
    marginTop: '1%',
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
