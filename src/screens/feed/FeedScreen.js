import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useContext, useState} from 'react';
import {Context} from '../../context/Context';
import Colors from '../../assets/utilities/Colors';
import firestore from '@react-native-firebase/firestore';
import {FlatList} from 'react-native-gesture-handler';
import FastImage from 'react-native-fast-image';
import Ionicons from 'react-native-vector-icons/Ionicons';

const FeedScreen = ({navigation}) => {
  const {UID} = useContext(Context);
  const [myUser, setMyUser] = useState(null);

  const dummyData = [
    {
      id: '008aqmngiiKe5jrPSNyV6n',
      songName: 'G Wagon',
      songPhoto:
        'https://i.scdn.co/image/ab67616d0000b273c9e0be25252692294eabee6a',
      likedBy: 'IkqL5FCbYJWnfhFf2mDXOMEcQh13',
      pfpURL:
        'https://firebasestorage.googleapis.com:443/v0/b/musicplace-66f20.appspot.com/o/EFZhNvJTZ8NLWzIfe93ZHHqSDB13PFP?alt=media&token=a18dc233-a0e8-4ed3-bbfd-43ab6cc5522a',
      artists: [{name: 'somebody'}],
      likedAt: new Date(),
      displayName: 'maxmandia',
      albumName: 'idk',
    },
    {
      id: '008aqmngiiKe5jrPSNyV6n',
      songName: 'G Wagon',
      songPhoto:
        'https://i.scdn.co/image/ab67616d0000b273c9e0be25252692294eabee6a',
      likedBy: 'IkqL5FCbYJWnfhFf2mDXOMEcQh13',
      pfpURL:
        'https://firebasestorage.googleapis.com:443/v0/b/musicplace-66f20.appspot.com/o/EFZhNvJTZ8NLWzIfe93ZHHqSDB13PFP?alt=media&token=a18dc233-a0e8-4ed3-bbfd-43ab6cc5522a',
      artists: [{name: 'somebody'}],
      likedAt: new Date(),
      displayName: 'maxmandia',
      albumName: 'idk',
    },
    {
      id: '008aqmngiiKe5jrPSNyV6n',
      songName: 'G Wagon',
      songPhoto:
        'https://i.scdn.co/image/ab67616d0000b273c9e0be25252692294eabee6a',
      likedBy: 'IkqL5FCbYJWnfhFf2mDXOMEcQh13',
      pfpURL:
        'https://firebasestorage.googleapis.com:443/v0/b/musicplace-66f20.appspot.com/o/EFZhNvJTZ8NLWzIfe93ZHHqSDB13PFP?alt=media&token=a18dc233-a0e8-4ed3-bbfd-43ab6cc5522a',
      artists: [{name: 'somebody'}],
      likedAt: new Date(),
      displayName: 'maxmandia',
      albumName: 'idk',
    },
    {
      id: '008aqmngiiKe5jrPSNyV6n',
      songName: 'G Wagon',
      songPhoto:
        'https://i.scdn.co/image/ab67616d0000b273c9e0be25252692294eabee6a',
      likedBy: 'IkqL5FCbYJWnfhFf2mDXOMEcQh13',
      pfpURL:
        'https://firebasestorage.googleapis.com:443/v0/b/musicplace-66f20.appspot.com/o/EFZhNvJTZ8NLWzIfe93ZHHqSDB13PFP?alt=media&token=a18dc233-a0e8-4ed3-bbfd-43ab6cc5522a',
      artists: [{name: 'somebody'}],
      likedAt: new Date(),
      displayName: 'maxmandia',
      albumName: 'idk',
    },
    {
      id: '008aqmngiiKe5jrPSNyV6n',
      songName: 'G Wagon',
      songPhoto:
        'https://i.scdn.co/image/ab67616d0000b273c9e0be25252692294eabee6a',
      likedBy: 'IkqL5FCbYJWnfhFf2mDXOMEcQh13',
      pfpURL:
        'https://firebasestorage.googleapis.com:443/v0/b/musicplace-66f20.appspot.com/o/EFZhNvJTZ8NLWzIfe93ZHHqSDB13PFP?alt=media&token=a18dc233-a0e8-4ed3-bbfd-43ab6cc5522a',
      artists: [{name: 'somebody'}],
      likedAt: new Date(),
      displayName: 'maxmandia',
      albumName: 'idk',
    },
    {
      id: '008aqmngiiKe5jrPSNyV6n',
      songName: 'G Wagon',
      songPhoto:
        'https://i.scdn.co/image/ab67616d0000b273c9e0be25252692294eabee6a',
      likedBy: 'IkqL5FCbYJWnfhFf2mDXOMEcQh13',
      pfpURL:
        'https://firebasestorage.googleapis.com:443/v0/b/musicplace-66f20.appspot.com/o/EFZhNvJTZ8NLWzIfe93ZHHqSDB13PFP?alt=media&token=a18dc233-a0e8-4ed3-bbfd-43ab6cc5522a',
      artists: [{name: 'somebody'}],
      likedAt: new Date(),
      displayName: 'maxmandia',
      albumName: 'idk',
    },
    {
      id: '008aqmngiiKe5jrPSNyV6n',
      songName: 'G Wagon',
      songPhoto:
        'https://i.scdn.co/image/ab67616d0000b273c9e0be25252692294eabee6a',
      likedBy: 'IkqL5FCbYJWnfhFf2mDXOMEcQh13',
      pfpURL:
        'https://firebasestorage.googleapis.com:443/v0/b/musicplace-66f20.appspot.com/o/EFZhNvJTZ8NLWzIfe93ZHHqSDB13PFP?alt=media&token=a18dc233-a0e8-4ed3-bbfd-43ab6cc5522a',
      artists: [{name: 'somebody'}],
      likedAt: new Date(),
      displayName: 'maxmandia',
      albumName: 'idk',
    },
    {
      id: '008aqmngiiKe5jrPSNyV6n',
      songName: 'G Wagon',
      songPhoto:
        'https://i.scdn.co/image/ab67616d0000b273c9e0be25252692294eabee6a',
      likedBy: 'IkqL5FCbYJWnfhFf2mDXOMEcQh13',
      pfpURL:
        'https://firebasestorage.googleapis.com:443/v0/b/musicplace-66f20.appspot.com/o/EFZhNvJTZ8NLWzIfe93ZHHqSDB13PFP?alt=media&token=a18dc233-a0e8-4ed3-bbfd-43ab6cc5522a',
      artists: [{name: 'somebody'}],
      likedAt: new Date(),
      displayName: 'maxmandia',
      albumName: 'idk',
    },
    {
      id: '008aqmngiiKe5jrPSNyV6n',
      songName: 'G Wagon',
      songPhoto:
        'https://i.scdn.co/image/ab67616d0000b273c9e0be25252692294eabee6a',
      likedBy: 'IkqL5FCbYJWnfhFf2mDXOMEcQh13',
      pfpURL:
        'https://firebasestorage.googleapis.com:443/v0/b/musicplace-66f20.appspot.com/o/EFZhNvJTZ8NLWzIfe93ZHHqSDB13PFP?alt=media&token=a18dc233-a0e8-4ed3-bbfd-43ab6cc5522a',
      artists: [{name: 'somebody'}],
      likedAt: new Date(),
      displayName: 'maxmandia',
      albumName: 'idk',
    },
    {
      id: '008aqmngiiKe5jrPSNyV6n',
      songName: 'G Wagon',
      songPhoto:
        'https://i.scdn.co/image/ab67616d0000b273c9e0be25252692294eabee6a',
      likedBy: 'IkqL5FCbYJWnfhFf2mDXOMEcQh13',
      pfpURL:
        'https://firebasestorage.googleapis.com:443/v0/b/musicplace-66f20.appspot.com/o/EFZhNvJTZ8NLWzIfe93ZHHqSDB13PFP?alt=media&token=a18dc233-a0e8-4ed3-bbfd-43ab6cc5522a',
      artists: [{name: 'somebody'}],
      likedAt: new Date(),
      displayName: 'maxmandia',
      albumName: 'idk',
    },
    {
      id: '008aqmngiiKe5jrPSNyV6n',
      songName: 'G Wagon',
      songPhoto:
        'https://i.scdn.co/image/ab67616d0000b273c9e0be25252692294eabee6a',
      likedBy: 'IkqL5FCbYJWnfhFf2mDXOMEcQh13',
      pfpURL:
        'https://firebasestorage.googleapis.com:443/v0/b/musicplace-66f20.appspot.com/o/EFZhNvJTZ8NLWzIfe93ZHHqSDB13PFP?alt=media&token=a18dc233-a0e8-4ed3-bbfd-43ab6cc5522a',
      artists: [{name: 'somebody'}],
      likedAt: new Date(),
      displayName: 'maxmandia',
      albumName: 'idk',
    },
    {
      id: '008aqmngiiKe5jrPSNyV6n',
      songName: 'G Wagon',
      songPhoto:
        'https://i.scdn.co/image/ab67616d0000b273c9e0be25252692294eabee6a',
      likedBy: 'IkqL5FCbYJWnfhFf2mDXOMEcQh13',
      pfpURL:
        'https://firebasestorage.googleapis.com:443/v0/b/musicplace-66f20.appspot.com/o/EFZhNvJTZ8NLWzIfe93ZHHqSDB13PFP?alt=media&token=a18dc233-a0e8-4ed3-bbfd-43ab6cc5522a',
      artists: [{name: 'somebody'}],
      likedAt: new Date(),
      displayName: 'maxmandia',
      albumName: 'idk',
    },
  ];

  useEffect(() => {
    if (UID) {
      firestore()
        .collection('users')
        .doc(UID)
        .get()
        .then(resp => {
          console.log(resp.data());
          setMyUser(resp.data());
        });
    }
  }, [UID]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.feedContainer}>
        <Text style={styles.feedText}>Feed</Text>
      </View>
      <View style={styles.flatListContainer}>
        <FlatList
          data={dummyData}
          renderItem={({item, index}) => {
            return (
              <View key={index} style={styles.itemContainer}>
                <TouchableOpacity
                  style={styles.userContainer}
                  onPress={() =>
                    navigation.navigate('ViewUserScreen', {
                      profileID: item.likedBy,
                      UID: UID,
                      prevRoute: 'FeedScreen',
                      myUser: myUser,
                    })
                  }>
                  <FastImage
                    style={styles.pfp}
                    source={{
                      uri: item.pfpURL,
                      priority: FastImage.priority.high,
                    }}
                  />
                  <View style={styles.textContainer}>
                    <Text style={styles.displayName}>{item.displayName}</Text>
                    <Text style={styles.likeText}>liked a track</Text>
                  </View>
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
                        <Text style={styles.songName}>{item.songName}</Text>
                        <Text style={styles.artists}>
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
    fontSize: 18,
    alignSelf: 'center',
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
  },
  artists: {
    fontFamily: 'SFProRounded-Medium',
    fontSize: 14,
    color: Colors.greyBtn,
  },
});
