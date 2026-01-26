'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getUserSession, canAccessRoute, getRoleDashboard } from '@/lib/auth-utils';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const session = getUserSession();

    // Not logged in - redirect to login
    if (!session) {
      router.push('/login');
      return;
    }

    // Check if user can access this route
    if (!canAccessRoute(session.role, pathname)) {
      // Redirect to appropriate dashboard
      router.push(getRoleDashboard(session.role));
      return;
    }

    setIsAuthorized(true);
  }, [pathname, router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
