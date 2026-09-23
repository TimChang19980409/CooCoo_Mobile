import { render, screen } from '@testing-library/react-native';

import HomeScreen from '@/app';

jest.mock('@/components/animated-icon', () => ({
  AnimatedIcon: () => null,
}));

describe('HomeScreen', () => {
  test('renders the welcome title', async () => {
    await render(<HomeScreen />);

    expect(screen.getByText(/Welcome to\sExpo/)).toBeTruthy();
  });
});
