import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Image,
  TextInput,
  Switch,
  Keyboard,
} from 'react-native';
import React, {useEffect, useState, useMemo} from 'react';
import Colors from '../../assets/utilities/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Sound from 'react-native-sound';
import firestore from '@react-native-firebase/firestore';

const DismissKeyboard = ({children}) => (
  <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    {children}
  </TouchableWithoutFeedback>
);

const CompletePostScreen = ({route, navigation}) => {
  const {song, songPhoto, albumName} = route.params;
  const [songIMG, setSongIMG] = useState();
  const [value] = useState(false);
  const [trackPlaying, setTrackPlaying] = useState(false);
  const [caption, setCaption] = useState();

  useEffect(() => {
    if (songPhoto) {
      setSongIMG(songPhoto);
    }
  }, [songPhoto]);

  const track = useMemo(
    () => new Sound(song.preview_url, null),
    [song.preview_url],
  );

  const playPreview = () => {
    if (trackPlaying === false) {
      track.play(success => {
        if (success) {
          console.log('done');
          setTrackPlaying(false);
        } else {
          console.log('playback failed due to audio decoding errors');
        }
      });
      setTrackPlaying(true);
    } else {
      track.pause();
      setTrackPlaying(false);
    }
  };

  const handleCaption = text => {
    setCaption(text);
  };

  const postSong = async () => {
    if (songPhoto) {
      try {
        await firestore()
          .collection('posts')
          .doc(song.id)
          .set({
            songName: song.name,
            caption: caption,
            albumName: albumName,
            artistName: song.artists.map(artist => artist.name),
            artistID: song.artists.map(artist => artist.id),
            availableMarkets: song.available_markets,
            previewURL: song.preview_url,
            isExplicit: song.explicit,
            durationInMs: song.duration_ms,
            href: song.href,
            trackNumber: song.track_number,
            songPhoto: songPhoto,
          })
          .then(() => {
            console.log('song added!');
          });
      } catch (error) {
        console.log(error);
        return;
      }
    } else {
      try {
        await firestore()
          .collection('posts')
          .doc(song.id)
          .set({
            songName: song.name,
            caption: caption,
            albumName: song.album.name,
            artistName: song.artists.map(artist => artist.name),
            artistID: song.artists.map(artist => artist.id),
            availableMarkets: song.available_markets,
            popularity: song.popularity,
            previewURL: song.preview_url,
            isExplicit: song.explicit,
            durationInMs: song.duration_ms,
            href: song.href,
            trackNumber: song.track_number,
            songPhoto: song.album.images[0],
          })
          .then(() => {
            console.log('song added!');
          });
      } catch (error) {
        console.log(error);
        return;
      }
    }
  };

  return (
    <>
      {songPhoto ? (
        <>
          <DismissKeyboard>
            <View style={styles.container}>
              <View style={styles.postContainer}>
                <View style={styles.topContainer}>
                  <Ionicons
                    onPress={() => {
                      track.pause();
                      navigation.navigate('PostASongScreen');
                    }}
                    style={styles.chevron}
                    name="chevron-back"
                    color="white"
                    size={50}
                  />
                  <Text style={styles.post}>Post</Text>
                </View>
              </View>
              <View style={styles.trackContainer}>
                <Image
                  style={styles.songIMG}
                  source={{
                    uri: songIMG,
                  }}
                />
                <View style={styles.songInfoContainer}>
                  <Text numberOfLines={1} style={styles.songName}>
                    {song.name}
                  </Text>
                  <View numberOfLines={1} style={styles.artistContainer}>
                    <Text style={styles.byText}>by </Text>
                    <Text numberOfLines={1} style={styles.artists}>
                      {song.artists.map(artist => artist.name).join(', ')}
                    </Text>
                  </View>
                  <View numberOfLines={1} style={styles.albumContainer}>
                    <Text style={styles.byText}>from </Text>
                    <Text numberOfLines={1} style={styles.albumName}>
                      {albumName}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.previewBtn}
                    onPress={playPreview}>
                    <Ionicons
                      // style={styles.chevron}
                      name="play-circle"
                      color="white"
                      size={18}
                    />
                    <Text style={styles.previewText}>Preview</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.captionContainer}>
                <TextInput
                  // eslint-disable-next-line react-native/no-inline-styles
                  style={{
                    fontFamily: 'Inter-Regular',
                    fontSize: value ? 16 : 16,
                    color: value ? 'white' : 'white',
                  }}
                  maxLength={162}
                  multiline
                  autoCapitalize="none"
                  keyboardType="default"
                  placeholder="Caption ideas include things like: where you were you first heard this song, the people you play this with...idk that's all we got. "
                  placeholderTextColor="grey"
                  value={value}
                  onChangeText={text => handleCaption(text)}
                />
              </View>
              <View style={styles.shareToContainer}>
                <Text style={styles.shareTo}>Automatically share to</Text>
                <View style={styles.socialRowContainer}>
                  <View style={styles.socialLeftContainer}>
                    <Ionicons
                      style={styles.socialIcon}
                      name="chatbubble"
                      color="#53D769"
                      size={24}
                    />
                    <Text style={styles.socials}>iMessage</Text>
                  </View>
                  <Switch style={{transform: [{scaleX: 0.8}, {scaleY: 0.8}]}} />
                </View>
                <View style={styles.socialRowContainer}>
                  <View style={styles.socialLeftContainer}>
                    <Ionicons
                      style={styles.socialIcon}
                      name="logo-twitter"
                      color="#1D9BF0"
                      size={24}
                    />
                    <Text style={styles.socials}>Twitter</Text>
                  </View>
                  <Switch style={{transform: [{scaleX: 0.8}, {scaleY: 0.8}]}} />
                </View>
                <View style={styles.socialRowContainer}>
                  <View style={styles.socialLeftContainer}>
                    <Ionicons
                      style={styles.socialIcon}
                      name="logo-snapchat"
                      color="#FFFC00"
                      size={24}
                    />
                    <Text style={styles.socials}>Snapchat</Text>
                  </View>
                  <Switch style={{transform: [{scaleX: 0.8}, {scaleY: 0.8}]}} />
                </View>
                <TouchableOpacity onPress={postSong} style={styles.postBtn}>
                  <Ionicons name="earth" color="white" size={24} />
                  <Text style={styles.postBtnText}>Post</Text>
                </TouchableOpacity>
              </View>
            </View>
          </DismissKeyboard>
        </>
      ) : (
        <DismissKeyboard>
          <View style={styles.container}>
            <View style={styles.postContainer}>
              <View style={styles.topContainer}>
                <Ionicons
                  onPress={() => {
                    navigation.navigate('PostASongScreen');
                    track.pause();
                  }}
                  style={styles.chevron}
                  name="chevron-back"
                  color="white"
                  size={50}
                />
                <Text style={styles.post}>Post</Text>
              </View>
            </View>
            <View style={styles.trackContainer}>
              <Image
                style={styles.songIMG}
                source={{
                  uri: song.album.images[0].url,
                }}
              />
              <View style={styles.songInfoContainer}>
                <Text numberOfLines={1} style={styles.songName}>
                  {song.name}
                </Text>
                <View numberOfLines={1} style={styles.artistContainer}>
                  <Text style={styles.byText}>by </Text>
                  <Text numberOfLines={1} style={styles.artists}>
                    {song.artists.map(artist => artist.name).join(', ')}
                  </Text>
                </View>
                <View numberOfLines={1} style={styles.albumContainer}>
                  <Text style={styles.byText}>from </Text>
                  <Text numberOfLines={1} style={styles.albumName}>
                    {song.album.name}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={playPreview}
                  style={styles.previewBtn}>
                  <Ionicons
                    // style={styles.chevron}
                    name="play-circle"
                    color="white"
                    size={18}
                  />
                  <Text style={styles.previewText}>Preview</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.captionContainer}>
              <TextInput
                // eslint-disable-next-line react-native/no-inline-styles
                style={{
                  fontFamily: 'Inter-Regular',
                  fontSize: value ? 16 : 16,
                  color: value ? 'white' : 'white',
                }}
                maxLength={162}
                multiline
                autoCapitalize="none"
                keyboardType="default"
                placeholder="Caption ideas include things like: where you were you first heard this song, the people you play this with...idk that's all we got. "
                placeholderTextColor="grey"
                value={value}
                onChangeText={text => handleCaption(text)}
              />
            </View>
            <View style={styles.shareToContainer}>
              <Text style={styles.shareTo}>Automatically share to</Text>
              <View style={styles.socialRowContainer}>
                <View style={styles.socialLeftContainer}>
                  <Ionicons
                    style={styles.socialIcon}
                    name="chatbubble"
                    color="#53D769"
                    size={24}
                  />
                  <Text style={styles.socials}>iMessage</Text>
                </View>
                <Switch style={{transform: [{scaleX: 0.8}, {scaleY: 0.8}]}} />
              </View>
              <View style={styles.socialRowContainer}>
                <View style={styles.socialLeftContainer}>
                  <Ionicons
                    style={styles.socialIcon}
                    name="logo-twitter"
                    color="#1D9BF0"
                    size={24}
                  />
                  <Text style={styles.socials}>Twitter</Text>
                </View>
                <Switch style={{transform: [{scaleX: 0.8}, {scaleY: 0.8}]}} />
              </View>
              <View style={styles.socialRowContainer}>
                <View style={styles.socialLeftContainer}>
                  <Ionicons
                    style={styles.socialIcon}
                    name="logo-snapchat"
                    color="#FFFC00"
                    size={24}
                  />
                  <Text style={styles.socials}>Snapchat</Text>
                </View>
                <Switch style={{transform: [{scaleX: 0.8}, {scaleY: 0.8}]}} />
              </View>
              <TouchableOpacity onPress={postSong} style={styles.postBtn}>
                <Ionicons name="earth" color="white" size={24} />
                <Text style={styles.postBtnText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </DismissKeyboard>
      )}
    </>
  );
};

