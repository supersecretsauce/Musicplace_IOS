import {StyleSheet, Text, View, TextInput} from 'react-native';
import React, {useRef, useState} from 'react';
import Colors from '../assets/utilities/Colors';
import {useSearchBox} from 'react-instantsearch-hooks';

const SearchBox = props => {
  const {query, refine} = useSearchBox(props);
  const [inputValue, setInputValue] = useState(query);
  const inputRef = useRef(null);

  function setQuery(newQuery) {
    setInputValue(newQuery);
    refine(newQuery);
  }

  if (query !== inputValue && !inputRef.current?.isFocused()) {
    setInputValue(query);
  }

  return (
    <TextInput
      ref={inputRef}
      value={inputValue}
      placeholderTextColor={Colors.greyOut}
      style={styles.textInput}
      onChangeText={setQuery}
      placeholder="find your friends"
      autoCompleteType="off"
      autoCapitalize="none"
    />
  );
};

export default SearchBox;

const styles = StyleSheet.create({
  textInput: {
    marginLeft: '3%',
    width: '90%',
    color: 'white',
  },
});
