// https://docs.expo.dev/guides/using-eslint/
import { defineConfig, globalIgnores } from 'eslint/config';
import expoConfig from 'eslint-config-expo/flat';
import testingLibrary from 'eslint-plugin-testing-library';

export default defineConfig([
  globalIgnores(['dist/**', '.expo/**']),
  expoConfig,
  {
    ...testingLibrary.configs['flat/react'],
    files: [
      '**/__tests__/**/*.{js,jsx,ts,tsx}',
      '**/*.{spec,test}.{js,jsx,ts,tsx}',
    ],
  },
]);
