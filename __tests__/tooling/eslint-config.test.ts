import { execFileSync } from 'node:child_process';
import path from 'node:path';

const projectRoot = path.resolve(__dirname, '../..');

type EslintFileInfo = {
  ignored: boolean;
  testingLibrary: string[];
};

function inspectEslintFile(relativePath: string): EslintFileInfo {
  const script = `
    const { ESLint } = require('eslint');
    const filePath = process.argv[1];
    const eslint = new ESLint({
      cwd: process.cwd(),
      overrideConfigFile: 'eslint.config.js',
    });

    eslint.isPathIgnored(filePath).then(async (ignored) => {
      if (ignored) {
        console.log(JSON.stringify({ ignored: true, testingLibrary: [] }));
        return;
      }

      const config = await eslint.calculateConfigForFile(filePath);
      const testingLibrary = Object.entries(config.rules ?? [])
        .filter(([name, setting]) => {
          if (!name.startsWith('testing-library/')) {
            return false;
          }
          const severity = Array.isArray(setting) ? setting[0] : setting;
          return severity !== 'off' && severity !== 0;
        })
        .map(([name]) => name);

      console.log(JSON.stringify({ ignored: false, testingLibrary }));
    });
  `;

  const output = execFileSync(process.execPath, ['-e', script, relativePath], {
    cwd: projectRoot,
    encoding: 'utf8',
  });

  return JSON.parse(output) as EslintFileInfo;
}

describe('ESLint config', () => {
  test('ignores build and Expo output directories', () => {
    expect(inspectEslintFile('dist/bundle/index.js').ignored).toBe(true);
    expect(inspectEslintFile('.expo/types/router.d.ts').ignored).toBe(true);
    expect(inspectEslintFile('src/app/index.tsx').ignored).toBe(false);
  });

  test('enables Testing Library rules only for test files', () => {
    const testFile = inspectEslintFile('__tests__/home-screen.test.tsx');
    const appFile = inspectEslintFile('src/app/index.tsx');

    expect(testFile.ignored).toBe(false);
    expect(testFile.testingLibrary.length).toBeGreaterThan(0);
    expect(appFile.testingLibrary).toEqual([]);
  });
});
