import fs from 'node:fs';
import path from 'node:path';

import appConfig from '../../app.config';

const projectRoot = path.resolve(__dirname, '../..');

describe('Maestro and EAS test profile', () => {
  test('uses the real app id in the config, smoke flow, and e2e profile', () => {
    const eas = JSON.parse(
      fs.readFileSync(path.join(projectRoot, 'eas.json'), 'utf8'),
    ) as {
      build: {
        'e2e-test': {
          withoutCredentials: boolean;
          ios: { simulator: boolean };
          android: { buildType: string };
        };
      };
    };
    const flow = fs.readFileSync(
      path.join(projectRoot, '.maestro/smoke/launch-app.yaml'),
      'utf8',
    );

    expect(appConfig.ios?.bundleIdentifier).toBe('com.coocoomobile.app');
    expect(appConfig.android?.package).toBe('com.coocoomobile.app');
    expect(appConfig.extra?.eas?.projectId).toBe(
      '9b21d0ca-667a-4853-80c2-2d4ee47d5781',
    );
    expect(flow).toContain('appId: com.coocoomobile.app');
    expect(flow).toContain('launchApp');
    expect(flow).toContain('assertVisible: Welcome.*Expo');
    expect(eas.build['e2e-test']).toEqual({
      withoutCredentials: true,
      ios: { simulator: true },
      android: { buildType: 'apk' },
    });
    expect(fs.existsSync(path.join(projectRoot, '.eas/workflows'))).toBe(false);
  });
});
