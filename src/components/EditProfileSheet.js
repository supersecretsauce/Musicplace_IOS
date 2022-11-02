import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import storage from '@react-native-firebase/storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../assets/utilities/Colors';
import ImagePicker from 'react-native-image-crop-picker';
import firestore from '@react-native-firebase/firestore';
import {SPRING_CONFIG} from '../assets/utilities/reanimated-2';
import Animated, {
  useAnimatedGestureHandler,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const EditProfileSheet = props => {
  const {
    UID,
    top2,
    setPFP,
    PFP,
    header,
    setHeader,
    setDisplayName,
    displayName,
    bio,
    setBio,
  } = props;
  const [userSelectedPFP, setUserSelectedPFP] = useState(false);
  const [userSelectedHeader, setUserSelectedHeader] = useState(false);
  const dimensions = useWindowDimensions();

  const getHeaderAndPFP = async () => {
    const headerURL = await storage()
      .ref(UID + 'HEADER')
      .getDownloadURL()
      .catch(error => {
        console.log(error);
      });
    const PFPURL = await storage()
      .ref(UID + 'PFP')
      .getDownloadURL()
      .catch(error => {
        console.log(error);
      });
    setPFP(PFPURL);
    setHeader(headerURL);
  };

  useEffect(() => {
    getHeaderAndPFP();
  }, []);

  const selectPFP = () => {
    ImagePicker.openPicker({
      width: 2000,
      height: 2000,
      cropping: true,
      cropperCircleOverlay: true,
      avoidEmptySpaceAroundImage: true,
      mediaType: 'photo',
    })
      .then(image => {
        console.log(image);
        setPFP(image.path);
        setUserSelectedPFP(true);
      })
      .catch(error => {
        console.log(error);
      });
  };

  const selectHeader = () => {
    ImagePicker.openPicker({
      width: 2000,
      height: 2000,
      avoidEmptySpaceAroundImage: true,
      mediaType: 'photo',
    })
      .then(image => {
        setHeader(image.path);
        setUserSelectedHeader(true);
      })
      .catch(error => {
        console.log(error);
      });
  };

  const saveChanges = () => {
    top2.value = withSpring(dimensions.height, SPRING_CONFIG);

    firestore()
      .collection('users')
      .doc(UID)
      .update({
        displayName: displayName,
        bio: bio,
      })
      .then(() => {
        console.log('User updated!');
      })
      .catch(e => console.log(e));
    if (PFP && userSelectedPFP) {
      console.log('trying PFP');
      const reference = storage().ref(UID + 'PFP');
      const task = reference.putFile(PFP);
      task.on('state_changed', taskSnapshot => {
        console.log(
          `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`,
        );
      });
    }
    if (header && userSelectedHeader) {
      console.log(header);
      console.log('trying header');
      const reference = storage().ref(UID + 'HEADER');
      const task = reference.putFile(header);
      task.on('state_changed', taskSnapshot => {
        console.log(
          `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`,
        );
      });
    }
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() =>
            (top2.value = withSpring(dimensions.height, SPRING_CONFIG))
          }>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.editText}>Edit Profile</Text>
        <View style={styles.headerContainer}>
          {header ? (
            <Image style={styles.header} source={{uri: header}} />
          ) : (
            <View style={styles.header} />
          )}
        </View>
        <TouchableOpacity onPress={selectHeader} style={styles.addHeaderIcon}>
          <Ionicons name={'add-circle'} color={'white'} size={36} />
        </TouchableOpacity>
        {PFP ? (
          <View style={styles.PFPContainer}>
            <Image
              resizeMode="contain"
              style={styles.PFP}
              source={{
                uri: PFP,
              }}
            />
          </View>
        ) : (
          <View style={styles.PFPContainer}>
            <View style={styles.defaultPFP} />
          </View>
        )}
        <TouchableOpacity onPress={selectPFP} style={styles.addPFPIcon}>
          <Ionicons name={'add-circle'} color={'white'} size={28} />
        </TouchableOpacity>
        <View style={styles.userInfoContainer}>
          <View style={styles.nameContainer}>
            <Text style={styles.nameText}>Name:</Text>
            <TextInput
              maxLength={14}
              style={styles.nameInput}
              placeholder={displayName ? displayName : 'add name'}
              placeholderTextColor={'grey'}
              onChangeText={text => setDisplayName(text)}
            />
          </View>
          <View style={styles.bioContainer}>
            <Text style={styles.bioText}>Bio:</Text>
            <TextInput
              maxLength={90}
              style={styles.input}
              placeholder={bio ? bio : 'add bio'}
              placeholderTextColor={'grey'}
              onChangeText={text => setBio(text)}
            />
          </View>
        </View>
        <TouchableOpacity onPress={saveChanges} style={styles.saveBtn}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default EditProfileSheet;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    height: '100%',
    // position: 'absolute',
  },
  cancelText: {
    fontFamily: 'Inter-Medium',
    color: 'white',
    position: 'absolute',
    left: '7%',
    marginTop: '6.5%',
    fontSize: 14,
  },
  editText: {
    fontFamily: 'Inter-Bold',
    color: 'white',
    alignSelf: 'center',
    marginTop: '5%',
    fontSize: 20,
  },
  header: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 8, 0, .25)',
    width: '100%',
    height: 150,
    top: 20,
  },
  addHeaderIcon: {
    position: 'absolute',
    right: '6%',
    top: 195,
  },
  PFPContainer: {
    position: 'absolute',
    left: '7%',
    top: 165,
  },
  PFP: {
    height: 90,
    width: 90,
    borderRadius: 90,
  },
  defaultPFP: {
    height: 90,
    width: 90,
    borderRadius: 90,
    backgroundColor: Colors.red,
  },
  addPFPIcon: {
    position: 'absolute',
    left: '24%',
    top: 230,
  },
  userInfoContainer: {
    position: 'absolute',
    paddingLeft: '8%',
    top: 280,
    height: '100%',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 17,
    marginLeft: '5%',
    width: 55,
  },
  nameInput: {
    marginLeft: '8%',
    color: 'white',
    width: 150,
  },
  bioContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: '10%',
  },
  bioText: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 17,
    marginLeft: '5%',
    width: 55,
  },
  input: {
    marginLeft: '8%',
    color: 'white',
    width: 150,
  },
  saveBtn: {
    position: 'absolute',
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.red,
    paddingVertical: 10,
    paddingHorizontal: 80,
    borderRadius: 30,
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    top: '88%',
  },
  saveText: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    marginLeft: '10%',
    fontSize: 20,
  },
});
