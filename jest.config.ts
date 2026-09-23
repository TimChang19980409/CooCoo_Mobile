import type { Config } from 'jest';

const config = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/test-utils/jest-setup.js'],
  moduleNameMapper: {
    '\\.css$': '<rootDir>/test-utils/style-mock.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.pnpm|(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg))',
  ],
} satisfies Config;

export default config;
