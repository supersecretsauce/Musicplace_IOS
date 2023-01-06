import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';

const ProfileDrawer = ({navigation}) => {
  function handleEditProfile() {
    navigation.closeDrawer();
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
