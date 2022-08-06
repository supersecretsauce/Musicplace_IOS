import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import Circle from '../assets/img/circle.svg';
import Colors from '../assets/utilities/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DismissKeyboard = ({children}) => (
  <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    {children}
  </TouchableWithoutFeedback>
);

const EditProfileSheet = props => {
  const setPostsTrue = props.editProps;
  const username = props.usernameProps;
  const userProfile = props.userProfileProps;
  const setEditProfile = props.editProfileProps;
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [UID, setUID] = useState('');

  useEffect(() => {
    const checkforUID = async () => {
      const userUID = await AsyncStorage.getItem('UID');
      if (userUID) {
        console.log(userUID);
        setUID(userUID);
      }
    };
    checkforUID();
  }, []);

  const saveChanges = () => {
    if (UID) {
      firestore()
        .collection('users')
        .doc(UID)
        .update({
          displayName: displayName,
          bio: bio,
        })
        .then(() => {
          console.log('User updated!');
        });
    }
    setEditProfile(false);
  };
  return (
    <DismissKeyboard>
      <View style={styles.container}>
        <Text onPress={() => setPostsTrue(false)} style={styles.cancelText}>
          Cancel
        </Text>
        <Text style={styles.editProfileText}>Edit Profile</Text>
        <View style={styles.header} />
        <Circle style={styles.profilePic} width={75} height={75} />
        <View style={styles.userInfoContainer}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>Name</Text>
            <TextInput
              maxLength={10}
              style={styles.nameText}
              multiline
              autoCapitalize="none"
              keyboardType="default"
              placeholder={userProfile.displayName || username._docs[0].id}
              placeholderTextColor={Colors.greyOut}
              onChangeText={text => setDisplayName(text)}
            />
          </View>
          <View style={styles.bioContainer}>
            <Text style={styles.bio}>Bio</Text>
            <TextInput
              maxLength={162}
              style={styles.bioText}
              multiline
              autoCapitalize="none"
              keyboardType="default"
              placeholder={userProfile.bio || 'tell us about yourself'}
              placeholderTextColor={Colors.greyOut}
              onChangeText={text => setBio(text)}
            />
          </View>
        </View>
        <TouchableOpacity onPress={saveChanges} style={styles.saveBtn}>
          <Ionicons
            style={styles.circleClick}
            name="save"
            color="white"
            size={25}
          />
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>
    </DismissKeyboard>
  );
};

export default EditProfileSheet;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1C1C1C',
    position: 'absolute',
    width: '100%',
    height: '91.1%',
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cancelText: {
    color: 'white',
    position: 'absolute',
    marginTop: '6.6%',
    marginLeft: '7%',
  },
  editProfileText: {
    fontFamily: 'Inter-Bold',
    color: 'white',
    alignSelf: 'center',
    marginTop: '5%',
    fontSize: 20,
  },
  header: {
    backgroundColor: 'green',
    width: '100%',
    height: '22%',
    marginTop: '8%',
  },
  profilePic: {
    position: 'absolute',
    marginLeft: '5%',
    marginTop: '33%',
  },
  userInfoContainer: {
    marginLeft: '7%',
    marginTop: '18%',
    height: '45%',
    alignItems: 'flex-start',
  },
  nameContainer: {
    flexDirection: 'row',
  },
  name: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginTop: '1%',
  },
  nameText: {
    color: Colors.greyOut,
    fontFamily: 'Inter-medium',
    fontSize: 15,
    width: '90%',
    marginLeft: '5%',
  },
  bioContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: '6%',
  },
  bio: {
    color: 'white',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginTop: '2.75%',
  },
  bioText: {
    color: Colors.greyOut,
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    width: '70%',
    lineHeight: 24,
    marginLeft: '11%',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.red,
    justifyContent: 'center',
    width: '90%',
    alignSelf: 'center',
    marginTop: 0,
    paddingVertical: 10,
    borderRadius: 9,
  },
  saveText: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    marginLeft: '3%',
    fontSize: 20,
  },
});
