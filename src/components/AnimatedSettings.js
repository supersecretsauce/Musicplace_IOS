import {StyleSheet, Text, View, useWindowDimensions} from 'react-native';
import React from 'react';
import {PanGestureHandler} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const AnimatedSettings = props => {
  const {handlePress} = props;
  const dimensions = useWindowDimensions();
  const top = useSharedValue(dimensions.height);
  const style = useAnimatedStyle(() => {
    return {
      top: top.value,
    };
  });

  const gestureHandler = useAnimatedGestureHandler({});

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View
        style={[
          // eslint-disable-next-line react-native/no-inline-styles
          {
            position: 'absolute',
            backgroundColor: 'grey',
            left: 0,
            right: 0,
            bottom: 0,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
          style,
        ]}>
        <Text>sheet</Text>
      </Animated.View>
    </PanGestureHandler>
  );
};

export default AnimatedSettings;

const styles = StyleSheet.create({});
