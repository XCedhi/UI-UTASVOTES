'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface Candidate {
  id: string;
  name: string;
  position: string;
  votes: number;
  percentage: number;
  image: string;
  isWinner: boolean;
}

interface Election {
  id: string;
  title: string;
  status: 'completed' | 'ongoing' | 'upcoming';
  endDate: string;
  totalVotes: number;
  candidates: Candidate[];
}

const StudentElectionResultsInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedElection, setSelectedElection] = useState<string>('');

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const elections: Election[] = [
    {
      id: '1',
      title: 'Student Union President 2026',
      status: 'completed',
      endDate: '2026-01-20',
      totalVotes: 4850,
      candidates: [
        {
          id: '1',
          name: 'Kwame Mensah',
          position: 'President',
          votes: 2145,
          percentage: 44.23,
          image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
          isWinner: true,
        },
        {
          id: '2',
          name: 'Ama Osei',
          position: 'President',
          votes: 1823,
          percentage: 37.59,
          image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
          isWinner: false,
        },
        {
          id: '3',
          name: 'Kofi Asante',
          position: 'President',
          votes: 882,
          percentage: 18.18,
          image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
          isWinner: false,
        },
      ],
    },
  ];

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <Header userRole="student" userName="Loading..." notificationCount={0} />
        <main className="pt-24 pb-12 px-4 lg:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="h-96 bg-muted animate-pulse rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        userRole="student"
        userName="John Mensah"
        userAvatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
        notificationCount={3}
      />

      <main className="pt-24 pb-12 px-4 lg:px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
              Election Results
            </h1>
            <p className="text-muted-foreground">
              View official results from completed UTAS elections
            </p>
          </div>

          {elections.map((election) => (
            <div key={election.id} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-heading font-semibold text-xl text-foreground mb-1">
                    {election.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Total Votes: {election.totalVotes.toLocaleString()}
                  </p>
                </div>
                <span className="px-4 py-2 bg-success/10 text-success rounded-md text-sm font-medium">
                  Completed
                </span>
              </div>

              <div className="space-y-4">
                {election.candidates.map((candidate, index) => (
                  <div
                    key={candidate.id}
                    className={`p-4 border-2 rounded-lg transition-all duration-250 ${
                      candidate.isWinner
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-background'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-muted-foreground w-8">
                        #{index + 1}
                      </div>
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-muted">
                        <AppImage
                          src={candidate.image}
                          alt={candidate.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-heading font-semibold text-lg text-foreground">
                            {candidate.name}
                          </h3>
                          {candidate.isWinner && (
                            <Icon name="CheckBadgeIcon" size={24} variant="solid" className="text-primary" />
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{candidate.votes.toLocaleString()} votes</span>
                          <span>•</span>
                          <span>{candidate.percentage.toFixed(2)}%</span>
                        </div>
                      </div>
                      <div className="w-32">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${candidate.isWinner ? 'bg-primary' : 'bg-muted-foreground'}`}
                            style={{ width: `${candidate.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default StudentElectionResultsInteractive;
