import {StyleSheet, Text, View, FlatList} from 'react-native';
import React, {useEffect} from 'react';
import {useInfiniteHits} from 'react-instantsearch-hooks';

const InfiniteHits = ({...props}) => {
  const {hits, isLastPage, showMore} = useInfiniteHits(props);

  useEffect(() => {
    console.log(hits);
  }, [hits]);
  return (
    <FlatList
      data={hits}
      onEndReached={() => {
        if (!isLastPage) {
          showMore();
        }
      }}
      renderItem={({item}) => (
        <View style={styles.item}>
          <Text style={{color: 'white'}}>{item.displayName}</Text>
        </View>
      )}
    />
  );
};

export default InfiniteHits;

const styles = StyleSheet.create({});
