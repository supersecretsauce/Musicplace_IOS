import {StyleSheet, Text, View, Image, SafeAreaView} from 'react-native';
import React from 'react';

const SpotifyPlaylists = props => {
  let playlists = props.playlists;
  console.log(playlists);
  return (
    <View>
      {playlists ? (
        <>
          <View>
            <Image
              style={{width: '100%', height: '50%'}}
              source={{
                uri: 'https://mosaic.scdn.co/640/ab67616d0000b273181e905ea4012cd983f48999ab67616d0000b27390b4e1905b1fc48c537ec053ab67616d0000b273a315941eabf04d7e3a82a7d5ab67616d0000b273d93501aba7bc1140aac628c6',
              }}
            />
          </View>
        </>
      ) : null}
    </View>
  );
};

export default SpotifyPlaylists;

const styles = StyleSheet.create({
  text: {
    color: 'green',
  },
  test: {
    color: 'white',
  },
});
