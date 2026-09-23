import type { Config } from 'jest';

const globals = globalThis as typeof globalThis & {
  __nodeFetch?: typeof fetch;
  __nodeHeaders?: typeof Headers;
  __nodeRequest?: typeof Request;
  __nodeResponse?: typeof Response;
};

globals.__nodeFetch = globalThis.fetch;
globals.__nodeHeaders = globalThis.Headers;
globals.__nodeRequest = globalThis.Request;
globals.__nodeResponse = globalThis.Response;

const config = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/test-utils/jest-setup.js'],
  moduleNameMapper: {
    '\\.css$': '<rootDir>/test-utils/style-mock.js',
    '^msw$': '<rootDir>/test-utils/msw-core.ts',
    '^msw/node$': '<rootDir>/test-utils/msw-node.ts',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.pnpm|(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg))',
  ],
} satisfies Config;

export default config;
