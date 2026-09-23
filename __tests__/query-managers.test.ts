import { focusManager, onlineManager } from '@tanstack/react-query';
import { AppState } from 'react-native';

import { registerQueryFocusManager } from '@/shared/lib/query-client';

jest.mock('expo-network', () => ({
  getNetworkStateAsync: jest.fn(),
  addNetworkStateListener: jest.fn(),
}));

import { addNetworkStateListener, getNetworkStateAsync } from 'expo-network';

import { registerQueryOnlineManager } from '@/shared/lib/query-client';

describe('query app state', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('updates focus and removes the AppState listener', () => {
    const listeners: Array<(status: string) => void> = [];
    const remove = jest.fn();
    jest
      .spyOn(AppState, 'addEventListener')
      .mockImplementation((_type, listener) => {
        listeners.push(listener as (status: string) => void);
        return { remove } as ReturnType<typeof AppState.addEventListener>;
      });

    const unsubscribe = registerQueryFocusManager();
    listeners[0]?.('background');
    expect(focusManager.isFocused()).toBe(false);
    listeners[0]?.('active');
    expect(focusManager.isFocused()).toBe(true);

    unsubscribe();
    expect(remove).toHaveBeenCalledTimes(1);
  });

  test('treats a rejected network read as offline and removes the listener', async () => {
    const remove = jest.fn();
    jest
      .mocked(getNetworkStateAsync)
      .mockRejectedValue(new Error('unavailable'));
    jest.mocked(addNetworkStateListener).mockReturnValue({
      remove,
    } as ReturnType<typeof addNetworkStateListener>);

    const unsubscribe = registerQueryOnlineManager();
    await Promise.resolve();
    await Promise.resolve();

    expect(onlineManager.isOnline()).toBe(false);
    unsubscribe();
    expect(remove).toHaveBeenCalledTimes(1);
  });
});
