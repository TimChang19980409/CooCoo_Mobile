import { parseResponse, requestJson } from '@/shared/api';

import { nicknameResponseSchema } from '../model/nickname';

export function updateNickname(nickname: string) {
  return requestJson('/api/nickname', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickname }),
  }).andThen((body) => parseResponse(nicknameResponseSchema, body));
}

export async function submitNickname(nickname: string) {
  const result = await updateNickname(nickname);
  if (result.isErr()) {
    throw result.error;
  }

  return result.value;
}
