import fs from 'node:fs';
import path from 'node:path';

type BiomeConfig = {
  $schema: string;
  vcs: {
    enabled: boolean;
    clientKind: string;
    useIgnoreFile: boolean;
  };
  formatter: {
    enabled: boolean;
    indentStyle: string;
    indentWidth: number;
  };
  linter: {
    enabled: boolean;
  };
  javascript: {
    formatter: {
      quoteStyle: string;
    };
  };
  assist: {
    enabled: boolean;
    actions: {
      source: {
        organizeImports: string;
      };
    };
  };
};

const projectRoot = path.resolve(__dirname, '../..');

describe('Biome config', () => {
  const config = JSON.parse(
    fs.readFileSync(path.join(projectRoot, 'biome.json'), 'utf8'),
  ) as BiomeConfig;

  test('formats with spaces and single quotes while leaving lint to ESLint', () => {
    expect(config.$schema).toContain('biomejs.dev/schemas/');
    expect(config.linter.enabled).toBe(false);
    expect(config.formatter).toMatchObject({
      enabled: true,
      indentStyle: 'space',
      indentWidth: 2,
    });
    expect(config.javascript.formatter.quoteStyle).toBe('single');
    expect(config.assist.enabled).toBe(true);
    expect(config.assist.actions.source.organizeImports).toBe('on');
  });

  test('uses Git ignore so generated and dependency files stay unformatted', () => {
    expect(config.vcs).toEqual({
      enabled: true,
      clientKind: 'git',
      useIgnoreFile: true,
    });
  });
});
