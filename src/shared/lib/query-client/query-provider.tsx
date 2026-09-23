import { QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useEffect } from 'react';

import { registerQueryFocusManager } from './focus-manager';
import { registerQueryOnlineManager } from './online-manager';
import { queryClient } from './query-client';

type QueryProviderProps = {
  children: ReactNode;
};

export function QueryProvider({ children }: QueryProviderProps) {
  useEffect(() => {
    const unsubscribeFocus = registerQueryFocusManager();
    const unsubscribeOnline = registerQueryOnlineManager();

    return () => {
      unsubscribeFocus();
      unsubscribeOnline();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
