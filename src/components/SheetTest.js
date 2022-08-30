import {
  StyleSheet,
  useWindowDimensions,
  View,
  Text,
  Dimensions,
  Animated,
} from 'react-native';
import React, {useEffect, useRef} from 'react';
import {GestureDetector} from 'react-native-gesture-handler';

const SheetTest = React.memo(() => {
  const translation = useRef(new Animated.Value(0)).current;

  return (
    <GestureDetector>
      <Animated.View style={styles.bottomSheet}>
        <Text>hey</Text>
      </Animated.View>
    </GestureDetector>
  );
});

export default SheetTest;

const styles = StyleSheet.create({
  // container: {
  //   flex: 1,
  //   width: '100%',
  // },
  bottomSheet: {
    position: 'absolute',
    backgroundColor: 'red',
    height: '100%',
    width: '100%',
  },
});
