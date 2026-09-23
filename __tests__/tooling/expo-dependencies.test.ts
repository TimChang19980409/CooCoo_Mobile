import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

type PackageManifest = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

const projectRoot = path.resolve(__dirname, '../..');
const requireFromProject = createRequire(
  path.join(projectRoot, 'package.json'),
);

const packageJson = JSON.parse(
  fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'),
) as PackageManifest;

const bundledNativeModules = requireFromProject(
  'expo/bundledNativeModules.json',
) as Record<string, string>;

describe('Expo SDK dependencies', () => {
  test('direct dependencies listed by Expo match the SDK bundled versions', () => {
    const declared = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    const managedNames = Object.keys(declared)
      .filter((name) => Object.hasOwn(bundledNativeModules, name))
      .sort();

    expect(managedNames.length).toBeGreaterThan(0);

    const actual = Object.fromEntries(
      managedNames.map((name) => [name, declared[name]]),
    );
    const expected = Object.fromEntries(
      managedNames.map((name) => [name, bundledNativeModules[name]]),
    );

    expect(actual).toEqual(expected);
  });

  test('pins React peers to the app React version', () => {
    const workspace = fs.readFileSync(
      path.join(projectRoot, 'pnpm-workspace.yaml'),
      'utf8',
    );
    const manifest = JSON.parse(
      fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'),
    ) as PackageManifest;

    expect(workspace).toContain(`react: ${manifest.dependencies?.react}`);
    expect(workspace).toContain(
      `react-dom: ${manifest.dependencies?.['react-dom']}`,
    );
  });
});
