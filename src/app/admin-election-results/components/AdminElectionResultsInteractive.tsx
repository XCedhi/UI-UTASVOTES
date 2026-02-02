'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';
import { supabase } from '@/lib/supabase';

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

const AdminElectionResultsInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedElection, setSelectedElection] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(false); // Changed from true to false
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeElectionStatus, setActiveElectionStatus] = useState<any>(null);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    setIsHydrated(true);
    fetchUserProfile();
    loadElections();
  }, []);

  // Auto-refresh every 30 seconds for live results (when enabled)
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadElections();
      setLastUpdated(new Date());
    }, 30000); // Changed from 5000 (5 seconds) to 30000 (30 seconds)

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const fetchUserProfile = async () => {
    try {
      // Get current user session
      const { data: { user } } = await supabase.auth.getUser();
      
      let userId: string | null = null;
      
      if (user) {
        console.log('✅ Election Results: User session found:', user.id);
        userId = user.id;
      } else {
        console.log('⚠️ Election Results: No session, using localStorage fallback');
        
        // Fallback to localStorage
        const userEmail = localStorage.getItem('userEmail');
        
        if (!userEmail) {
          console.log('❌ Election Results: No email in localStorage');
          return;
        }

        console.log('✅ Election Results: Using email from localStorage:', userEmail);

        // Get user ID from email
        const { data: userData, error: userError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('email', userEmail)
          .single();

        if (userError || !userData) {
          console.error('❌ Election Results: Error getting user ID from email:', userError);
          return;
        }

        userId = userData.id;
        console.log('✅ Election Results: Got user ID from email:', userId);
      }

      // Fetch user profile using userId
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        console.log('✅ Election Results: Profile loaded:', {
          id: profile.id,
          full_name: profile.full_name,
          avatar_url_length: profile.avatar_url ? profile.avatar_url.length : 0
        });
        setUserProfile(profile);
      }

      // Fetch unread notifications count
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      setNotificationCount(count || 0);

      // Fetch active election for status bar
      const now = new Date().toISOString();
      const { data: elections } = await supabase
        .from('elections')
        .select('*')
        .lte('voting_start', now)
        .gte('voting_end', now)
        .order('voting_start', { ascending: false })
        .limit(1);

      if (elections && elections.length > 0) {
        setActiveElectionStatus({
          isActive: true,
          name: elections[0].name,
          endTime: elections[0].voting_end,
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const loadElections = async () => {
    try {
      setIsLoading(true);

      // Fetch all elections
      const { data: electionsData, error: electionsError } = await supabase
        .from('elections')
        .select('*')
        .order('created_at', { ascending: false });

      if (electionsError) {
        console.error('Error fetching elections:', electionsError);
        setElections([]);
        return;
      }

      if (!electionsData || electionsData.length === 0) {
        setElections([]);
        return;
      }

      // Process each election
      const processedElections: Election[] = await Promise.all(
        electionsData.map(async (election) => {
          // Fetch positions for this election
          const { data: positionsData, error: positionsError } = await supabase
            .from('positions')
            .select('*')
            .eq('election_id', election.id)
            .order('created_at', { ascending: true });

          if (positionsError) {
            console.error('Error fetching positions:', positionsError);
            return null;
          }

          // Process each position
          const positions: Position[] = await Promise.all(
            (positionsData || []).map(async (position) => {
              // Fetch candidates for this position
              const { data: candidatesData, error: candidatesError } = await supabase
                .from('candidates')
                .select('*')
                .eq('election_id', election.id)
                .eq('position', position.title)
                .order('votes', { ascending: false });

              if (candidatesError) {
                console.error('Error fetching candidates:', candidatesError);
                return null;
              }

              // Calculate total votes for this position
              const totalVotes = (candidatesData || []).reduce(
                (sum, candidate) => sum + (candidate.votes || 0),
                0
              );

              // Process candidates
              const candidates: Candidate[] = (candidatesData || []).map((candidate) => {
                const votes = candidate.votes || 0;
                const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;

                return {
                  id: candidate.id,
                  name: candidate.full_name,
                  department: candidate.department,
                  avatar: candidate.avatar || candidate.photo_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
                  votes: votes,
                  percentage: percentage,
                  isWinner: candidate.is_winner || false,
                };
              });

              return {
                id: position.id,
                title: position.title,
                candidates: candidates,
                totalVotes: totalVotes,
              };
            })
          );

          // Determine election status
          const now = new Date();
          const startDate = new Date(election.voting_start);
          const endDate = new Date(election.voting_end);
          
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
            name: election.name,
            status: status,
            startDate: election.voting_start,
            endDate: election.voting_end,
            totalVoters: election.total_voters || 0,
            votedCount: election.voted_count || 0,
            positions: positions.filter((p) => p !== null) as Position[],
          };
        })
      );

      const validElections = processedElections.filter((e) => e !== null) as Election[];
      setElections(validElections);

      // Set first election as selected if none selected
      if (validElections.length > 0 && !selectedElection) {
        setSelectedElection(validElections[0].id);
      }
    } catch (error) {
      console.error('Error loading elections:', error);
      setElections([]);
    } finally {
      setIsLoading(false);
    }
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

  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header userRole="admin" userName="Loading..." notificationCount={0} />
        <main className="pt-24 pb-12 px-4 lg:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="h-96 bg-muted animate-pulse rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  // Show empty state if no elections
  if (elections.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          userRole="admin"
          userName={userProfile?.full_name || 'System Administrator'}
          userAvatar={userProfile?.avatar_url || userProfile?.profile_picture_url}
          notificationCount={notificationCount}
          electionStatus={activeElectionStatus}
        />
        <main className="pt-24 pb-12 px-4 lg:px-6">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
                  Live Election Results
                </h1>
                <p className="text-muted-foreground">
                  Real-time monitoring of all elections with live vote counts
                </p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="ChartBarIcon" size={32} variant="outline" className="text-muted-foreground" />
              </div>
              <h2 className="font-heading font-semibold text-xl text-foreground mb-2">
                No Elections Found
              </h2>
              <p className="text-muted-foreground mb-6">
                There are no elections in the system yet. Create an election to see results here.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        userRole="admin"
        userName={userProfile?.full_name || 'System Administrator'}
        userAvatar={userProfile?.avatar_url || userProfile?.profile_picture_url}
        notificationCount={notificationCount}
        electionStatus={activeElectionStatus}
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

export default AdminElectionResultsInteractive;
