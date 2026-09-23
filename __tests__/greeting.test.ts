import { fetchGreeting, getGreeting } from '@/entities/greeting';

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe('greeting API', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('returns the message from a successful response', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(jsonResponse(200, { message: 'Hello' }));

    const result = await getGreeting();

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toEqual({ message: 'Hello' });
    }
    await expect(fetchGreeting()).resolves.toEqual({ message: 'Hello' });
  });

  test('returns unauthorized when the response is HTTP 401', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(jsonResponse(401, {}));

    const result = await getGreeting();

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toEqual({ type: 'unauthorized' });
    }
    await expect(fetchGreeting()).rejects.toEqual({ type: 'unauthorized' });
  });

  test('returns invalid-response when the body fails Zod validation', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(jsonResponse(200, { message: 12 }));

    const result = await getGreeting();

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toEqual({ type: 'invalid-response' });
    }
    await expect(fetchGreeting()).rejects.toEqual({ type: 'invalid-response' });
  });
});
