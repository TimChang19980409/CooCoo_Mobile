import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(__dirname, '../..');

describe('check script', () => {
  test('runs lint, types, formatting, FSD, and Jest in one command', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'),
    ) as { scripts: Record<string, string> };

    expect(packageJson.scripts.check).toBe(
      'pnpm lint && pnpm typecheck && pnpm format:check && pnpm fsd:check && pnpm exec jest --runInBand',
    );
  });
});
