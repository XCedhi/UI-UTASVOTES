'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ElectionProvider } from '@/contexts/ElectionContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ElectionProvider>{children}</ElectionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
