export const spotConfig = {
  clientId: '501638f5cfb04abfb61d039e370c5d99', // available on the app page
  redirectUrl: 'musicplace-ios:/musicplace-ios-login', // the redirect you defined after creating the app
  scopes: [
    'playlist-modify-public',
    'user-read-private',
    'user-library-read',
    'user-follow-read',
    'user-library-modify',
    'user-top-read',
  ], // the scopes you need to access
  serviceConfiguration: {
    authorizationEndpoint: 'https://accounts.spotify.com/authorize',
    tokenEndpoint: 'https://accounts.spotify.com/api/token',
  },
};
