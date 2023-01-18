import {StyleSheet} from 'react-native';
import React from 'react';
import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';

const DMDrawer = ({navigation}) => {
  return (
    <DrawerContentScrollView contentContainerStyle={styles.drawer}>
      <DrawerItem
        label="Report"
        icon={() => <Ionicons color={'white'} size={24} name={'flag'} />}
        labelStyle={styles.drawerItem}
      />
      <DrawerItem
        label="Block"
        icon={() => (
          <Ionicons color={'white'} size={24} name={'alert-circle'} />
        )}
        labelStyle={styles.drawerItem}
      />
    </DrawerContentScrollView>
  );
};

export default DMDrawer;

const styles = StyleSheet.create({
  drawer: {
    backgroundColor: 'black',
    height: '100%',
    borderLeftWidth: 0.25,
    borderLeftColor: 'grey',
  },
  drawerItem: {
    color: 'white',
    fontFamily: 'SFProRounded-Bold',
    fontSize: 17,
    marginLeft: -20,
  },
});
