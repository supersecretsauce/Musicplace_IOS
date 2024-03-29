/**
 * @format
 */
import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import {Text, TextInput} from 'react-native';

import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
// Register background handler

async function onMessageReceived(message) {
  notifee.displayNotification(JSON.parse(message.data.notifee));
  await notifee.incrementBadgeCount();
}

messaging().setBackgroundMessageHandler(onMessageReceived);
messaging().onMessage(onMessageReceived);

AppRegistry.registerComponent(appName, () => App);

//ADD this
if (Text.defaultProps == null) {
  Text.defaultProps = {};
  Text.defaultProps.allowFontScaling = false;
}

if (TextInput.defaultProps == null) {
  TextInput.defaultProps = {};
  TextInput.defaultProps.allowFontScaling = false;
}
