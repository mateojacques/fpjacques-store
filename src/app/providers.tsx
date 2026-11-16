'use client';

import type { ReactNode } from 'react';
import { QueryProvider, SessionProvider, StorefrontProvider } from '@/lib/providers';
import { ToastProvider } from '@/components/ui';
import { ThemeStyles } from '@/components/theme';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <SessionProvider>
        <StorefrontProvider>
          <ThemeStyles />
          <ToastProvider>
            {children}
          </ToastProvider>
        </StorefrontProvider>
      </SessionProvider>
    </QueryProvider>
  );
}
