'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getUserSession, canAccessRoute, getRoleDashboard } from '@/lib/auth-utils';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verifyAccess = () => {
      try {
        // Get session from localStorage (simple and reliable)
        const session = getUserSession();

        // Not logged in - redirect to login
        if (!session) {
          console.log('❌ No session found - redirecting to login');
          router.push('/login');
          setIsChecking(false);
          return;
        }

        // Check if user can access this route
        if (!canAccessRoute(session.role, pathname)) {
          console.log(`⚠️ User (${session.role}) cannot access ${pathname}`);
          // Redirect to appropriate dashboard
          router.push(getRoleDashboard(session.role));
          setIsChecking(false);
          return;
        }

        console.log(`✅ Access granted for ${session.role} to ${pathname}`);
        setIsAuthorized(true);
        setIsChecking(false);
      } catch (error) {
        console.error('❌ Error during access verification:', error);
        router.push('/login');
        setIsChecking(false);
      }
    };

    verifyAccess();
  }, [pathname, router]);

  if (isChecking || !isAuthorized) {
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
