const spotConfig = {
  clientId: '501638f5cfb04abfb61d039e370c5d99', // available on the app page
  clientSecret: '16f92a6d7e9a4180b29af25bf012e6fe', // click "show client secret" to see this
  redirectUrl: 'musicplace-ios:/musicplace-ios-login', // the redirect you defined after creating the app
  scopes: [
    'user-read-email',
    'playlist-modify-public',
    'user-read-private',
    'user-library-read',
  ], // the scopes you need to access
  serviceConfiguration: {
    authorizationEndpoint: 'https://accounts.spotify.com/authorize',
    tokenEndpoint: 'https://accounts.spotify.com/api/token',
  },
};
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
      console.log('response error');
      if (error.response.status === 401) {
        console.log('attempting');
        const data = qs.stringify({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        });
        axios
          .post('https://accounts.spotify.com/api/token', data, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization:
                'Basic ' +
                Buffer.from(
                  spotConfig.clientId + ':' + spotConfig.clientSecret,
                ).toString('base64'),
            },
          })
          .then(response => {
            console.log('set new tokens!');
            setAccessToken(response.data.access_token);
            setRefreshToken(response.data.refresh_token);
            return;
          })
          .catch(e => {
            console.log(e);
            console.log('bad token?');
            return error;
          });
      }
      return Promise.reject(error);
    },
  );
  return axiosInstance;
};
