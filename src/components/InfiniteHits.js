import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useContext} from 'react';
import {useInfiniteHits} from 'react-instantsearch-hooks';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../assets/utilities/Colors';
import {Context} from '../context/Context';
const InfiniteHits = ({...props}) => {
  const {hits, isLastPage, showMore} = useInfiniteHits(props);
  const {navigation, myUser} = props;
  const {UID} = useContext(Context);

  useEffect(() => {
    if (UID) {
      console.log(UID);
    }
  }, [UID]);

  function handleNav(item) {
    console.log(item);
    navigation.navigate('ViewUserScreen', {
      profileID: item.objectID,
      UID: UID,
      myUser: myUser,
      prevRoute: 'search',
    });
  }
  return (
    <>
      {UID ? (
        <FlatList
          data={hits}
          onEndReached={() => {
            if (!isLastPage) {
              showMore();
            }
          }}
          renderItem={({item}) => (
            <>
              {item.objectID === UID ? (
                <></>
              ) : (
                <TouchableOpacity
                  onPress={() => handleNav(item)}
                  style={styles.item}>
                  <View style={styles.itemLeft}>
                    {item.pfpURL ? (
                      <Image
                        style={styles.pfp}
                        source={{
                          uri: item.pfpURL,
                        }}
                      />
                    ) : (
                      <View style={styles.pfp} />
                    )}
                    <View style={styles.itemMiddle}>
                      <Text style={styles.displayName}>{item.displayName}</Text>
                      <Text style={styles.handle}>@{item.handle}</Text>
                    </View>
                  </View>
                  <Ionicons
                    style={styles.socialIcon}
                    name={'chevron-forward'}
                    color={'white'}
                    size={20}
                  />
                </TouchableOpacity>
              )}
            </>
          )}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default InfiniteHits;

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    alignSelf: 'center',
    paddingVertical: 10,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pfp: {
    backgroundColor: Colors.red,
    width: 40,
    height: 40,
    borderRadius: 40,
  },
  itemMiddle: {
    marginLeft: 10,
  },
  displayName: {
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    fontSize: 14,
  },
  handle: {
    color: 'white',
    fontSize: 11,
    marginTop: 5,
    fontFamily: 'Inter-Regular',
  },
});
