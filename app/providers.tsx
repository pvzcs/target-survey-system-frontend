'use client';

import { AuthProvider } from '@/lib/contexts/auth-context';
import { ToastProvider } from '@/lib/contexts/toast-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>{children}</AuthProvider>
    </ToastProvider>
  );
}
