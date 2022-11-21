import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {spotConfig} from '../../SpotifyConfig';
import axios from 'axios';
import {Buffer} from 'buffer';
const qs = require('qs');

// axios instance
export const authFetch = (
  accessToken,
  refreshToken,
  setAccessToken,
  setRefreshToken,
) => {
  const axiosInstance = axios.create({
    baseURL: 'https://api.spotify.com/v1',
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json',
    },
  });
  axiosInstance.interceptors.response.use(
    function (response) {
      return response;
    },
    function (error) {
      console.log(error);
      const data = qs.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });
      if (error.response.status == 401) {
        //     axios
        //       .post('https://accounts.spotify.com/api/token', data, {
        //         headers: {
        //           'Content-Type': 'application/x-www-form-urlencoded',
        //           Authorization:
        //             'Basic ' +
        //             Buffer.from(
        //               spotConfig.clientId + ':' + spotConfig.clientSecret,
        //             ).toString('base64'),
        //         },
        //       })
        //       .then(resp => {
        //         console.log('new tokens', resp);
        //         setAccessToken(resp.data.access_token);
        //         setRefreshToken(resp.data.refresh_token);
        //       })
        //       .catch(e => {
        //         console.log(e);
        //       });
      }
    },
    // function (error) {
    //   console.log(error);
    //   console.log('response error');
    //   if (error.response.status === 401) {
    //     console.log('attempting');
    //     const data = qs.stringify({
    //       grant_type: 'refresh_token',
    //       refresh_token: refreshToken,
    //     });
    //     axios
    //       .post('https://accounts.spotify.com/api/token', data, {
    //         headers: {
    //           'Content-Type': 'application/x-www-form-urlencoded',
    //           Authorization:
    //             'Basic ' +
    //             Buffer.from(
    //               spotConfig.clientId + ':' + spotConfig.clientSecret,
    //             ).toString('base64'),
    //         },
    //       })
    //       .then(response => {
    //         console.log('set new tokens!');
    //         console.log(response);
    //         setAccessToken(response.data.access_token);
    //         setRefreshToken(response.data.refresh_token);
    //         return;
    //       })
    //       .catch(e => {
    //         console.log(e);
    //         console.log('bad token?');
    //         //check firebase for new tokens
    //         const getFirebaseToken = async () => {
    //           try {
    //             const UID = await AsyncStorage.getItem('UID');
    //             await firestore()
    //               .collection('users')
    //               .doc(UID)
    //               .get()
    //               .then(querySnapshot => {
    //                 console.log(querySnapshot);
    //                 setRefreshToken(querySnapshot._data.spotifyRefreshToken);
    //                 console.log(querySnapshot._data.spotifyRefreshToken);
    //               });
    //             axios
    //               .post('https://accounts.spotify.com/api/token', data, {
    //                 headers: {
    //                   'Content-Type': 'application/x-www-form-urlencoded',
    //                   Authorization:
    //                     'Basic ' +
    //                     Buffer.from(
    //                       spotConfig.clientId + ':' + spotConfig.clientSecret,
    //                     ).toString('base64'),
    //                 },
    //               })
    //               .then(response => {
    //                 console.log('set new tokens from firebase!');
    //                 setAccessToken(response.data.access_token);
    //                 setRefreshToken(response.data.refresh_token);
    //                 return;
    //               })
    //               .catch(e => {
    //                 console.log(e);
    //                 console.log("it's all bad mate!");
    //                 //check firebase for new tokens
    //                 return;
    //               });
    //           } catch (error) {
    //             console.log(error);
    //             console.log(
    //               'tried to get new tokens from firebase and those did not work',
    //             );
    //             return;
    //           }
    //         };
    //         getFirebaseToken();
    //       });
    //   }
    //   return Promise.reject(error);
    // },
  );
  return axiosInstance;
};
