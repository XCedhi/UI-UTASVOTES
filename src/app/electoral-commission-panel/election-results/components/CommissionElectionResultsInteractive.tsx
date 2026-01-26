'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';
import { getUserSession } from '@/lib/auth-utils';

interface Election {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'scheduled';
  startDate: string;
  endDate: string;
  totalVoters: number;
  votedCount: number;
  positions: Position[];
}

interface Position {
  id: string;
  title: string;
  candidates: Candidate[];
  totalVotes: number;
}

interface Candidate {
  id: string;
  name: string;
  department: string;
  avatar: string;
  votes: number;
  percentage: number;
  isWinner: boolean;
}

const CommissionElectionResultsInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [userName, setUserName] = useState('Commission Member');
  const [selectedElection, setSelectedElection] = useState('election-1');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [elections, setElections] = useState<Election[]>([]);

  useEffect(() => {
    setIsHydrated(true);

    const session = getUserSession();
    if (session) {
      setUserName(session.name);
    }

    loadElections();
  }, []);

  // Auto-refresh every 5 seconds for live results
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadElections();
      setLastUpdated(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadElections = () => {
    // Mock data - in production, this would fetch from Supabase
    const mockElections: Election[] = [
      {
        id: 'election-1',
        name: 'Student Council Elections 2026',
        status: 'active',
        startDate: '2026-01-20T08:00:00',
        endDate: '2026-01-25T18:00:00',
        totalVoters: 5420,
        votedCount: 4228,
        positions: [
          {
            id: 'pos-1',
            title: 'SRC President',
            totalVotes: 4228,
            candidates: [
              {
                id: 'c1',
                name: 'Kwame Mensah',
                department: 'Computer Science',
                avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
                votes: 1870,
                percentage: 44.23,
                isWinner: true,
              },
              {
                id: 'c2',
                name: 'Ama Osei',
                department: 'Business Administration',
                avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
                votes: 1589,
                percentage: 37.59,
                isWinner: false,
              },
              {
                id: 'c3',
                name: 'Kofi Asante',
                department: 'Engineering',
                avatar: 'https://images.pixabay.com/photo/2016/11/21/12/42/beard-1845166_1280.jpg',
                votes: 769,
                percentage: 18.18,
                isWinner: false,
              },
            ],
          },
          {
            id: 'pos-2',
            title: 'Vice President',
            totalVotes: 4228,
            candidates: [
              {
                id: 'c4',
                name: 'Abena Adjei',
                department: 'Medicine',
                avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
                votes: 2114,
                percentage: 50.02,
                isWinner: true,
              },
              {
                id: 'c5',
                name: 'Yaw Owusu',
                department: 'Law',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
                votes: 2114,
                percentage: 49.98,
                isWinner: false,
              },
            ],
          },
          {
            id: 'pos-3',
            title: 'General Secretary',
            totalVotes: 4228,
            candidates: [
              {
                id: 'c6',
                name: 'Akua Boateng',
                department: 'Economics',
                avatar: 'https://images.pixabay.com/photo/2017/08/01/08/29/woman-2563491_1280.jpg',
                votes: 2537,
                percentage: 60.01,
                isWinner: true,
              },
              {
                id: 'c7',
                name: 'Emmanuel Darko',
                department: 'Political Science',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
                votes: 1691,
                percentage: 39.99,
                isWinner: false,
              },
            ],
          },
        ],
      },
      {
        id: 'election-2',
        name: 'Faculty Representatives 2026',
        status: 'completed',
        startDate: '2026-01-10T08:00:00',
        endDate: '2026-01-15T18:00:00',
        totalVoters: 3200,
        votedCount: 2464,
        positions: [
          {
            id: 'pos-4',
            title: 'Faculty of Science Rep',
            totalVotes: 2464,
            candidates: [
              {
                id: 'c8',
                name: 'Nana Agyeman',
                department: 'Chemistry',
                avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a',
                votes: 1478,
                percentage: 59.98,
                isWinner: true,
              },
              {
                id: 'c9',
                name: 'Efua Mensah',
                department: 'Physics',
                avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
                votes: 986,
                percentage: 40.02,
                isWinner: false,
              },
            ],
          },
        ],
      },
    ];

    setElections(mockElections);
  };

  const handleExport = (format: string) => {
    alert(`Exporting results as ${format.toUpperCase()}`);
  };

  const handleCertify = () => {
    alert('Results certified and emails sent to all students');
  };

  const currentElection = elections.find((e) => e.id === selectedElection);
  const turnoutPercentage = currentElection
    ? ((currentElection.votedCount / currentElection.totalVoters) * 100).toFixed(2)
    : '0';

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <Header userRole="commission" userName="Loading..." notificationCount={0} />
        <main className="pt-24 pb-12 px-4 lg:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="h-96 bg-muted animate-pulse rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        userRole="commission"
        userName={userName}
        userAvatar="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg"
        notificationCount={5}
        electionStatus={
          currentElection?.status === 'active'
            ? {
                isActive: true,
                name: currentElection.name,
                endTime: currentElection.endDate,
              }
            : undefined
        }
      />

      <main className="pt-24 pb-12 px-4 lg:px-6">
        <div className="max-w-[1400px] mx-auto space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
                Live Election Results
              </h1>
              <p className="text-muted-foreground">
                Real-time monitoring of all elections with live vote counts
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-250 ${
                  autoRefresh
                    ? 'bg-success/10 text-success border border-success/20'
                    : 'bg-muted text-foreground'
                }`}
              >
                <Icon
                  name={autoRefresh ? 'ArrowPathIcon' : 'PauseIcon'}
                  size={20}
                  variant="outline"
                  className={autoRefresh ? 'animate-spin' : ''}
                />
                {autoRefresh ? 'Live' : 'Paused'}
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-all duration-250"
              >
                <Icon name="DocumentArrowDownIcon" size={20} variant="outline" />
                Export PDF
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-all duration-250"
              >
                <Icon name="TableCellsIcon" size={20} variant="outline" />
                Export CSV
              </button>
              <button
                onClick={handleCertify}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250 ease-smooth shadow-md"
              >
                <Icon name="CheckBadgeIcon" size={20} variant="outline" />
                Certify & Send
              </button>
            </div>
          </div>

          {/* Election Selector */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-4 overflow-x-auto">
              {elections.map((election) => (
                <button
                  key={election.id}
                  onClick={() => setSelectedElection(election.id)}
                  className={`flex-shrink-0 px-6 py-3 rounded-md transition-all duration-250 ${
                    selectedElection === election.id
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-sm">{election.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            election.status === 'active'
                              ? 'bg-success/20 text-success'
                              : election.status === 'completed'
                                ? 'bg-muted text-muted-foreground'
                                : 'bg-warning/20 text-warning'
                          }`}
                        >
                          {election.status === 'active' && (
                            <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                          )}
                          {election.status}
                        </span>
                        <span className="text-xs opacity-70">
                          {election.votedCount.toLocaleString()} votes
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {currentElection && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Icon
                      name="ChartBarIcon"
                      size={24}
                      variant="outline"
                      className="text-primary"
                    />
                    {currentElection.status === 'active' && (
                      <span className="flex items-center gap-1 text-xs text-success">
                        <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                        Live
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-heading font-bold text-foreground mb-1">
                    {currentElection.votedCount.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Votes Cast</p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Icon name="UsersIcon" size={24} variant="outline" className="text-success" />
                  </div>
                  <p className="text-2xl font-heading font-bold text-foreground mb-1">
                    {turnoutPercentage}%
                  </p>
                  <p className="text-sm text-muted-foreground">Voter Turnout</p>
                  <div className="mt-2 w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-success h-2 rounded-full transition-all duration-500"
                      style={{ width: `${turnoutPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Icon
                      name="CheckBadgeIcon"
                      size={24}
                      variant="outline"
                      className="text-accent"
                    />
                  </div>
                  <p className="text-2xl font-heading font-bold text-foreground mb-1">
                    {currentElection.positions.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Positions</p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Icon name="ClockIcon" size={24} variant="outline" className="text-warning" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">Last Updated</p>
                  <p className="text-xs text-muted-foreground font-caption">
                    {lastUpdated.toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* Position Results */}
              {currentElection.positions.map((position) => (
                <div
                  key={position.id}
                  className="bg-card border border-border rounded-lg overflow-hidden"
                >
                  <div className="p-6 border-b border-border bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-heading font-semibold text-xl text-foreground">
                          {position.title}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          {position.totalVotes.toLocaleString()} total votes •{' '}
                          {position.candidates.length} candidates
                        </p>
                      </div>
                      {currentElection.status === 'active' && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 text-success rounded-full">
                          <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                          <span className="text-sm font-medium">Live Results</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {position.candidates
                      .sort((a, b) => b.votes - a.votes)
                      .map((candidate, index) => (
                        <div
                          key={candidate.id}
                          className={`relative p-6 rounded-lg border transition-all duration-300 ${
                            candidate.isWinner
                              ? 'bg-success/5 border-success/30 shadow-md'
                              : 'bg-muted/30 border-border hover:border-border/60'
                          }`}
                        >
                          <div className="flex items-center gap-6">
                            {/* Rank */}
                            <div className="flex-shrink-0">
                              <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center font-heading font-bold text-lg ${
                                  index === 0
                                    ? 'bg-accent text-accent-foreground'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                #{index + 1}
                              </div>
                            </div>

                            {/* Avatar */}
                            <div className="flex-shrink-0">
                              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border">
                                <img
                                  src={candidate.avatar}
                                  alt={candidate.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-heading font-semibold text-lg text-foreground">
                                  {candidate.name}
                                </h3>
                                {candidate.isWinner && (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-success text-success-foreground rounded-full text-xs font-medium">
                                    <Icon name="TrophyIcon" size={14} variant="solid" />
                                    Winner
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                {candidate.department}
                              </p>

                              {/* Vote Progress Bar */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-medium text-foreground">
                                    {candidate.votes.toLocaleString()} votes
                                  </span>
                                  <span className="font-data text-foreground font-semibold">
                                    {candidate.percentage.toFixed(2)}%
                                  </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                                  <div
                                    className={`h-3 rounded-full transition-all duration-500 ${
                                      candidate.isWinner
                                        ? 'bg-gradient-to-r from-success to-success/80'
                                        : 'bg-gradient-to-r from-primary to-primary/80'
                                    }`}
                                    style={{ width: `${candidate.percentage}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Detailed Table View */}
                  <div className="border-t border-border">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/30">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Rank
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Candidate
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Department
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Votes
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Percentage
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {position.candidates
                            .sort((a, b) => b.votes - a.votes)
                            .map((candidate, index) => (
                              <tr
                                key={candidate.id}
                                className={`hover:bg-muted/20 transition-colors duration-200 ${
                                  candidate.isWinner ? 'bg-success/5' : ''
                                }`}
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                                  #{index + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                                  {candidate.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                  {candidate.department}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground text-right font-data">
                                  {candidate.votes.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground text-right font-data font-semibold">
                                  {candidate.percentage.toFixed(2)}%
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  {candidate.isWinner ? (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-success/10 text-success rounded-full text-xs font-medium">
                                      <Icon name="CheckBadgeIcon" size={16} variant="solid" />
                                      Winner
                                    </span>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">—</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default CommissionElectionResultsInteractive;
