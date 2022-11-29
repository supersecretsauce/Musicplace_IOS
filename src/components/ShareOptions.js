import {StyleSheet, Text, View, TouchableOpacity, Linking} from 'react-native';
import React from 'react';
import IMessage from '../assets/img/imessage.svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../assets/utilities/Colors';
import {withSpring} from 'react-native-reanimated';
import {SPRING_CONFIG} from '../assets/utilities/reanimated-2';
import branch from 'react-native-branch';

const ShareOptions = props => {
  const {setShowDirectMessages, top, setShowShareSheet, post} = props;
  console.log(post);
  async function sendText() {
    let buo = await branch.createBranchUniversalObject(`post/${post.id}`, {
      title: post.songName,
      contentDescription: post.songName,
      contentImageUrl: post.songPhoto,
    });

    let smsURL = await buo.generateShortUrl();
    console.log(smsURL);
    await Linking.openURL(`sms:&body=${smsURL.url}`);
  }

  return (
    <View style={styles.container}>
      <View style={styles.tab} />
      <Text style={styles.shareText}>Share Song</Text>
      <View style={styles.middleContainer}>
        <View style={styles.iconRow}>
          <TouchableOpacity style={styles.iconContainer} onPress={sendText}>
            <IMessage height={50} width={50} />
            <Text style={styles.iconText}>iMessage</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => setShowDirectMessages(true)}>
            <View style={styles.iconCircle}>
              <Ionicons
                style={styles.iconStyle}
                name={'send'}
                color={'white'}
                size={26}
              />
            </View>
            <Text style={styles.iconText}>direct message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons
                style={styles.iconStyle2}
                name={'link'}
                color={'white'}
                size={30}
              />
            </View>
            <Text style={styles.iconText}>copy link</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ShareOptions;

const styles = StyleSheet.create({
  container: {
    flex: 0.35,
  },
  tab: {
    height: 3,
    width: 50,
    backgroundColor: 'white',
    alignSelf: 'center',
    marginTop: 10,
    borderRadius: 10,
  },
  shareText: {
    fontFamily: 'Inter-Bold',
    fontSize: 15,
    color: 'white',
    alignSelf: 'center',
    marginTop: '2%',
  },
  middleContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingVertical: '5%',
    marginTop: 35,
  },
  iconRow: {
    flexDirection: 'row',
    width: '93%',
    alignSelf: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    alignItems: 'center',
    // backgroundColor: 'green',
    width: 105,
  },
  iconCircle: {
    backgroundColor: Colors.red,
    height: 50,
    width: 50,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconStyle: {
    marginLeft: 3,
  },
  iconStyle2: {},
  iconText: {
    color: 'white',
    fontFamily: 'Inter-Regular',
    marginTop: 10,
  },
});
