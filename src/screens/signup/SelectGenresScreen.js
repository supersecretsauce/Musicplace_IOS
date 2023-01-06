import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableWithoutFeedback,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import axios from 'axios';
import Musicplace from '../../assets/img/musicplace-signup.svg';
import React, {useState, useEffect, useContext} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../assets/utilities/Colors';
import HapticFeedback from 'react-native-haptic-feedback';
import {Context} from '../../context/Context';
import appCheck from '@react-native-firebase/app-check';
import DeviceInfo from 'react-native-device-info';
import {simKey} from '../../../simKey';

const SelectGenresScreen = ({navigation, route}) => {
  const {UID} = route.params;
  const [selections, setSelections] = useState([]);
  const [popularGenres, setPopularGenres] = useState(null);
  const [colors, setColors] = useState(null);
  const {setFeed} = useContext(Context);

  function goBack() {
    navigation.goBack();
  }

  useEffect(() => {
    let colorsArr = [];
    for (let i = 0; i < 30; i++) {
      const randomColor = Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0');
      colorsArr.push(`#${randomColor}`);
    }
    setColors(colorsArr);
  }, []);

  useEffect(() => {
    async function fetchGenres() {
      let isEmulator = await DeviceInfo.isEmulator();
      let authToken;
      if (!isEmulator) {
        authToken = await appCheck().getToken();
      }
      axios
        .get('http://167.99.22.22/fetch/genres', {
          headers: {
            accept: 'application/json',
            Authorization: isEmulator
              ? 'Bearer ' + simKey
              : 'Bearer ' + authToken.token,
          },
        })
        .then(resp => {
          let allGenres = resp.data.data;
          let sortable = [];
          for (var genre in allGenres) {
            sortable.push([genre, allGenres[genre]]);
          }
          let sortedArray = sortable.sort(function (a, b) {
            return b[1] - a[1];
          });
          console.log(sortedArray);
          setPopularGenres(sortedArray.slice(0, 30));
        });
    }

    fetchGenres();
  }, []);

  function handleSelections(genre) {
    HapticFeedback.trigger('selection');
    if (selections.includes(genre)) {
      setSelections(selections.filter(genreName => genreName !== genre));
    } else {
      setSelections([...selections, genre]);
    }
  }

  async function handleSubmit() {
    HapticFeedback.trigger('impactHeavy');
    if (selections.length === 0) {
      return;
    } else {
      let formattedGenres = selections.join(',');
      let encodedGenres = encodeURIComponent(formattedGenres);
      let isEmulator = await DeviceInfo.isEmulator();
      let authToken;
      if (!isEmulator) {
        authToken = await appCheck().getToken();
      }
      axios
        .get(
          `http://167.99.22.22/recommendation/user?userId=${UID}&genres=${encodedGenres}`,
          {
            headers: {
              accept: 'application/json',
              Authorization: isEmulator
                ? 'Bearer ' + simKey
                : 'Bearer ' + authToken.token,
            },
          },
        )
        .then(resp => {
          if (resp.data.length === 0) {
            console.log('no songs in this genre');
          } else {
            console.log(resp);
            setFeed(resp.data.data);
            navigation.navigate('CreateUsernameScreen');
          }
        })
        .catch(e => {
          console.log(e);
        });
    }
  }

  useEffect(() => {
    console.log(selections);
  }, [selections]);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topContainer}>
        <TouchableWithoutFeedback
          onPress={goBack}
          style={styles.touchContainer}>
          <Ionicons
            style={styles.chevron}
            name="chevron-back"
            color="white"
            size={40}
          />
        </TouchableWithoutFeedback>
        <Musicplace style={styles.musicplace} />
      </View>
      <Text style={styles.desc}>
        Select your favorite genres so we can get to know you better.
      </Text>
      <View style={styles.scrollViewContainer}>
        {popularGenres && colors ? (
          <FlatList
            style={styles.middleContainer}
            data={popularGenres}
            renderItem={({item, index}) => {
              return (
                <TouchableOpacity
                  style={styles.genreContainer}
                  key={index}
                  onPress={() => handleSelections(item[0])}>
                  <View style={styles.genreLeft}>
                    <View
                      // eslint-disable-next-line react-native/no-inline-styles
                      style={{
                        backgroundColor: colors[index],
                        height: 30,
                        width: 30,
                        borderRadius: 30,
                      }}
                    />
                    <Text style={styles.genreText}>{item[0]}</Text>
                  </View>
                  <Ionicons
                    name={
                      selections.includes(item[0])
                        ? 'radio-button-on'
                        : 'radio-button-off'
                    }
                    color="white"
                    size={25}
                  />
                </TouchableOpacity>
              );
            }}
          />
        ) : (
          <></>
        )}
      </View>
      <TouchableOpacity
        style={selections.length > 0 ? styles.nextBtn : styles.nextBtnEmpty}
        onPress={handleSubmit}>
        <Text
          style={
            selections.length > 0 ? styles.nextText : styles.nextTextEmpty
          }>
          Next
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default SelectGenresScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  touchContainer: {
    width: '15%',
  },
  topContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 25,
  },
  chevron: {
    position: 'absolute',
    left: 20,
  },
  musicplace: {
    alignSelf: 'center',
  },
  desc: {
    color: 'white',
    fontFamily: 'Inter-semibold',
    fontSize: 18,
    width: 320,
    textAlign: 'center',
    alignSelf: 'center',
    marginTop: '3%',
  },
  scrollViewContainer: {
    height: '70%',
  },
  middleContainer: {
    // backgroundColor: 'grey',
    marginTop: '7%',
  },
  genreContainer: {
    width: '90%',
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
  },
  genreLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  genreText: {
    color: 'white',
    fontFamily: 'Inter-Medium',
    fontSize: 22,
    marginLeft: 10,
  },
  nextBtnEmpty: {
    backgroundColor: 'rgba(255, 8, 0, 0.5)',
    alignItems: 'center',
    borderRadius: 9,
    paddingVertical: 10,
    marginTop: '5%',
    width: '90%',
    alignSelf: 'center',
    bottom: 15,
  },
  nextTextEmpty: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    opacity: 0.5,
  },
  nextBtn: {
    backgroundColor: Colors.red,
    alignItems: 'center',
    borderRadius: 9,
    paddingVertical: 10,
    marginTop: '5%',
    width: '90%',
    alignSelf: 'center',
    bottom: 15,
  },
  nextText: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
});
