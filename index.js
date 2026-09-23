import 'fast-text-encoding';
import 'react-native-url-polyfill/auto';

if (__DEV__) {
  require('./src/shared/api/mocks/native').startNativeMocks();
}

require('expo-router/entry');
