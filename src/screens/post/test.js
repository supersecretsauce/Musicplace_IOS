import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import Colors from '../../assets/utilities/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Spotify from '../../assets/img/spotify.svg';
import firestore from '@react-native-firebase/firestore';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

const HomeScreen = () => {
  const [forYouTrue, setForYouTrue] = useState(true);
  const [like, setLike] = useState(false);
  const [feed, setFeed] = useState();
  const gesture = Gesture.Pan().onUpdate(event => {
    // translateY.value = event.translationY;
    console.log(event.translationY);
  });
  useEffect(() => {
    const fetchFeed = async () => {
      const feedData = await firestore().collection('posts').get();
      // .then(console.log(feedData))
      // .then(setFeed(feedData));
      if (feedData) {
        setFeed(feedData.docs);
      }
    };
    fetchFeed();
  }, []);

  const focusHandler = () => {
    setForYouTrue(!forYouTrue);
  };

  return (
    <>
      {feed ? (
        <>
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
            <Image
              resizeMode="cover"
              style={styles.coverArt}
              source={{
                uri: 'https://i.scdn.co/image/ab67616d0000b27368968350c2550e36d96344ee',
              }}
            />
            <View style={styles.middleContainer}>
              <View style={styles.trackInfoContainer}>
                <Text style={styles.trackName}>Beachside</Text>
                <Text style={styles.artistName}>Relyae</Text>
                <Text style={styles.albumName}>Album</Text>
              </View>
              <View style={styles.interactContainer}>
                <View style={styles.likesContainer}>
                  <TouchableOpacity onPress={() => setLike(!like)}>
                    <Ionicons
                      style={styles.socialIcon}
                      name={like ? 'heart' : 'heart-outline'}
                      color={like ? '#1DB954' : 'grey'}
                      size={24}
                    />
                  </TouchableOpacity>
                  <Text style={styles.likeCount}>likes</Text>
                </View>
                <TouchableOpacity>
                  <Spotify height={24} width={24} />
                </TouchableOpacity>
              </View>
            </View>
            <GestureDetector gesture={gesture}>
              <Animated.View style={styles.commentContainerBackground}>
                <View style={styles.drawer} />
                <View style={styles.commentContainer}>
                  <View style={styles.userContainer}>
                    <Spotify height={15} width={15} />
                    <Text style={styles.username}>username</Text>
                  </View>
                  <View style={styles.commentTextContainer}>
                    <Text style={styles.comment}>
                      One of the hardest songs of the year no doubt my lord it’s
                      so so good.{' '}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            </GestureDetector>
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
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
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

  coverArt: {
    marginTop: '5%',
    marginBottom: '3%',
    height: '45%',
    width: '90%',
  },
  middleContainer: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: '11.5%',
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
  artistName: {
    color: 'white',
    fontFamily: 'Inter-regular',
    fontSize: 16,
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
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  likesContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {
    marginRight: 2,
  },
  likeCount: {
    color: 'white',
    fontFamily: 'inter-regular',
  },
  spotifyButton: {
    height: 50,
    width: 50,
  },

  //comments
  commentContainerBackground: {
    backgroundColor: '#101010',
    width: '100%',
    marginTop: '3%',
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
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
