'use client';

import React from 'react';
import Header from '@/components/common/Header';
import VotingInterfaceInteractive from './components/VotingInterfaceInteractive';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { useUserProfile } from '@/hooks/useUserProfile';

export default function VotingInterfacePage() {
  const { profile, loading } = useUserProfile();

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Header
            userRole="student"
            userName="Loading..."
            notificationCount={0}
          />
          <main className="pt-24 pb-12">
            <div className="mx-4 lg:mx-6">
              <div className="max-w-7xl mx-auto">
                <div className="h-96 bg-muted animate-pulse rounded-lg" />
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header
          userRole={(profile?.role as 'student' | 'candidate' | 'commission' | 'admin') || 'student'}
          userName={profile?.full_name || 'Student'}
          userAvatar={profile?.avatar_url}
          notificationCount={3}
          electionStatus={{
            isActive: true,
            name: 'Student Council Elections 2026',
            endTime: '2026-02-15T23:59:59',
          }}
        />

        <main className="pt-24 pb-12">
          <div className="mx-4 lg:mx-6">
            <div className="max-w-7xl mx-auto">
              <VotingInterfaceInteractive />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
