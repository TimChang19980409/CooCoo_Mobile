import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(__dirname, '../..');

function readProjectFile(relativePath: string) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

function filesUnder(directory: string): string[] {
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return filesUnder(fullPath);
    }

    return [fullPath];
  });
}

describe('MSW entry', () => {
  test('loads polyfills and starts native mocks only while developing', () => {
    const entry = readProjectFile('index.js');
    const packageJson = JSON.parse(readProjectFile('package.json')) as {
      main: string;
    };
    const polyfillAt = entry.indexOf("import 'fast-text-encoding'");
    const urlPolyfillAt = entry.indexOf(
      "import 'react-native-url-polyfill/auto'",
    );
    const devGuardAt = entry.indexOf('if (__DEV__)');
    const nativeMockAt = entry.indexOf(
      "require('./src/shared/api/mocks/native')",
    );
    const routerAt = entry.indexOf("require('expo-router/entry')");

    expect(packageJson.main).toBe('index.js');
    expect(polyfillAt).toBeGreaterThanOrEqual(0);
    expect(urlPolyfillAt).toBeGreaterThan(polyfillAt);
    expect(devGuardAt).toBeGreaterThan(urlPolyfillAt);
    expect(nativeMockAt).toBeGreaterThan(devGuardAt);
    expect(routerAt).toBeGreaterThan(nativeMockAt);
    expect(entry).not.toContain('msw/node');
    expect(readProjectFile('src/shared/api/mocks/native.web.ts')).not.toContain(
      'msw/native',
    );
  });

  test('keeps the Node MSW server out of the app bundle', () => {
    const appFiles = filesUnder(path.join(projectRoot, 'src')).filter(
      (file) =>
        file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js'),
    );
    const nodeImports = appFiles.filter((file) =>
      fs.readFileSync(file, 'utf8').includes('msw/node'),
    );

    expect(nodeImports.map((file) => path.relative(projectRoot, file))).toEqual(
      ['src/shared/api/mocks/node.ts'],
    );
  });
});
