import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect} from 'react';
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

const ShareSheet = props => {
  const {showShareSheet} = props;
  const top = useSharedValue(1000);
  const style = useAnimatedStyle(() => {
    return {
      top: top.value,
    };
  });

  useEffect(() => {
    if (showShareSheet) {
      top.value = withSpring(200, SPRING_CONFIG);
    }
  }, [showShareSheet]);

  const gestureHandler = useAnimatedGestureHandler({
    onStart(_, context) {
      context.startTop = top.value;
    },
    onActive(event, context) {
      top.value = context.startTop + event.translationY;
    },
  });

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.shareSheet, style]}>
        <View style={styles.tab} />
        <Text style={styles.shareText}>Share Song</Text>
        <View>
          <TouchableOpacity>
            <Text>cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text>send</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
};

export default ShareSheet;

const styles = StyleSheet.create({
  shareSheet: {
    position: 'absolute',
    backgroundColor: '#1F1F1F',
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
    fontSize: 20,
    color: 'white',
    alignSelf: 'center',
    marginTop: 10,
  },
});
