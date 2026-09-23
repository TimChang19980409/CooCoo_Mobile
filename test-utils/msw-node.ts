import path from 'node:path';

import { loadCjs } from './load-cjs';

const mswNode = loadCjs<typeof import('msw/node')>(
  path.join(__dirname, '../node_modules/msw/lib/node/index.js'),
);

export const setupServer = mswNode.setupServer;
