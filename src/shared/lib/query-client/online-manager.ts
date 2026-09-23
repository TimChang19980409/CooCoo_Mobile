import { onlineManager } from '@tanstack/react-query';
import { addNetworkStateListener, getNetworkStateAsync } from 'expo-network';

export function registerQueryOnlineManager() {
  let active = true;

  const applyOnline = (isConnected: boolean | undefined) => {
    if (!active) {
      return;
    }

    onlineManager.setOnline(isConnected ?? false);
  };

  getNetworkStateAsync()
    .then((state) => {
      applyOnline(state.isConnected);
    })
    .catch(() => {
      applyOnline(false);
    });

  const subscription = addNetworkStateListener((state) => {
    applyOnline(state.isConnected);
  });

  return () => {
    active = false;
    subscription.remove();
  };
}
