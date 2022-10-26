import {Mixpanel} from 'mixpanel-react-native';

const trackAutomaticEvents = true;
export const mixpanel = new Mixpanel(
  'f70e1b868977b7c6e36b6ff5a0ce02ed',
  trackAutomaticEvents,
);
