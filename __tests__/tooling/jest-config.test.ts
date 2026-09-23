import fs from 'node:fs';
import path from 'node:path';

import jestConfig from '../../jest.config';

type PackageManifest = {
  jest?: unknown;
  scripts: Record<string, string>;
};

const projectRoot = path.resolve(__dirname, '../..');

describe('Jest config', () => {
  test('uses jest-expo and keeps the pnpm transform exception', () => {
    expect(jestConfig.preset).toBe('jest-expo');
    expect(jestConfig.setupFilesAfterEnv).toEqual([
      '<rootDir>/test-utils/jest-setup.js',
    ]);
    expect(jestConfig.moduleNameMapper).toEqual({
      '\\.css$': '<rootDir>/test-utils/style-mock.js',
      '^msw$': '<rootDir>/test-utils/msw-core.ts',
      '^msw/node$': '<rootDir>/test-utils/msw-node.ts',
    });
    expect(jestConfig.transformIgnorePatterns).toEqual([
      'node_modules/(?!(.pnpm|(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg))',
    ]);
  });

  test('runs tests once by default and keeps watch as a separate script', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'),
    ) as PackageManifest;

    expect(packageJson.scripts.test).toBe('jest');
    expect(packageJson.scripts['test:watch']).toBe('jest --watchAll');
    expect(packageJson.scripts.typecheck).toBe('tsc --noEmit');
    expect(packageJson.jest).toBeUndefined();
  });
});
