import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import HomeScreen from '@/app';

jest.mock('@/shared/ui', () => {
  const { Text, View } = require('react-native');

  return {
    AnimatedIcon: () => null,
    HintRow: ({ hint }: { hint: ReactNode }) => hint,
    ThemedText: ({ children }: { children?: ReactNode }) => (
      <Text>{children}</Text>
    ),
    ThemedView: ({ children }: { children?: ReactNode }) => (
      <View>{children}</View>
    ),
    WebBadge: () => null,
  };
});

describe('HomeScreen', () => {
  test('renders the welcome title', async () => {
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: Number.POSITIVE_INFINITY },
      },
    });

    await render(
      <QueryClientProvider client={client}>
        <HomeScreen />
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Welcome to\sExpo/)).toBeTruthy();
    expect(await screen.findByText('Hello from CooCoo')).toBeTruthy();
  });
});
