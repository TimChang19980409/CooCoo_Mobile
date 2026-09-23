import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(__dirname, '../..');

describe('Storybook config', () => {
  test('swaps the entry only when STORYBOOK_ENABLED is set', () => {
    const metro = fs.readFileSync(
      path.join(projectRoot, 'metro.config.js'),
      'utf8',
    );
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'),
    ) as { scripts: Record<string, string> };
    const storyScripts = Object.values(packageJson.scripts).filter((script) =>
      script.includes('STORYBOOK_ENABLED'),
    );

    expect(metro).toContain('@storybook/react-native/withStorybook');
    expect(metro).toContain('withStorybook(config)');
    expect(storyScripts.length).toBeGreaterThan(0);
    expect(fs.existsSync(path.join(projectRoot, 'src/app/storybook.tsx'))).toBe(
      false,
    );
    expect(
      fs.existsSync(
        path.join(projectRoot, 'src/shared/ui/themed-text.stories.tsx'),
      ),
    ).toBe(true);
  });
});
