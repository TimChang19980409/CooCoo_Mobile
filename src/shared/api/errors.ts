export type ApiError =
  | { type: 'network' }
  | { type: 'unauthorized' }
  | { type: 'invalid-response' };
