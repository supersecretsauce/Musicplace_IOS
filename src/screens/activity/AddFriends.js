import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../assets/utilities/Colors';
const AddFriends = ({navigation}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topContainer}>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => navigation.navigate('ActivityScreen')}>
          <Ionicons name={'chevron-back'} color={'white'} size={32} />
        </TouchableOpacity>
        <Text style={styles.addHeader}>Add Friends</Text>
      </View>
      <View style={styles.searchOutline}>
        <Ionicons name={'search'} color={Colors.greyOut} size={20} />
        <TextInput
          placeholderTextColor={Colors.greyOut}
          style={styles.textInput}
          placeholder="find your friends"
        />
      </View>
    </SafeAreaView>
  );
};

export default AddFriends;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    flex: 1,
  },
  topContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: '6%',
  },
  backIcon: {
    position: 'absolute',
    right: 205,
  },
  addHeader: {
    fontFamily: 'Inter-Bold',
    color: 'white',
    fontSize: 18,
    alignSelf: 'center',
  },
  searchOutline: {
    marginTop: '5%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    alignSelf: 'center',
    backgroundColor: Colors.darkGrey,
    paddingVertical: 10,
    paddingLeft: '5%',
    width: '90%',
    borderRadius: 6,
  },
  textInput: {
    marginLeft: '3%',
    width: '90%',
  },
});
