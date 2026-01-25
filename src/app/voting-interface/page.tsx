import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import VotingInterfaceInteractive from './components/VotingInterfaceInteractive';
import ProtectedRoute from '@/components/common/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Voting Interface - UTASVotes',
  description:
    'Cast your secure ballot for departmental and university-wide elections at University of Technical and Applied Sciences with complete transparency and verification.',
};

export default function VotingInterfacePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header
          userRole="student"
          userName="John Mensah"
          userAvatar="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg"
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
