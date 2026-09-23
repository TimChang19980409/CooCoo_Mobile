import fs from 'node:fs';
import path from 'node:path';

import appConfig from '../../app.config';

type PackageManifest = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

const projectRoot = path.resolve(__dirname, '../..');

describe('React Compiler', () => {
  test('is enabled in the Expo config and installed as a direct dependency', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'),
    ) as PackageManifest;
    const declared = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    expect(appConfig.experiments?.reactCompiler).toBe(true);
    expect(declared['babel-plugin-react-compiler']).toBeDefined();
    expect(fs.existsSync(path.join(projectRoot, 'babel.config.js'))).toBe(
      false,
    );
    expect(fs.existsSync(path.join(projectRoot, 'babel.config.ts'))).toBe(
      false,
    );
  });
});
