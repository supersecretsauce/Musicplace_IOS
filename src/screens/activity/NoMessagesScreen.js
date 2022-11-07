import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Linking,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../assets/utilities/Colors';

const NoMessagesScreen = ({route}) => {
  const {contacts} = route.params;
  const handleInvite = async number => {
    await Linking.openURL(
      `sms:/open?addresses=${number}&body=download the Musicplace App!`,
    );
  };

  async function handleSettings() {
    await Linking.openSettings();
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topContainer}>
        <TouchableOpacity style={styles.backIcon}>
          <Ionicons name={'chevron-back'} color={'white'} size={32} />
        </TouchableOpacity>
        <Text style={styles.activityText}>Messages</Text>
        <TouchableOpacity
          style={styles.backIcon}
          //   onPress={() => navigation.navigate('DirectMessagesScreen')}
        >
          <Ionicons name={'add'} color={'white'} size={32} />
        </TouchableOpacity>
      </View>
      <View style={styles.line} />
      <Text style={styles.noMessages}>
        No messages yet. Follow your friends to get started.
      </Text>
      {contacts ? (
        <>
          <View style={styles.musicplaceContactsContainer}>
            <Text style={styles.musicplaceContacts}>
              Accounts you might know
            </Text>
          </View>
          <View style={styles.contactsContainer}>
            <Text style={styles.inviteText}>Invite friends</Text>
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
                    <TouchableOpacity
                      onPress={() => handleInvite(item.phoneNumbers[0].number)}>
                      <Text style={styles.inviteContactText}>invite</Text>
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
          </View>
        </>
      ) : (
        <View style={styles.accessBtnContainer}>
          <TouchableOpacity onPress={handleSettings} style={styles.accessBtn}>
            <Text style={styles.accessText}>Enable Access to Contacts</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default NoMessagesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  topContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'space-between',
    marginTop: '6%',
    width: '90%',
  },
  activityText: {
    fontFamily: 'Inter-Bold',
    color: 'white',
    fontSize: 18,
    alignSelf: 'center',
  },
  line: {
    borderColor: Colors.darkGrey,
    width: '100%',
    borderWidth: 0.5,
    alignSelf: 'center',
    marginTop: '6%',
  },
  noMessages: {
    color: Colors.greyOut,
    fontFamily: 'Inter-Regular',
    alignSelf: 'center',
    width: '75%',
    textAlign: 'center',
    padding: 10,
    lineHeight: 20,
  },
  musicplaceContactsContainer: {
    marginTop: '5%',
    // backgroundColor: 'red',
    width: '90%',
    flex: 0.5,
    alignSelf: 'center',
  },
  musicplaceContacts: {
    fontFamily: 'Inter-Medium',
    color: 'white',
    fontSize: 14,
  },
  contactsContainer: {
    marginTop: '5%',
    width: '90%',
    flex: 1,
    alignSelf: 'center',
  },

  inviteText: {
    fontFamily: 'Inter-Medium',
    color: 'white',
    fontSize: 14,
    marginBottom: '1%',
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
});
