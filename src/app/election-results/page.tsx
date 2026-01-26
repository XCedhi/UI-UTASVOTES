import type { Metadata } from 'next';
import React from 'react';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';
import ProtectedRoute from '@/components/common/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Election Results - UTASVotes',
  description:
    'Access information about how election results are handled and where to find past summaries.',
};

export default function ElectionResultsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header
          userRole="student"
          userName="UTAS Student"
          notificationCount={0}
          electionStatus={{
            isActive: false,
            name: 'No Live Results',
            endTime: '',
          }}
        />

        <main className="pt-24 pb-12 px-4 lg:px-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-warning/10">
                <Icon name="InformationCircleIcon" size={24} variant="outline" />
              </div>
              <div>
                <h1 className="font-heading text-2xl font-semibold text-foreground">
                  Election Results Access
                </h1>
                <p className="text-muted-foreground">
                  Live election results are only visible to the Electoral Commission and Admin.
                  Students can view summaries of completed elections.
                </p>
              </div>
            </div>

            <div className="p-4 bg-card border border-border rounded-md space-y-4">
              <p className="text-sm text-muted-foreground">
                To view past election summaries and statistics, use the button below.
              </p>
              <a
                href="/student-election-results"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors duration-200"
              >
                <Icon name="ChartBarIcon" size={16} variant="outline" />
                Go to Past Results
              </a>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
