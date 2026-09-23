import { err, ok, type Result } from 'neverthrow';
import type { ZodType } from 'zod';

import type { ApiError } from './errors';

export function parseResponse<T>(
  schema: ZodType<T>,
  body: unknown,
): Result<T, ApiError> {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return err({ type: 'invalid-response' });
  }

  return ok(parsed.data);
}
