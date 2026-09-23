import path from 'node:path';

import { loadCjs } from './load-cjs';

const msw = loadCjs<typeof import('msw')>(
  path.join(__dirname, '../node_modules/msw/lib/core/index.js'),
);

export const http = msw.http;
export const HttpResponse = msw.HttpResponse;
export const graphql = msw.graphql;
export const passthrough = msw.passthrough;
export const bypass = msw.bypass;
export const delay = msw.delay;
