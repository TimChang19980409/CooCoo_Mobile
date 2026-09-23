import { focusManager } from '@tanstack/react-query';
import { AppState, type AppStateStatus } from 'react-native';

export function registerQueryFocusManager() {
  const onChange = (status: AppStateStatus) => {
    focusManager.setFocused(status === 'active');
  };
  const subscription = AppState.addEventListener('change', onChange);

  return () => {
    subscription.remove();
  };
}
