import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
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

const HomeScreenTest = () => {
  const [feed, setFeed] = useState();
  const [forYouTrue, setForYouTrue] = useState(true);

  const focusHandler = () => {
    setForYouTrue(!forYouTrue);
  };

  useEffect(() => {
    const fetchFeed = async () => {
      const feedData = await firestore().collection('posts').get();
      // .then(setFeed(feedData));
      if (feedData) {
        console.log(feedData._docs);
        setFeed(feedData._docs);
      }
    };
    // fetchFeed();
  }, []);

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

            {/* <FlatList
              // eslint-disable-next-line react-native/no-inline-styles
              contentContainerStyle={{
                flexDirection: 'row',
              }}
              data={feed}
              snapToInterval={Dimensions.get('screen').width}
              snapToAlignment={'center'}
              horizontal="true"
              renderItem={({item, index}) => {
                return (
                  <>
                    <View key={index}>
                      <Image
                        style={styles.coverArt}
                        source={{
                          uri: item._data.songPhoto,
                        }}
                      />
                    </View>
                  </>
                );
              }}
            /> */}
          </SafeAreaView>
        </>
      ) : (
        <>
          <SafeAreaView>
            <Text>Nothing to see here</Text>
          </SafeAreaView>
        </>
      )}
    </>
  );
};

export default HomeScreenTest;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    flex: 1,
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
    height: 300,
    width: 300,
  },
});
