import {StyleSheet, Text, View, SafeAreaView, Image} from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Circle from '../../assets/img/circle.svg';
import Colors from '../../assets/utilities/Colors';
const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          style={styles.menuIcon}
          name={'menu'}
          color={'white'}
          size={36}
        />
      </View>
      <Circle style={styles.profilePic} width={75} height={75} />
      <View style={styles.profileLeft}>
        <Text style={styles.name}>Maxwell</Text>
        <Text style={styles.handle}>@maxmandia</Text>
        <Text style={styles.bio}>
          Co-founder @ musicplace and the world's largest micropenis{' '}
        </Text>
      </View>
      <View style={styles.socialStatsContainer}>
        <View style={styles.followersContainer}>
          <Text style={styles.number}>333</Text>
          <Text style={styles.numberText}>Followers</Text>
        </View>
        <View style={styles.followingContainer}>
          <Text style={styles.number}>333</Text>
          <Text style={styles.numberText}>Following</Text>
        </View>
        <View style={styles.likesContainer}>
          <Text style={styles.likeNumber}>333</Text>
          <Text style={styles.numberText}>Likes</Text>
        </View>
      </View>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    backgroundColor: 'green',
    width: '100%',
    height: '22%',
  },
  menuIcon: {
    marginLeft: '85%',
    marginTop: '15%',
  },
  profilePic: {
    position: 'absolute',
    marginLeft: '5%',
    marginTop: '24%',
  },
  profileLeft: {
    marginLeft: '6%',
    marginTop: '14%',
  },
  name: {
    fontFamily: 'Inter-Bold',
    color: 'white',
    fontSize: 18,
  },
  handle: {
    fontFamily: 'Inter-Regular',
    color: Colors.greyOut,
    fontSize: 16,
    marginTop: '1%',
  },
  bio: {
    fontFamily: 'Inter-Regular',
    color: 'white',
    fontSize: 14,
    marginTop: '3%',
    lineHeight: 20,
  },
  socialStatsContainer: {
    position: 'absolute',
    marginLeft: '42%',
    marginTop: '48%',
    flexDirection: 'row',
  },
  number: {
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    fontSize: 16,
  },
  likeNumber: {
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    fontSize: 16,
    marginBottom: '11%',
  },
  numberText: {
    fontFamily: 'Inter-SemiBold',
    color: Colors.greyOut,
    fontSize: 12,
    marginTop: '10%',
  },
  followersContainer: {
    alignItems: 'center',
  },
  followingContainer: {
    marginLeft: '13%',
    alignItems: 'center',
  },
  likesContainer: {
    marginLeft: '13%',
    alignItems: 'center',
  },
});
