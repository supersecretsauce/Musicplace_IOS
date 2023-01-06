import {StyleSheet, Text, View, useWindowDimensions} from 'react-native';
import React, {useContext} from 'react';
import {DrawerContext} from '../../context/DrawerContext';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import {SPRING_CONFIG} from '../../assets/utilities/reanimated-2';
import {withSpring} from 'react-native-reanimated';

const ProfileDrawer = ({navigation}) => {
  const {editTopValue} = useContext(DrawerContext);
  const dimensions = useWindowDimensions();
  function handleEditProfile() {
    navigation.closeDrawer();
    editTopValue.value = withSpring(dimensions.height / 10, SPRING_CONFIG);
  }
  return (
    <DrawerContentScrollView contentContainerStyle={styles.drawer}>
      {/* <DrawerItemList {...props} /> */}
      <DrawerItem
        label="Edit Profile"
        labelStyle={styles.drawerItem}
        onPress={handleEditProfile}
      />
    </DrawerContentScrollView>
  );
};

export default ProfileDrawer;

const styles = StyleSheet.create({
  drawer: {
    backgroundColor: 'black',
    height: '100%',
  },
  drawerItem: {
    color: 'white',
    fontFamily: 'SFProRounded-Bold',
    fontSize: 16,
  },
});