export default CompletePostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
  },
  postContainer: {
    backgroundColor: Colors.lightBlack,
    height: '18%',
  },
  topContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '18%',
  },
  chevron: {
    marginRight: '85%',
  },
  post: {
    position: 'absolute',
    color: 'white',
    fontFamily: 'Inter-Semibold',
    fontSize: 28,
  },
  trackContainer: {
    marginTop: '10%',
    flexDirection: 'row',
    justifyContent: 'center',
    maxWidth: '60%',
  },
  songIMG: {
    height: 165,
    width: 165,
    marginRight: '3%',
  },
  songInfoContainer: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginLeft: '3%',
    width: 165,
  },
  songName: {
    color: 'white',
    fontFamily: 'Inter-bold',
    fontSize: 24,
    maxWidth: 165,
  },
  artistContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    maxWidth: 165,
  },
  byText: {
    color: 'white',
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  artists: {
    color: 'white',
    fontFamily: 'Inter-bold',
    fontSize: 17,
  },
  albumContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    maxWidth: 165,
  },
  albumName: {
    color: 'white',
    fontFamily: 'Inter-bold',
    fontSize: 17,
    maxWidth: 140,
  },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.greyBtn,
    borderRadius: 9,
    paddingVertical: 4,
    alignSelf: 'center',
    justifyContent: 'center',
    width: 165,
  },
  previewText: {
    color: 'white',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginLeft: 5,
  },
  captionContainer: {
    marginTop: '9%',
    maxWidth: '90%',
    height: '10.79%',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    textAlign: 'left',
    alignSelf: 'flex-start',
    marginLeft: '5.2%',
  },
  caption: {
    padding: 0,
    color: 'white',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  shareToContainer: {
    marginTop: '5%',
    justifyContent: 'flex-start',
    width: '90%',
  },
  shareTo: {
    color: 'white',
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    marginBottom: '5%',
  },

  socialRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '3%',
  },
  socialLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialIcon: {
    marginRight: '10%',
  },
  socials: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  switch: {
    height: 100,
    width: 100,
  },
  postBtn: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.red,
    borderRadius: 9,
    marginTop: '55%',
    width: '100%',
    height: '30%',
  },
  postBtnText: {
    color: 'white',
    fontFamily: 'Inter-bold',
    marginLeft: 10,
    fontSize: 20,
  },
});
