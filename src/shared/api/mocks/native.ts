import { setupServer } from 'msw/native';

import { handlers } from './handlers';

const server = setupServer(...handlers);

export function startNativeMocks() {
  server.listen();
}
