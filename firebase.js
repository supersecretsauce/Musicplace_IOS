// Import the functions you need from the SDKs you need
import {initializeApp} from 'firebase/app';
import {getFirestore} from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyCSy_UcR1Il6WncIH4Pdz_fuhugPfulhVU',
  authDomain: 'musicplace-66f20.firebaseapp.com',
  projectId: 'musicplace-66f20',
  storageBucket: 'musicplace-66f20.appspot.com',
  messagingSenderId: '642367062887',
  appId: '1:642367062887:web:bd03a4424700e95f0265c2',
  measurementId: 'G-B3W0REHP2T',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export {app};
export {db};
