import {
  StyleSheet,
  Text,
  View,
  Linking,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import React from 'react';
import Colors from '../../assets/utilities/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

const InviteContactsScreen = ({route, navigation}) => {
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
      <View style={styles.activityContainer}>
        <TouchableOpacity
          style={styles.createIcon}
          onPress={() => {
            navigation.navigate('ActivityScreen');
          }}>
          <Ionicons name={'chevron-back'} color={'white'} size={32} />
        </TouchableOpacity>
        <Text style={styles.activityText}>Invite</Text>
      </View>
      <View style={styles.line} />
      {contacts ? (
        <View style={styles.contactsContainer}>
          <Text style={styles.inviteText}>My contacts</Text>
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
      ) : (
        <>
          <View style={styles.accessBtnContainer}>
            <TouchableOpacity onPress={handleSettings} style={styles.accessBtn}>
              <Text style={styles.accessText}>Enable Access to Contacts</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
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
});
