import {StyleSheet, Text, View, SafeAreaView} from 'react-native';
import React, {useState} from 'react';
import Animated, {
  useAnimatedGestureHandler,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {PanGestureHandler} from 'react-native-gesture-handler';
import {SPRING_CONFIG} from '../assets/utilities/reanimated-2';
const BottomSheet2 = () => {
  const [containerUp, setContainerUp] = useState(false);
  const [containerSmall, setContainerSmall] = useState(false);
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
      console.log(top.value);
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
  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.animatedSheet, style]}></Animated.View>
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
});
