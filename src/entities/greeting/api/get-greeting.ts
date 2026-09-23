import { parseResponse, requestJson } from '@/shared/api';

import { type Greeting, greetingSchema } from '../model/greeting';

export function getGreeting() {
  return requestJson('/api/greeting').andThen((body) =>
    parseResponse<Greeting>(greetingSchema, body),
  );
}
