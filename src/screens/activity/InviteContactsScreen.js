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
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../assets/utilities/Colors';

const InviteContactsScreen = ({route}) => {
  const {contacts} = route.params;

  const handleInvite = async number => {
    await Linking.openURL(
      `sms:/open?addresses=${number}&body=download the Musicplace App!`,
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contactsContainer}>
        <Text style={styles.inviteText}>Invite friends</Text>
        {contacts ? (
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
        ) : (
          <></>
        )}
      </View>
    </SafeAreaView>
  );
};

export default InviteContactsScreen;

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
});
