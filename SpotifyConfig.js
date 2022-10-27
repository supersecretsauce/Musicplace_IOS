export const spotConfig = {
  clientId: '501638f5cfb04abfb61d039e370c5d99', // available on the app page
  clientSecret: '16f92a6d7e9a4180b29af25bf012e6fe', // click "show client secret" to see this
  redirectUrl: 'musicplace-ios:/musicplace-ios-login', // the redirect you defined after creating the app
  scopes: [
    'playlist-modify-public',
    'user-read-private',
    'user-library-read',
    'user-follow-read',
  ], // the scopes you need to access
  serviceConfiguration: {
    authorizationEndpoint: 'https://accounts.spotify.com/authorize',
    tokenEndpoint: 'https://accounts.spotify.com/api/token',
  },
};
