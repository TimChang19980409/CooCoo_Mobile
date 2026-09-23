import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const projectRoot = path.resolve(__dirname, '../..');

type SteigerConfigReport = {
  includesRecommended: boolean;
  disabledRules: string[];
};

function inspectSteigerConfig(): SteigerConfigReport {
  const script = `
    import fsd from '@feature-sliced/steiger-plugin';
    import config from './steiger.config.ts';

    const recommended = fsd.configs.recommended;
    const overrides = config.slice(recommended.length);
    const disabledRules = overrides.flatMap((item) =>
      Object.entries(item.rules ?? {})
        .filter(([, value]) => value === 'off' || (Array.isArray(value) && value[0] === 'off'))
        .map(([name]) => name),
    );

    console.log(JSON.stringify({
      includesRecommended: recommended.every((item, index) => config[index] === item),
      disabledRules,
    }));
  `;

  const output = execFileSync(
    process.execPath,
    ['--experimental-strip-types', '--input-type=module', '-e', script],
    {
      cwd: projectRoot,
      encoding: 'utf8',
    },
  );

  return JSON.parse(output) as SteigerConfigReport;
}

describe('Steiger config', () => {
  test('keeps recommended FSD rules except the single-reference heuristic', () => {
    const report = inspectSteigerConfig();

    expect(report.includesRecommended).toBe(true);
    expect(report.disabledRules).toEqual(['fsd/insignificant-slice']);
    expect(report.disabledRules).not.toContain('fsd/forbidden-imports');
    expect(report.disabledRules).not.toContain('fsd/no-public-api-sidestep');
    expect(report.disabledRules).not.toContain('fsd/public-api');
  });

  test('fails when an entity imports a feature', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fsd-violation-'));
    fs.mkdirSync(path.join(root, 'src/entities/user/model'), {
      recursive: true,
    });
    fs.mkdirSync(path.join(root, 'src/features/sign-in/model'), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(root, 'src/features/sign-in/model/sign-in.ts'),
      'export const signIn = () => {};\n',
    );
    fs.writeFileSync(
      path.join(root, 'src/features/sign-in/index.ts'),
      "export { signIn } from './model/sign-in';\n",
    );
    fs.writeFileSync(
      path.join(root, 'src/entities/user/model/user.ts'),
      "import { signIn } from '../../../features/sign-in';\nexport const user = signIn;\n",
    );
    fs.writeFileSync(
      path.join(root, 'src/entities/user/index.ts'),
      "export { user } from './model/user';\n",
    );

    let output = '';
    let failed = false;
    try {
      output = execFileSync(
        path.join(projectRoot, 'node_modules/.bin/steiger'),
        [path.join(root, 'src')],
        {
          cwd: projectRoot,
          encoding: 'utf8',
        },
      );
    } catch (error) {
      failed = true;
      const failure = error as { stdout?: string; stderr?: string };
      output = `${failure.stdout ?? ''}${failure.stderr ?? ''}`;
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }

    expect(failed).toBe(true);
    expect(output).toContain('fsd/forbidden-imports');
  });
});
