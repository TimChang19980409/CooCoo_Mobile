import fs from 'node:fs';
import Module from 'node:module';
import path from 'node:path';
import vm from 'node:vm';

export function loadCjs<T>(filename: string): T {
  const moduleWithPaths = Module as typeof Module & {
    _nodeModulePaths: (from: string) => string[];
  };
  const parent = new Module(filename);
  parent.filename = filename;
  parent.paths = moduleWithPaths._nodeModulePaths(path.dirname(filename));

  const code = fs.readFileSync(filename, 'utf8');
  const wrapped = `(function (exports, require, module, __filename, __dirname) { ${code}\n})`;
  const evaluate = vm.runInThisContext(wrapped, { filename }) as (
    exports: T,
    require: (id: string) => unknown,
    module: { exports: T },
    filename: string,
    dirname: string,
  ) => void;
  const localModule = { exports: {} as T };

  evaluate(
    localModule.exports,
    parent.require.bind(parent),
    localModule,
    filename,
    path.dirname(filename),
  );

  return localModule.exports;
}
