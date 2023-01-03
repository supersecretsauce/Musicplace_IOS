import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../assets/utilities/Colors';
import algoliasearch from 'algoliasearch/lite';
import {InstantSearch} from 'react-instantsearch-hooks';
import SearchBox from '../../components/SearchBox';
import InfiniteHits from '../../components/InfiniteHits';

const AddFriends = ({navigation, route}) => {
  const {myUser, prevRoute} = route.params;
  const searchClient = algoliasearch(
    'SXGPXOYWWU',
    '292341a627acc8ce15aad830431be5ef',
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topContainer}>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => navigation.goBack()}>
          <Ionicons name={'chevron-back'} color={'white'} size={32} />
        </TouchableOpacity>
        <Text style={styles.addHeader}>Add Friends</Text>
      </View>
      <InstantSearch
        searchClient={searchClient}
        indexName="search-user-collection">
        <View style={styles.searchOutline}>
          <Ionicons name={'search'} color={Colors.greyOut} size={20} />
          <SearchBox />
        </View>
        <InfiniteHits
          prevRoute={prevRoute}
          myUser={myUser}
          navigation={navigation}
        />
      </InstantSearch>
    </SafeAreaView>
  );
};

export default AddFriends;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    flex: 1,
  },
  topContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: '6%',
  },
  backIcon: {
    position: 'absolute',
    right: 205,
  },
  addHeader: {
    fontFamily: 'Inter-Bold',
    color: 'white',
    fontSize: 18,
    alignSelf: 'center',
  },
  searchOutline: {
    marginTop: '5%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    alignSelf: 'center',
    backgroundColor: Colors.darkGrey,
    paddingVertical: 10,
    paddingLeft: '5%',
    width: '90%',
    borderRadius: 6,
    marginBottom: 20,
  },
});
