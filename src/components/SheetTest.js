import {
  StyleSheet,
  useWindowDimensions,
  View,
  Text,
  Dimensions,
} from 'react-native';
import React, {useEffect} from 'react';
import {PanGestureHandler} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
const {height: SCREEN_HEIGHT} = Dimensions.get('window');

const SheetTest = React.memo(() => {
  const dimensions = useWindowDimensions();
  const top = useSharedValue(dimensions.height);
  const translateY = useSharedValue(0);

  const animationStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: translateY.value}],
    };
  });

  const gestureHandler = useAnimatedGestureHandler({});

  return (
    <>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.animatedView, animationStyle]}>
          <Text>sheet</Text>
        </Animated.View>
      </PanGestureHandler>
    </>
  );
});

export default SheetTest;

const styles = StyleSheet.create({
  // animatedView: {
  //   position: 'absolute',
  //   left: 0,
  //   right: 0,
  //   bottom: 0,
  //   top: 500,
  //   backgroundColor: 'red',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  animatedView: {
    backgroundColor: '#1F1F1F',
    width: '100%',
    borderTopEndRadius: 30,
    borderTopStartRadius: 30,
    position: 'absolute',
    height: SCREEN_HEIGHT,
    top: '96%',
  },
});
