import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableWithoutFeedback,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Musicplace from '../../assets/img/musicplace-signup.svg';
import React, {useState, useEffect} from 'react';
import Rap from '../../assets/img/rap.svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Pop from '../../assets/img/pop.svg';
import RB from '../../assets/img/r&b.svg';
import House from '../../assets/img/house.svg';
import Trap from '../../assets/img/trap.svg';
import Soul from '../../assets/img/soul.svg';
import Edm from '../../assets/img/edm.svg';
import Rock from '../../assets/img/rock.svg';
import Colors from '../../assets/utilities/Colors';
import Electronic from '../../assets/img/electronic.svg';
import Latin from '../../assets/img/latin.svg';
import HapticFeedback from 'react-native-haptic-feedback';

const SelectGenresScreen = ({navigation}) => {
  const [selections, setSelections] = useState([]);
  function goBack() {
    navigation.goBack();
  }

  function handleSelections(genre) {
    HapticFeedback.trigger('selection');
    if (selections.includes(genre)) {
      setSelections(selections.filter(genreName => genreName !== genre));
    } else {
      setSelections([...selections, genre]);
    }
  }

  function handleSubmit() {
    HapticFeedback.trigger('impactHeavy');
    if (selections.length === 0) {
      return;
    } else {
      navigation.navigate('SwipeUpScreen');
    }
  }

  useEffect(() => {
    console.log(selections);
  }, [selections]);
  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={goBack}>
        <View style={styles.touchContainer}>
          <Image
            style={styles.chevron}
            source={require('../../assets/img/ChevronLeft.jpg')}
          />
        </View>
      </TouchableWithoutFeedback>
      <Musicplace style={styles.musicplace} />
      <Text style={styles.desc}>
        Select your favorite genres so we can get to know you better.
      </Text>
      <View style={styles.scrollViewContainer}>
        <ScrollView style={styles.middleContainer}>
          <TouchableOpacity
            style={styles.genreContainer}
            onPress={() => handleSelections('rap')}>
            <View style={styles.genreLeft}>
              <Rap height={30} />
              <Text style={styles.genreText}>Rap</Text>
            </View>
            <Ionicons
              name={
                selections.includes('rap')
                  ? 'radio-button-on'
                  : 'radio-button-off'
              }
              color="white"
              size={25}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.genreContainer}
            onPress={() => handleSelections('pop')}>
            <View style={styles.genreLeft}>
              <Pop height={30} />
              <Text style={styles.genreText}>Pop</Text>
            </View>
            <Ionicons
              name={
                selections.includes('pop')
                  ? 'radio-button-on'
                  : 'radio-button-off'
              }
              color="white"
              size={25}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.genreContainer}
            onPress={() => handleSelections('r&b')}>
            <View style={styles.genreLeft}>
              <RB height={30} />
              <Text style={styles.genreText}>R&B</Text>
            </View>
            <Ionicons
              name={
                selections.includes('r&b')
                  ? 'radio-button-on'
                  : 'radio-button-off'
              }
              color="white"
              size={25}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.genreContainer}
            onPress={() => handleSelections('house')}>
            <View style={styles.genreLeft}>
              <House height={30} />
              <Text style={styles.genreText}>House</Text>
            </View>
            <Ionicons
              name={
                selections.includes('house')
                  ? 'radio-button-on'
                  : 'radio-button-off'
              }
              color="white"
              size={25}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.genreContainer}
            onPress={() => handleSelections('trap')}>
            <View style={styles.genreLeft}>
              <Trap height={30} />
              <Text style={styles.genreText}>Trap</Text>
            </View>
            <Ionicons
              name={
                selections.includes('trap')
                  ? 'radio-button-on'
                  : 'radio-button-off'
              }
              color="white"
              size={25}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.genreContainer}
            onPress={() => handleSelections('edm')}>
            <View style={styles.genreLeft}>
              <Edm height={30} />
              <Text style={styles.genreText}>EDM</Text>
            </View>
            <Ionicons
              name={
                selections.includes('edm')
                  ? 'radio-button-on'
                  : 'radio-button-off'
              }
              color="white"
              size={25}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.genreContainer}
            onPress={() => handleSelections('soul')}>
            <View style={styles.genreLeft}>
              <Soul height={30} />
              <Text style={styles.genreText}>Soul</Text>
            </View>
            <Ionicons
              name={
                selections.includes('soul')
                  ? 'radio-button-on'
                  : 'radio-button-off'
              }
              color="white"
              size={25}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.genreContainer}
            onPress={() => handleSelections('rock')}>
            <View style={styles.genreLeft}>
              <Rock height={30} />
              <Text style={styles.genreText}>Rock</Text>
            </View>
            <Ionicons
              name={
                selections.includes('rock')
                  ? 'radio-button-on'
                  : 'radio-button-off'
              }
              color="white"
              size={25}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.genreContainer}
            onPress={() => handleSelections('electronic')}>
            <View style={styles.genreLeft}>
              <Electronic height={30} />
              <Text style={styles.genreText}>Electronic</Text>
            </View>
            <Ionicons
              name={
                selections.includes('electronic')
                  ? 'radio-button-on'
                  : 'radio-button-off'
              }
              color="white"
              size={25}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.genreContainer}
            onPress={() => handleSelections('latin')}>
            <View style={styles.genreLeft}>
              <Latin height={30} />
              <Text style={styles.genreText}>Latin</Text>
            </View>
            <Ionicons
              name={
                selections.includes('latin')
                  ? 'radio-button-on'
                  : 'radio-button-off'
              }
              color="white"
              size={25}
            />
          </TouchableOpacity>
        </ScrollView>
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
  chevron: {
    marginTop: '1%',
  },
  musicplace: {
    position: 'absolute',
    alignSelf: 'center',
    top: '8.2%',
  },
  desc: {
    color: 'white',
    fontFamily: 'Inter-semibold',
    fontSize: 18,
    width: 320,
    textAlign: 'center',
    alignSelf: 'center',
    marginTop: '8%',
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
    fontSize: 26,
  },
  nextBtnEmpty: {
    backgroundColor: 'rgba(255, 8, 0, 0.5)',
    alignItems: 'center',
    borderRadius: 9,
    paddingVertical: 10,
    marginTop: '5%',
    width: '90%',
    alignSelf: 'center',
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
  },
  nextText: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
});
