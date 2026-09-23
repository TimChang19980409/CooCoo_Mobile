import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { NicknameForm } from '@/features/update-nickname';

jest.mock('@/shared/ui', () => {
  const { Text } = require('react-native');

  return {
    ThemedText: ({ children }: { children?: ReactNode }) => (
      <Text>{children}</Text>
    ),
  };
});

function renderForm() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Number.POSITIVE_INFINITY },
      mutations: { retry: false, gcTime: Number.POSITIVE_INFINITY },
    },
  });

  return render(
    <QueryClientProvider client={client}>
      <NicknameForm />
    </QueryClientProvider>,
  );
}

describe('NicknameForm', () => {
  test('rejects an empty nickname', async () => {
    await renderForm();

    fireEvent.press(screen.getByTestId('nickname-submit'));

    expect(await screen.findByText('Nickname is required')).toBeTruthy();
  });
});
