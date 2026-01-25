'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ElectionProvider } from '@/contexts/ElectionContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ElectionProvider>{children}</ElectionProvider>
    </AuthProvider>
  );
}
