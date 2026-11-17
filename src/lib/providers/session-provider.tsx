'use client';

import { useEffect, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { setUnauthorizedHandler } from '@/lib/api/client';
import { endSession } from '@/lib/auth/viewer-queries';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Keeps the stored login honest. A token that expired would otherwise stay in
 * localStorage while the store shows the customer as logged in. Any 401 on a
 * request that sent the token logs out once, and a token found on load is
 * checked right away.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      // Several requests can fail together; log out only once.
      if (!useAuthStore.getState().isAuthenticated && !localStorage.getItem('token')) return;
      endSession(queryClient);
    });

    if (localStorage.getItem('token')) {
      authApi
        .getProfile()
        .then((response) => useAuthStore.getState().updateUser(response.data))
        .catch(() => {
          // A 401 already ran the handler; anything else (offline) keeps the session.
        });
    }

    return () => setUnauthorizedHandler(() => {});
  }, [queryClient]);

  return <>{children}</>;
}
