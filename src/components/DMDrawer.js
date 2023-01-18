import {StyleSheet} from 'react-native';
import React, {useContext} from 'react';
import {DMDrawerContext} from '../context/DMDrawerContext';
import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
// import {useNavigation} from '@react-navigation/native';
const DMDrawer = props => {
  const {navigation} = props;
  const {setShowReportModal, setShowBlockModal} = useContext(DMDrawerContext);
  //   const navigation = useNavigation();
  return (
    <DrawerContentScrollView contentContainerStyle={styles.drawer}>
      <DrawerItem
        onPress={() => {
          navigation.toggleDrawer();
          setShowReportModal(true);
        }}
        label="Report"
        icon={() => <Ionicons color={'white'} size={24} name={'flag'} />}
        labelStyle={styles.drawerItem}
      />
      <DrawerItem
        onPress={() => {
          navigation.toggleDrawer();
          setShowBlockModal(true);
        }}
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
