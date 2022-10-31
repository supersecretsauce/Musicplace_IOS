import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  SafeAreaView,
} from 'react-native';
import React from 'react';
import Animated, {useAnimatedGestureHandler} from 'react-native-reanimated';
import {PanGestureHandler} from 'react-native-gesture-handler';
const BottomSheet2 = () => {
  const dimensions = useWindowDimensions();
  const startingHeight = dimensions.height / 1.5;
  const gestureHandler = useAnimatedGestureHandler({});
  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View
        style={{
          position: 'absolute',
          backgroundColor: '#1F1F1F',
          borderTopEndRadius: 30,
          borderTopStartRadius: 30,
          width: dimensions.width,
          height: dimensions.height,
          bottom: 0,
          // top: '70%',
          top: 485,
        }}>
        <Text>hey</Text>
      </Animated.View>
    </PanGestureHandler>
  );
};

export default BottomSheet2;

const styles = StyleSheet.create({});
