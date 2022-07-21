import axios from 'axios';
const qs = require('qs');
import {useContext} from 'react';
import {Context} from '../context/Context';
import {Buffer} from 'buffer';

const SpotifyAPI = () => {
  const {refreshToken, setRefreshToken} = useContext(Context);

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

  const authFetch = axios.create({
    baseURL: 'https://accounts.spotify.com/api/token',
    data: qs.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' +
        Buffer.from(
          spotConfig.clientId + ':' + spotConfig.clientSecret,
        ).toString('base64'),
    },
  });
};

export default SpotifyAPI;
