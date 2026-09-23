import { HttpResponse, http } from 'msw';

import { fetchGreeting, getGreeting } from '@/entities/greeting';
import { server } from '@/shared/api/mocks/node';

describe('greeting API', () => {
  test('returns the message from the MSW handler', async () => {
    const result = await getGreeting();

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toEqual({ message: 'Hello from CooCoo' });
    }
    await expect(fetchGreeting()).resolves.toEqual({
      message: 'Hello from CooCoo',
    });
  });

  test('returns unauthorized when the response is HTTP 401', async () => {
    server.use(
      http.get('*/api/greeting', () => new HttpResponse(null, { status: 401 })),
    );

    const result = await getGreeting();

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toEqual({ type: 'unauthorized' });
    }
    await expect(fetchGreeting()).rejects.toEqual({ type: 'unauthorized' });
  });

  test('returns invalid-response when the body fails Zod validation', async () => {
    server.use(
      http.get('*/api/greeting', () => HttpResponse.json({ message: 12 })),
    );

    const result = await getGreeting();

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toEqual({ type: 'invalid-response' });
    }
    await expect(fetchGreeting()).rejects.toEqual({ type: 'invalid-response' });
  });
});
