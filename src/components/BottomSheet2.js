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
    <SafeAreaView>
      <View
        style={{
          backgroundColor: 'red',
          height: 350,
          width: 500,
          // bottom: 0,
        }}>
        {/* <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View
          style={{
            position: 'absolute',
            backgroundColor: '#1F1F1F',
            borderTopEndRadius: 30,
            borderTopStartRadius: 30,
            width: dimensions.width,
            height: 200,
            bottom: 0,
            // top: '70%',
          }}>
          <Text>hey</Text>
        </Animated.View>
      </PanGestureHandler> */}
      </View>
    </SafeAreaView>
  );
};

export default BottomSheet2;

const styles = StyleSheet.create({});
