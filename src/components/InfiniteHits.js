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
  const {navigation} = props;
  const {UID} = useContext(Context);

  useEffect(() => {
    console.log(hits);
  }, [hits]);

  function handleNav(item) {
    console.log(item);
    navigation.navigate('ViewUserScreen', {
      profileID: item.objectID,
      UID: UID,
      prevRoute: 'search',
    });
  }
  return (
    <FlatList
      data={hits}
      onEndReached={() => {
        if (!isLastPage) {
          showMore();
        }
      }}
      renderItem={({item}) => (
        <TouchableOpacity onPress={() => handleNav(item)} style={styles.item}>
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
              <Text style={styles.handle}>{item.handle}</Text>
              <Text style={styles.displayName}>{item.displayName}</Text>
            </View>
          </View>
          <Ionicons
            style={styles.socialIcon}
            name={'chevron-forward'}
            color={'grey'}
            size={16}
          />
        </TouchableOpacity>
      )}
    />
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
    marginLeft: 5,
  },
  displayName: {
    color: Colors.greyOut,
    fontSize: 11,
    fontFamily: 'Inter-Regular',
  },
  handle: {
    fontSize: 13,
    color: 'white',
    fontFamily: 'Inter-SemiBold',
  },
});
