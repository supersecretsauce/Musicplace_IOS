import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect} from 'react';
import Colors from '../../assets/utilities/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ActivityScreen = () => {
  const defaultActivityText = [
    {
      top: 'No Activity Yet',
      bottom: 'Get started by posting a song.',
    },
  ];
  const defaultMessageText = [
    {
      top: 'Add Friends',
      bottom: 'Get started by adding your friends.',
    },
  ];
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.activityContainer}>
        <Text style={styles.activityText}>Activity</Text>
        <Ionicons
          style={styles.createIcon}
          name={'create-outline'}
          color={'white'}
          size={32}
        />
      </View>
      <View style={styles.line} />
      <View style={styles.newActivityContainer}>
        <Text style={styles.newActivity}>New Activity</Text>
        <View style={styles.activityFlatListContainer}>
          <FlatList
            data={defaultActivityText}
            renderItem={({item, index}) => {
              return (
                <TouchableOpacity key={index} style={styles.itemContainer}>
                  <View style={styles.itemLeft}>
                    <View style={styles.musicplaceLogo} />
                    <View style={styles.itemMiddle}>
                      <Text style={styles.topText}>{item.top}</Text>
                      <Text style={styles.bottomText}>{item.bottom}</Text>
                    </View>
                  </View>
                  <View>
                    <Ionicons
                      name={'chevron-forward'}
                      color={'white'}
                      size={20}
                    />
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
      <View style={styles.messagesContainer}>
        <Text style={styles.messagesText}>Messages</Text>
        <View style={styles.messagesFlatListContainer}>
          <FlatList
            data={defaultMessageText}
            renderItem={({item, index}) => {
              return (
                <TouchableOpacity key={index} style={styles.itemContainer}>
                  <View style={styles.itemLeft}>
                    <View style={styles.musicplaceLogo} />
                    <View style={styles.itemMiddle}>
                      <Text style={styles.topText}>{item.top}</Text>
                      <Text style={styles.bottomText}>{item.bottom}</Text>
                    </View>
                  </View>
                  <View>
                    <Ionicons
                      name={'chevron-forward'}
                      color={'white'}
                      size={20}
                    />
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ActivityScreen;

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
    marginLeft: 175,
  },
  line: {
    borderColor: Colors.darkGrey,
    width: '100%',
    borderWidth: 0.5,
    alignSelf: 'center',
    marginTop: '6%',
  },
  newActivityContainer: {
    width: '90%',
    height: 185,
    alignSelf: 'center',
    marginVertical: '7%',
    // backgroundColor: 'red',
  },
  newActivity: {
    fontFamily: 'Inter-Medium',
    color: 'white',
    fontSize: 18,
  },
  activityFlatListContainer: {
    // backgroundColor: 'grey',
    height: 185,
    marginTop: '3%',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  musicplaceLogo: {
    height: 40,
    width: 40,
    borderRadius: 40,
    backgroundColor: Colors.red,
  },
  itemMiddle: {
    marginLeft: 10,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  topText: {
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    fontSize: 14,
    paddingVertical: 2,
  },
  bottomText: {
    fontFamily: 'Inter-Regular',
    color: 'white',
    fontSize: 11,
    paddingVertical: 2,
  },

  //messages
  messagesContainer: {
    width: '90%',
    flex: 1,
    alignSelf: 'center',
    marginTop: '3%',
  },
  messagesText: {
    fontFamily: 'Inter-Medium',
    color: 'white',
    fontSize: 18,
  },
  messagesFlatListContainer: {
    // backgroundColor: 'grey',
    flex: 1,
    marginTop: '3%',
  },
});
