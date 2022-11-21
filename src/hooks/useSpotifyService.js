import React, {useContext, useEffect} from 'react';
import {Context} from '../context/Context';
import axios from 'axios';
const qs = require('qs');
import {spotConfig} from '../../SpotifyConfig';
import {Buffer} from 'buffer';
import firestore from '@react-native-firebase/firestore';
export const useSpotifyService = () => {
  const {accessToken, refreshToken, setAccessToken, setRefreshToken, UID} =
    useContext(Context);

  const authFetch = value => {
    console.log('value', value);
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
        const data = qs.stringify({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        });
        console.log(error.response);
        if (error.response.status == 401) {
          console.log('401 error');
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
              setAccessToken(response.data.access_token);
              setRefreshToken(response.data.refresh_token);
              firestore()
                .collection('users')
                .doc(UID)
                .update({
                  spotifyRefreshToken: response.data.refresh_token,
                  spotifyAccessToken: response.data.access_token,
                })
                .then(() => {
                  console.log('new token added');
                });
            })
            .catch(e => {
              console.log(e);
            });
        } else {
          console.log(error);
        }
      },
    );
    return axiosInstance;
  };

  return {authFetch};
};
