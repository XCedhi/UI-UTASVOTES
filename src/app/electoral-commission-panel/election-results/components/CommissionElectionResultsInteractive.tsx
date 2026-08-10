'use client';

import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';
import { getUserSession } from '@/lib/auth-utils';
import { resolveCandidatePhoto, PLACEHOLDER_AVATAR } from '@/lib/candidate-photo';

interface Election {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'scheduled';
  startDate: string;
  endDate: string;
  totalVoters: number;
  votedCount: number;
  positions: Position[];
  isCertified?: boolean;
  certifiedAt?: string;
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
  const [selectedElection, setSelectedElection] = useState('');
  // Tracks the user's chosen election across auto-refresh cycles so the 5s
  // refresh never silently resets the selection back to the first election.
  const selectedElectionRef = useRef<string>('');
  const [userAvatar, setUserAvatar] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [elections, setElections] = useState<Election[]>([]);
  const [isCertifying, setIsCertifying] = useState(false);

  useEffect(() => {
    setIsHydrated(true);

    const session = getUserSession();
    if (session) {
      setUserName(session.name);
      setUserAvatar(session.avatar || '');
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

  const loadElections = async () => {
    try {
      // Import supabase client
      const { supabase } = await import('@/lib/supabase');

      // Fetch all elections from database
      const { data: electionsData, error: electionsError } = await supabase
        .from('elections')
        .select('*')
        .order('created_at', { ascending: false });

      if (electionsError || !electionsData) {
        console.error('Error fetching elections:', electionsError);
        setElections([]);
        return;
      }

      // Fetch authoritative live tallies from the votes table (server-side,
      // bypasses RLS). Falls back to counter columns if unavailable.
      let liveResults: Record<
        string,
        { total: number; candidates: Record<string, number> }
      > = {};
      try {
        const res = await fetch('/api/results', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          liveResults = data.elections || {};
        }
      } catch (err) {
        console.error('Error fetching live results:', err);
      }

      // Process each election with its candidates
      const processedElections: Election[] = await Promise.all(
        electionsData.map(async (election) => {
          // Fetch candidates for this election
          const { data: candidatesData, error: candidatesError } = await supabase
            .from('candidates')
            .select('*')
            .eq('election_id', election.id)
            .eq('status', 'approved')
            .order('votes', { ascending: false });

          if (candidatesError) {
            console.error('Error fetching candidates:', candidatesError);
            return null;
          }

          // Live tallies for this election (from the votes table, authoritative).
          const live = liveResults[election.id];

          // Group candidates by position
          const candidatesByPosition = (candidatesData || []).reduce(
            (acc: any, candidate: any) => {
              const position = candidate.position || 'General Position';
              if (!acc[position]) {
                acc[position] = [];
              }
              acc[position].push(candidate);
              return acc;
            },
            {}
          );

          // Create positions array
          const positions: Position[] = Object.entries(candidatesByPosition).map(
            ([positionTitle, candidates]: any) => {
              // Use real vote counts from the votes table when available; the
              // denormalized counter column is only a fallback.
              const totalVotes = live
                ? candidates.reduce(
                    (sum: number, c: any) => sum + (live.candidates[c.id] || 0),
                    0
                  )
                : candidates.reduce((sum: number, c: any) => sum + (c.votes || 0), 0);

              return {
                id: `pos-${positionTitle}`,
                title: positionTitle,
                totalVotes,
                candidates: candidates.map((candidate: any, index: number) => {
                  const candidateVotes = live
                    ? live.candidates[candidate.id] || 0
                    : candidate.votes || 0;

                  return {
                    id: candidate.id,
                    name: candidate.full_name || candidate.name || 'Unknown Candidate',
                    department: candidate.department || 'N/A',
                    avatar: resolveCandidatePhoto(candidate.avatar || candidate.photo_url),
                    votes: candidateVotes,
                    percentage: totalVotes > 0 ? (candidateVotes / totalVotes) * 100 : 0,
                    isWinner: index === 0 && candidateVotes > 0,
                  };
                }),
              };
            }
          );

          // Determine election status
          const now = new Date();
          const startDate = new Date(election.voting_start || election.start_date);
          const endDate = new Date(election.voting_end || election.end_date);

          let status: 'active' | 'completed' | 'scheduled';
          if (now < startDate) {
            status = 'scheduled';
          } else if (now >= startDate && now <= endDate) {
            status = 'active';
          } else {
            status = 'completed';
          }

          return {
            id: election.id,
            name: election.name || election.title || 'Election',
            status,
            startDate: (election.voting_start || election.start_date).toString(),
            endDate: (election.voting_end || election.end_date).toString(),
            totalVoters: election.total_voters || 0,
            votedCount: (live?.total ?? election.voted_count) || 0,
            positions,
            isCertified: Boolean(election.is_certified),
            certifiedAt: election.certified_at || undefined,
          };
        })
      );

      // Filter out null values
      const validElections = processedElections.filter((e): e is Election => e !== null);
      setElections(validElections);

      // Set initial selected election (only the first time, or if the chosen
      // election no longer exists). A ref is used so the 5-second auto-refresh
      // never silently resets the selection back to the first election.
      if (validElections.length > 0) {
        const keep = validElections.find((e) => e.id === selectedElectionRef.current);
        const nextId = (keep || validElections[0]).id;
        selectedElectionRef.current = nextId;
        setSelectedElection(nextId);
      }
    } catch (error) {
      console.error('Error loading elections:', error);
      setElections([]);
    }
  };

  const handleExport = (format: string) => {
    alert(`Exporting results as ${format.toUpperCase()}`);
  };

  const handleCertify = async () => {
    const election = currentElection;
    if (!election) {
      alert('Please select an election to certify first.');
      return;
    }
    if (election.isCertified) {
      alert(`Results for "${election.name}" have already been certified and sent.`);
      return;
    }
    if (
      !window.confirm(
        `Certify the final results for "${election.name}" and send them to all students (in-app notification + email)?`
      )
    ) {
      return;
    }

    setIsCertifying(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const res = await fetch('/api/elections/certify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ electionId: election.id }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.error || 'Failed to certify results. Please try again.');
        return;
      }

      alert(data.message || 'Results certified and sent to all students.');

      // Refresh so the election is marked as certified in the UI.
      await loadElections();
    } catch (error) {
      console.error('Error certifying election:', error);
      alert('Failed to certify results. Please try again.');
    } finally {
      setIsCertifying(false);
    }
  };

  const currentElection = elections.find((e) => e.id === selectedElection);
  const turnoutPercentage =
    currentElection && currentElection.totalVoters > 0
      ? ((currentElection.votedCount / currentElection.totalVoters) * 100).toFixed(2)
      : '0';

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <Header userRole="commission" userName="Loading..." />
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
        userAvatar={userAvatar}
        notificationCount={0}
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
                disabled={!currentElection || currentElection.isCertified || isCertifying}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250 ease-smooth shadow-md disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-primary"
              >
                <Icon
                  name={isCertifying ? 'ArrowPathIcon' : 'CheckBadgeIcon'}
                  size={20}
                  variant="outline"
                  className={isCertifying ? 'animate-spin' : ''}
                />
                {isCertifying
                  ? 'Certifying…'
                  : currentElection?.isCertified
                    ? 'Certified ✓'
                    : 'Certify & Send'}
              </button>
            </div>
          </div>

          {/* Election Selector */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-4 overflow-x-auto">
              {elections.map((election) => (
                <button
                  key={election.id}
                  onClick={() => {
                    selectedElectionRef.current = election.id;
                    setSelectedElection(election.id);
                  }}
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
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_AVATAR;
                                  }}
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
