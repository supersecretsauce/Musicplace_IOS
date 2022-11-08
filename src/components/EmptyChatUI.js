import {StyleSheet, Text, View, Image} from 'react-native';
import React from 'react';
import Colors from '../assets/utilities/Colors';

const EmptyChatUI = props => {
  const {userProfile} = props;
  return (
    <View>
      {userProfile ? (
        <View style={styles.emptyChatContainer}>
          {userProfile.pfpURL ? (
            <Image
              style={styles.emptyChatPFP}
              source={{
                uri: userProfile.pfpURL,
              }}
            />
          ) : (
            <View style={styles.emptyChatPFP} />
          )}
          <Text style={styles.displayName}>{userProfile?.displayName}</Text>
          <Text style={styles.handle}>@{userProfile.handle}</Text>
          <View style={styles.statsContainer}>
            <Text style={styles.following}>
              {userProfile.following} following
            </Text>
            <Text style={styles.followers}>
              {userProfile.followers} followers
            </Text>
          </View>
        </View>
      ) : (
        <></>
      )}
    </View>
  );
};

export default EmptyChatUI;

const styles = StyleSheet.create({
  emptyChatContainer: {
    width: '100%',
    alignItems: 'center',
    // backgroundColor: 'grey',
    marginTop: '5%',
  },
  emptyChatPFP: {
    height: 70,
    width: 70,
    borderRadius: 70,
    backgroundColor: Colors.red,
  },
  displayName: {
    marginTop: '3%',
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
  handle: {
    marginTop: '2%',
    color: Colors.greyOut,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: '2%',
    // backgroundColor: 'red',
    width: 150,
    textAlign: 'center',
    justifyContent: 'space-between',
  },
  following: {
    color: Colors.greyOut,
    fontFamily: 'Inter-Regular',
  },
  followers: {
    color: Colors.greyOut,
    fontFamily: 'Inter-Regular',
  },
});
