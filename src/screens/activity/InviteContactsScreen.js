import {
  StyleSheet,
  Text,
  View,
  Linking,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import React, {useEffect, useState, useContext} from 'react';
import {Context} from '../../context/Context';
import Colors from '../../assets/utilities/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {SPRING_CONFIG} from '../../assets/utilities/reanimated-2';
import functions from '@react-native-firebase/functions';
import HapticFeedback from 'react-native-haptic-feedback';
import Toast from 'react-native-toast-message';
import firestore from '@react-native-firebase/firestore';
import {mixpanel} from '../../../mixpanel';

const InviteContactsScreen = ({route, navigation}) => {
  const {contacts, myPhoneNumber, phoneNumbers, UID} = route.params;
  const {invitesRemaining} = useContext(Context);
  const dimensions = useWindowDimensions();
  const top = useSharedValue(dimensions.height);
  const [contactName, setContactName] = useState(null);
  const [contactNumber, setContactNumber] = useState(null);
  const [myName, setMyName] = useState(null);
  const [time, setTime] = useState(null);

  const style = useAnimatedStyle(() => {
    return {
      top: withSpring(top.value, SPRING_CONFIG),
    };
  });

  useEffect(() => {
    if (myPhoneNumber && phoneNumbers) {
      console.log(phoneNumbers);
      console.log(myPhoneNumber);
      phoneNumbers.forEach(contact => {
        if (
          '+' + contact?.number === myPhoneNumber ||
          '+1' + contact?.number === myPhoneNumber
        ) {
          console.log(contact);
          setMyName(contact.name);
        } else {
          return;
        }
      });
    }
  }, [myPhoneNumber, phoneNumbers]);

  const handleInvite = item => {
    HapticFeedback.trigger('impactLight');

    console.log(item);
    setTime(
      new Date().toLocaleTimeString(navigator.language, {
        hour: '2-digit',
        minute: '2-digit',
      }),
    );
    setContactName(item.name);
    setContactNumber(item.phoneNumbers[0].number);
    top.value = withSpring(0, SPRING_CONFIG);
  };

  function handleSend() {
    mixpanel.track('Invite');
    HapticFeedback.trigger('impactHeavy');
    if (invitesRemaining === 0) {
      Toast.show({
        type: 'error',
        text1: `You have no invites left`,
        visibilityTime: 2000,
      });
      return;
    }
    firestore()
      .collection('users')
      .doc(UID)
      .update({
        invitesRemaining: invitesRemaining - 1,
      });
    // firestore().collection("invites").doc()
    Toast.show({
      type: 'success',
      text1: `Sent an invite to ${contactName}`,
      visibilityTime: 2000,
    });
    if (myName) {
      functions()
        .httpsCallable('inviteContact')({
          name: myName,
          number: contactNumber,
        })
        .then(resp => console.log(resp))
        .catch(e => console.log(e));
    } else {
      functions()
        .httpsCallable('inviteContact')({
          name: myName,
          number: contactNumber,
          myPhoneNumber: myPhoneNumber,
        })
        .then(resp => console.log(resp))
        .catch(e => console.log(e));
    }
  }

  async function handleSettings() {
    await Linking.openSettings();
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.activityContainer}>
        <TouchableOpacity
          style={styles.createIcon}
          onPress={() => {
            navigation.goBack();
          }}>
          <Ionicons name={'chevron-back'} color={'white'} size={32} />
        </TouchableOpacity>
        <Text style={styles.activityText}>Invite</Text>
      </View>
      <View style={styles.line} />
      {contacts ? (
        <View style={styles.contactsContainer}>
          <Text style={styles.inviteText}>
            {invitesRemaining} invites remaining
          </Text>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={contacts}
            renderItem={({item, index}) => {
              return (
                <View key={index} style={styles.localContactContainer}>
                  <View style={styles.contactLeft}>
                    {item.imageAvailable ? (
                      <Image
                        style={styles.localUserImage}
                        source={{
                          uri: item?.image?.uri,
                        }}
                      />
                    ) : (
                      <View style={styles.defaultImage}>
                        {typeof item.firstName === 'string' ? (
                          <Text style={styles.defaultName}>
                            {item?.firstName?.slice(0, 1)}
                          </Text>
                        ) : (
                          <></>
                        )}
                      </View>
                    )}
                    <View style={styles.contactMiddle}>
                      <Text numberOfLines={1} style={styles.localFirstName}>
                        {item?.firstName}
                      </Text>
                      <Text numberOfLines={1} style={styles.localLastName}>
                        {item?.lastName}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleInvite(item)}>
                    <Text style={styles.inviteContactText}>invite</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        </View>
      ) : (
        <>
          <View style={styles.accessBtnContainer}>
            <TouchableOpacity onPress={handleSettings} style={styles.accessBtn}>
              <Text style={styles.accessText}>Enable Access to Contacts</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
      <Animated.View
        onTouchEnd={() => (top.value = withSpring(1000, SPRING_CONFIG))}
        style={[
          // eslint-disable-next-line react-native/no-inline-styles
          {
            position: 'absolute',
            backgroundColor: 'rgba(52, 52, 52, 0)',
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            alignSelf: 'center',
            justifyContent: 'center',
          },
          style,
        ]}>
        <View style={styles.modal}>
          <View style={styles.inviteTextContainer}>
            <Text style={styles.sendInviteText}>
              You're about to send an invite to
            </Text>
            <Text style={styles.contactName}>{contactName}</Text>
            <Text style={styles.contactNumber}>@ {contactNumber}</Text>
          </View>
          <View style={styles.previewContainer}>
            <Text style={styles.time}>Today {time}</Text>
            <View style={styles.previewBubble}>
              <Text style={styles.textPreview}>
                {myName ? myName : myPhoneNumber} invited you to join
                Musicplace. Your number is now eligible! Download the app{' '}
                <Text style={{textDecorationLine: 'underline'}}>here</Text>
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.inviteButton} onPress={handleSend}>
            <Text style={styles.inviteButtonText}>Invite</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default InviteContactsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  activityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: '6%',
  },
  activityText: {
    fontFamily: 'Inter-Bold',
    color: 'white',
    fontSize: 18,
    alignSelf: 'center',
  },
  createIcon: {
    position: 'absolute',
    right: 175,
  },
  line: {
    borderColor: Colors.darkGrey,
    width: '100%',
    borderWidth: 0.5,
    alignSelf: 'center',
    marginTop: '6%',
  },
  contactsContainer: {
    // marginTop: '5%',
    width: '90%',
    flex: 1,
    alignSelf: 'center',
  },
  inviteText: {
    fontFamily: 'Inter-Medium',
    color: 'white',
    fontSize: 14,
    paddingVertical: 16,
  },
  localContactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    justifyContent: 'space-between',
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  localUserImage: {
    height: 40,
    width: 40,
    borderRadius: 40,
  },
  defaultImage: {
    height: 40,
    width: 40,
    borderRadius: 40,
    backgroundColor: 'grey',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  defaultName: {
    fontFamily: 'Inter-Bold',
    color: 'white',
    fontSize: 14,
  },
  contactMiddle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: '8%',
  },
  localFirstName: {
    color: 'white',
    fontFamily: 'Inter-SemiBold',
    maxWidth: 200,
  },
  localLastName: {
    color: 'white',
    fontFamily: 'Inter-SemiBold',
    marginLeft: '6%',
    maxWidth: 100,
  },
  inviteContactText: {
    color: Colors.greyOut,
    fontFamily: 'Inter-Regular',
  },
  accessBtnContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  accessBtn: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#1F1F1F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  accessText: {
    alignSelf: 'center',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    lineHeight: 30,
    color: 'white',
    textAlign: 'center',
  },
  modal: {
    backgroundColor: '#1F1F1F',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    // height: '40%',
    paddingVertical: 40,
    width: '85%',
    borderRadius: 20,
  },
  inviteTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendInviteText: {
    color: 'white',
    fontFamily: 'Inter-Medium',
  },
  contactName: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    marginTop: '2%',
  },
  contactNumber: {
    color: Colors.greyOut,
    fontSize: 12,
    marginTop: '2%',
  },
  previewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '8%',
  },
  time: {
    color: Colors.greyOut,
    fontSize: 12,
  },
  previewBubble: {
    padding: 10,
    backgroundColor: '#3E3E3E',
    width: 240,
    borderRadius: 16,
    borderBottomLeftRadius: 2,
    marginTop: '3%',
  },
  textPreview: {
    color: 'white',
    fontSize: 13,
  },
  inviteButton: {
    backgroundColor: Colors.red,
    marginTop: '10%',
    paddingHorizontal: 75,
    paddingVertical: 10,
    borderRadius: 16,
  },
  inviteButtonText: {
    color: 'white',
    fontFamily: 'Inter-Bold',
  },
});
