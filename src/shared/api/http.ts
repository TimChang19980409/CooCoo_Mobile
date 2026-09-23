import { errAsync, ResultAsync } from 'neverthrow';

import type { ApiError } from './errors';

export function requestJson(
  input: RequestInfo,
  init?: RequestInit,
): ResultAsync<unknown, ApiError> {
  return ResultAsync.fromPromise(fetch(input, init), () => ({
    type: 'network' as const,
  })).andThen((response) => {
    if (response.status === 401) {
      return errAsync({ type: 'unauthorized' as const });
    }

    if (!response.ok) {
      return errAsync({ type: 'network' as const });
    }

    return ResultAsync.fromPromise(response.json() as Promise<unknown>, () => ({
      type: 'invalid-response' as const,
    }));
  });
}
