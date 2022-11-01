import {StyleSheet, Text, View, SafeAreaView} from 'react-native';
import React, {useState, useEffect} from 'react';
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
import {FlashList} from '@shopify/flash-list';

const BottomSheet2 = props => {
  const {currentIndex, feed} = props;
  const [containerUp, setContainerUp] = useState(false);
  const [containerSmall, setContainerSmall] = useState(false);
  const [comments, setComments] = useState(false);

  useEffect(() => {
    async function getComments() {
      const commentDocs = await firestore()
        .collection('posts')
        .doc(feed[currentIndex].id)
        .collection('comments')
        .get();
      console.log(commentDocs);
      setComments(commentDocs._docs);
    }
    getComments();
  }, [currentIndex, feed]);

  const top = useSharedValue(490);
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
    onEnd() {
      if (containerUp) {
        if (top.value > 200 && top.value < 490) {
          top.value = withSpring(490, SPRING_CONFIG);
          runOnJS(setContainerUp)(false);
        } else if (top.value > 490) {
          top.value = withSpring(580, SPRING_CONFIG);
          runOnJS(setContainerUp)(false);
          runOnJS(setContainerSmall)(true);
        }
      } else {
        if (containerSmall) {
          if (top.value < 580 && top.value > 490) {
            top.value = withSpring(490, SPRING_CONFIG);
            runOnJS(setContainerSmall)(false);
          } else if (top.value < 490) {
            top.value = withSpring(200, SPRING_CONFIG);
            runOnJS(setContainerUp)(true);
            runOnJS(setContainerSmall)(false);
          }
        } else {
          if (top.value < 490) {
            top.value = withSpring(200, SPRING_CONFIG);
            runOnJS(setContainerUp)(true);
          } else if (top.value > 490) {
            top.value = withSpring(580, SPRING_CONFIG);
            runOnJS(setContainerSmall)(true);
          }
        }
      }
    },
  });

  const DATA = [
    {
      title: 'First Item',
    },
    {
      title: 'Second Item',
    },
  ];

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.animatedSheet, style]}>
        <>
          {comments ? (
            <>
              <View style={styles.flatlistContainer}>
                <FlashList
                  data={comments}
                  estimatedItemSize={comments.length}
                  renderItem={({item}) => (
                    <Text style={{color: 'white', zIndex: 2}}>
                      {item._data.comment}
                    </Text>
                  )}
                />
              </View>
            </>
          ) : (
            <>
              <Text>no comments</Text>
            </>
          )}
        </>
      </Animated.View>
    </PanGestureHandler>
  );
};

export default BottomSheet2;

const styles = StyleSheet.create({
  animatedSheet: {
    position: 'absolute',
    backgroundColor: '#1F1F1F',
    borderTopEndRadius: 30,
    borderTopStartRadius: 30,
    width: '100%',
    height: '100%',
    bottom: 0,
  },
  flatlistContainer: {
    // backgroundColor: 'red',
    width: 500,
    height: 500,
    marginTop: 20,
  },
  commentContainer: {
    backgroundColor: 'red',
    width: 500,
    height: 500,
  },
});
