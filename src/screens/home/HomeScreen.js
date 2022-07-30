import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import Colors from '../../assets/utilities/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Spotify from '../../assets/img/spotify.svg';
import firestore from '@react-native-firebase/firestore';

const HomeScreen = () => {
  const [forYouTrue, setForYouTrue] = useState(true);
  const [feed, setFeed] = useState();
  const [like, setLike] = useState(false);
  const sizing = Dimensions.get('screen');
  const screenWidth = sizing.width;
  const screenHeight = sizing.width;
  console.log(screenHeight);

  const focusHandler = () => {
    setForYouTrue(!forYouTrue);
  };

  useEffect(() => {
    const fetchFeed = async () => {
      const feedData = await firestore().collection('posts').get();
      // .then(console.log(feedData))
      // .then(setFeed(feedData));
      if (feedData) {
        setFeed(feedData.docs);
      }
    };
    // fetchFeed();
  }, []);

  return (
    <>
      {feed ? (
        <>
          {console.log(feed[0])}
          <SafeAreaView style={styles.container}>
            <View style={styles.topContainer}>
              <Text
                onPress={focusHandler}
                style={forYouTrue ? styles.unFocus : styles.Focus}>
                Following
              </Text>
              <Text
                onPress={focusHandler}
                style={forYouTrue ? styles.Focus : styles.unFocus}>
                For You
              </Text>
            </View>
            <FlatList
              style={{width: screenWidth, alignSelf: 'center'}}
              data={feed}
              numColumns={1}
              horizontal="true"
              snapToAlignment="center"
              alignItems="center"
              renderItem={({item, index}) => {
                return (
                  <View key={index}>
                    <View style={styles.coverArtContainer}>
                      <Image
                        style={styles.coverArt}
                        // resizeMode="contain"
                        source={{
                          uri: item._data.songPhoto.url,
                        }}
                      />
                    </View>
                    <View style={styles.middleContainer}>
                      <View style={styles.trackInfoContainer}>
                        <Text style={styles.trackName}>
                          {item._data.songName}
                        </Text>
                        <View style={styles.trackDetails}>
                          <Text style={styles.artistName}>
                            {item._data.artistName}
                          </Text>
                          <Ionicons
                            style={styles.smallDot}
                            name="ellipse"
                            color={Colors.greyOut}
                            size={3}
                          />
                          <Text style={styles.albumName}>
                            {item._data.albumName}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.interactContainer}>
                        <TouchableOpacity>
                          <Spotify
                            style={styles.spotifyButton}
                            height={24}
                            width={24}
                          />
                        </TouchableOpacity>
                        <View style={styles.likesContainer}>
                          <TouchableOpacity onPress={() => setLike(!like)}>
                            <Ionicons
                              style={styles.socialIcon}
                              name={like ? 'heart' : 'heart-outline'}
                              color={like ? '#1DB954' : 'grey'}
                              size={28}
                            />
                          </TouchableOpacity>
                          <Text style={styles.likeCount}>likes</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.commentContainerBackground}>
                      <View style={styles.drawer} />
                      <View style={styles.commentContainer}>
                        <View style={styles.userContainer}>
                          <Spotify height={15} width={15} />
                          <Text style={styles.username}>username</Text>
                        </View>
                        <View style={styles.commentTextContainer}>
                          <Text style={styles.comment}>
                            {item._data.caption}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              }}
            />
          </SafeAreaView>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
  },
  topContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  unFocus: {
    color: Colors.greyOut,
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginHorizontal: '5%',
  },
  Focus: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginHorizontal: '5%',
  },
  // flatListContainer: {
  //   height: '100%',
  //   width: '100%',
  // },
  coverArtContainer: {
    width: '100%',
    justifyContent: 'center',
    marginTop: '5%',
    alignSelf: 'center',
  },
  coverArt: {
    marginBottom: '3%',
    height: 300,
    width: 300,
    alignSelf: 'center',
  },
  middleContainer: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
    height: '4.5%',
    backgroundColor: 'red',
  },
  trackInfoContainer: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  trackName: {
    color: 'white',
    fontFamily: 'Inter-bold',
    fontSize: 24,
  },
  trackDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  artistName: {
    color: 'white',
    fontFamily: 'Inter-regular',
    fontSize: 16,
  },
  smallDot: {
    marginHorizontal: '3%',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  albumName: {
    color: 'white',
    fontFamily: 'Inter-regular',
    fontSize: 16,
  },
  interactContainer: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  likesContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: '4%',
  },
  socialIcon: {
    marginTop: 0,
  },
  likeCount: {
    color: 'white',
  },
  spotifyButton: {
    height: 25,
    width: 25,
    marginTop: 3,
  },
  //comments
  commentContainerBackground: {
    backgroundColor: '#161616',
    width: '100%',
    marginTop: '5%',
    borderTopEndRadius: 14,
    borderTopStartRadius: 14,
    alignSelf: 'center',
  },
  drawer: {
    borderBottomColor: 'white',
    borderWidth: 2,
    borderRadius: 10,
    width: 50,
    alignSelf: 'center',
    marginTop: '3%',
  },
  commentContainer: {
    marginTop: '1%',
    marginLeft: '5%',
    width: '90%',
    height: '100%',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    color: Colors.greyOut,
    fontFamily: 'Inter-Medium',
    marginLeft: 5,
  },
  comment: {
    marginTop: '3%',
    color: 'white',
  },
});
