import { HttpResponse, http } from 'msw';

export const handlers = [
  http.get('*/api/greeting', () => {
    return HttpResponse.json({ message: 'Hello from CooCoo' });
  }),
  http.post('*/api/nickname', async ({ request }) => {
    const body = (await request.json()) as { nickname?: string };

    return HttpResponse.json({ nickname: body.nickname ?? '' });
  }),
];
