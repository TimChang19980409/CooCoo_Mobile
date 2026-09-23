import { queryOptions } from '@tanstack/react-query';

import { getGreeting } from './get-greeting';

export async function fetchGreeting() {
  const result = await getGreeting();
  if (result.isErr()) {
    throw result.error;
  }

  return result.value;
}

export const greetingQueryOptions = queryOptions({
  queryKey: ['greeting'],
  queryFn: fetchGreeting,
});
