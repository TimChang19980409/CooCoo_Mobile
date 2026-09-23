import { greetingEndpoint, parseResponse, requestJson } from '@/shared/api';

import { type Greeting, greetingSchema } from '../model/greeting';

export function getGreeting() {
  return requestJson(greetingEndpoint).andThen((body) =>
    parseResponse<Greeting>(greetingSchema, body),
  );
}
