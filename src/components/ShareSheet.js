import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Animated, {
  useAnimatedGestureHandler,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {PanGestureHandler} from 'react-native-gesture-handler';
import {SPRING_CONFIG} from '../assets/utilities/reanimated-2';
import firestore from '@react-native-firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../assets/utilities/Colors';

const ShareSheet = props => {
  const {showShareSheet, UID} = props;
  const dimensions = useWindowDimensions();
  const [followingData, setFollowingData] = useState(null);

  function getFollowing() {
    firestore()
      .collection('users')
      .doc(UID)
      .get()
      .then(resp => {
        console.log(resp._data.followingList);
        let followingList = resp._data.followingList;
        if (followingList.length > 0) {
          async function getFollowingDocs() {
            let docsArray = [];
            for (let i = 0; i < followingList.length; i += 10) {
              await firestore()
                .collection('users')
                .where('UID', 'in', followingList.slice(i, i + 10))
                .get()
                .then(resp => {
                  resp._docs.forEach(doc => {
                    docsArray.push(doc._data);
                  });
                });
            }
            console.log(docsArray);
            setFollowingData(docsArray);
          }
          getFollowingDocs();
        }
      });
  }

  useEffect(() => {
    if (showShareSheet) {
      top.value = withSpring(dimensions.height / 7, SPRING_CONFIG);
      getFollowing();
    }
  }, [showShareSheet]);

  const top = useSharedValue(1000);
  const style = useAnimatedStyle(() => {
    return {
      top: top.value,
    };
  });

  const gestureHandler = useAnimatedGestureHandler({
    onStart(_, context) {
      context.startTop = top.value;
    },
    onActive(event, context) {
      top.value = context.startTop + event.translationY;
    },
  });

  return (
    <>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.shareSheet, style]}>
          <View style={styles.tab} />
          <Text style={styles.shareText}>send via direct message</Text>
          <View style={styles.toContainer}>
            <Text style={styles.toText}>to:</Text>
          </View>
          {followingData && (
            <View style={styles.flatListContainer}>
              <FlatList
                data={followingData}
                renderItem={({item, index}) => {
                  return (
                    <View style={styles.item} key={index}>
                      <View style={styles.itemLeft}>
                        {item?.pfpURL ? (
                          <Image
                            style={styles.pfp}
                            source={{
                              uri: item.pfpURL,
                            }}
                          />
                        ) : (
                          <View style={styles.pfp} />
                        )}
                        <View style={styles.itemMiddle}>
                          <Text style={styles.displayName}>
                            {item?.displayName}
                          </Text>
                          <Text style={styles.handle}>@{item?.handle}</Text>
                        </View>
                      </View>
                      <Ionicons
                        name={'radio-button-off'}
                        color={Colors.greyOut}
                        size={28}
                      />
                    </View>
                  );
                }}
              />
            </View>
          )}
        </Animated.View>
      </PanGestureHandler>
      <KeyboardAvoidingView behavior="position">
        <View style={styles.btnsContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="add a comment"
            placeholderTextColor={Colors.greyOut}
            keyboardAppearance="dark"
            autoCapitalize={'none'}
          />
          <TouchableOpacity style={styles.sendBtn}>
            <Text style={styles.sendText}>send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

export default ShareSheet;

const styles = StyleSheet.create({
  shareSheet: {
    position: 'absolute',
    backgroundColor: 'black',
    height: '100%',
    bottom: 0,
    width: '100%',
    borderTopEndRadius: 30,
    borderTopStartRadius: 30,
  },
  tab: {
    height: 5,
    width: 50,
    backgroundColor: 'grey',
    alignSelf: 'center',
    marginTop: 7,
    borderRadius: 10,
  },
  shareText: {
    fontFamily: 'Inter-Bold',
    fontSize: 15,
    color: 'white',
    alignSelf: 'center',
    marginTop: 10,
  },
  toContainer: {
    backgroundColor: 'white',
    width: '90%',
    alignSelf: 'center',
    paddingVertical: 10,
  },
  toText: {
    color: Colors.greyOut,
    marginLeft: 5,
  },
  //flatlist
  flatListContainer: {
    marginTop: 80,
    position: 'absolute',
    // backgroundColor: 'white',
    height: '60%',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    paddingVertical: 10,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pfp: {
    height: 40,
    width: 40,
    borderRadius: 40,
    backgroundColor: 'red',
  },
  itemMiddle: {
    marginLeft: 14,
  },
  displayName: {
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    fontSize: 14,
  },
  handle: {
    color: Colors.greyOut,
    fontSize: 11,
    marginTop: 5,
    fontFamily: 'Inter-Regular',
  },

  btnsContainer: {
    backgroundColor: 'black',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
  },
  textInput: {
    backgroundColor: '#1F1F1F',
    width: 350,
    paddingVertical: 10,
    borderRadius: 20,
    paddingLeft: 15,
  },
  sendBtn: {
    // backgroundColor: 'red',
    width: 350,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'grey',
    borderRadius: 20,
    justifyContent: 'center',
    marginTop: 10,
  },
  sendText: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: 'white',
  },
});
