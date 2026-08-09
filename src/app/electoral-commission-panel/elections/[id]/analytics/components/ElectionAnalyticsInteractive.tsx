'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';
import { supabase } from '@/lib/supabase';

interface ElectionData {
  id: string;
  name: string;
  description?: string;
  election_type?: string;
  department?: string;
  status: string;
  nomination_start?: string;
  nomination_end?: string;
  voting_start?: string;
  voting_end?: string;
  created_at?: string;
}

interface Position {
  id: string;
  title: string;
  description?: string;
  candidateCount: number;
  application_fee?: number;
}

interface Candidate {
  id: string;
  full_name?: string;
  candidate_name?: string;
  position?: string;
  vote_count?: number;
}

const ElectionAnalyticsInteractive = () => {
  const router = useRouter();
  const params = useParams();
  const electionId = (params?.id as string) || '';
  const [isHydrated, setIsHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [election, setElection] = useState<ElectionData | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [voteStats, setVoteStats] = useState({
    totalVotes: 0,
    totalCandidates: 0,
    totalPositions: 0,
  });

  useEffect(() => {
    if (!electionId) return;
    loadAnalyticsData();
    setIsHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [electionId]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch election details
      const { data: electionData, error: electionError } = await supabase
        .from('elections')
        .select('*')
        .eq('id', electionId)
        .single();

      if (electionError) {
        console.error('Error loading election:', electionError);
        setError('Failed to load election data. Please try again.');
        return;
      }

      if (!electionData) {
        setError('Election not found.');
        return;
      }

      const electionInfo: ElectionData = {
        id: electionData.id,
        name: electionData.name || electionData.title || 'Election',
        description: electionData.description,
        election_type: electionData.election_type,
        department: electionData.department,
        status: electionData.status || 'scheduled',
        nomination_start: electionData.nomination_start,
        nomination_end: electionData.nomination_end,
        voting_start: electionData.voting_start,
        voting_end: electionData.voting_end,
        created_at: electionData.created_at,
      };
      setElection(electionInfo);

      // Fetch positions for this election
      const { data: positionsData, error: positionsError } = await supabase
        .from('positions')
        .select('*')
        .eq('election_id', electionId)
        .order('created_at', { ascending: true });

      if (positionsError) {
        console.error('Error loading positions:', positionsError);
      }

      const positionsList = positionsData || [];
      setPositions(positionsList);

      // Fetch candidates for this election
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('candidates')
        .select('*')
        .eq('election_id', electionId);

      if (candidatesError) {
        console.error('Error loading candidates:', candidatesError);
      }

      const candidatesList = candidatesData || [];
      setCandidates(candidatesList);

      // Fetch vote count for this election
      const { count: totalVotes, error: votesError } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .eq('election_id', electionId);

      if (votesError) {
        console.error('Error loading votes:', votesError);
      }

      // Compute stats
      const positionCounts = await Promise.all(
        positionsList.map(async (pos: any) => {
          const { count } = await supabase
            .from('candidates')
            .select('*', { count: 'exact', head: true })
            .eq('election_id', electionId)
            .eq('position', pos.title);
          return { ...pos, candidateCount: count || 0 };
        })
      );

      setVoteStats({
        totalVotes: totalVotes || 0,
        totalCandidates: candidatesList.length,
        totalPositions: positionsList.length,
      });
      setPositions(positionCounts);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setError('An error occurred while loading analytics data.');
    } finally {
      setLoading(false);
    }
  };

  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/20 text-success';
      case 'completed':
        return 'bg-primary/20 text-primary';
      case 'paused':
        return 'bg-warning/20 text-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        userRole="commission"
        userName="Dr. Akosua Boateng"
        userAvatar="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg"
        electionStatus={{
          isActive: election?.status === 'active',
          name: election?.name || 'Election',
          endTime: election?.voting_end,
        }}
      />

      <main className="pt-24 pb-12 px-4 lg:px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-muted rounded-md transition-all duration-250 ease-smooth"
            >
              <Icon name="ArrowLeftIcon" size={24} variant="outline" className="text-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-heading font-semibold text-foreground">
                Election Analytics
              </h1>
              <p className="text-muted-foreground mt-1">{election?.name || 'Election'}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusBadgeClass(
                election?.status || 'scheduled'
              )}`}
            >
              {election?.status || 'scheduled'}
            </span>
          </div>

          {error ? (
            <div className="bg-card border border-border rounded-md p-12 text-center">
              <Icon
                name="ExclamationTriangleIcon"
                size={48}
                variant="outline"
                className="mx-auto text-error mb-4"
              />
              <p className="text-lg font-medium text-foreground mb-2">
                Failed to load election data
              </p>
              <p className="text-muted-foreground mb-6">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  loadAnalyticsData();
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250 ease-smooth"
              >
                <Icon name="ArrowPathIcon" size={20} variant="outline" />
                <span className="font-medium">Retry</span>
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Election Overview */}
              <div className="bg-card border border-border rounded-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h2 className="text-xl font-heading font-semibold text-foreground mb-2">
                      Election Details
                    </h2>
                    <div className="space-y-2 text-sm">
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Type:</span>{' '}
                        {election?.election_type || 'N/A'}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Department:</span>{' '}
                        {election?.department || 'University-wide'}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Nominations:</span>{' '}
                        {formatDate(election?.nomination_start)} -{' '}
                        {formatDate(election?.nomination_end)}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Voting:</span>{' '}
                        {formatDate(election?.voting_start)} - {formatDate(election?.voting_end)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-heading font-semibold text-foreground mb-2">
                      Quick Stats
                    </h2>
                    <div className="space-y-2 text-sm">
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Total Votes:</span>{' '}
                        {voteStats.totalVotes}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Total Candidates:</span>{' '}
                        {voteStats.totalCandidates}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Total Positions:</span>{' '}
                        {voteStats.totalPositions}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-md p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/20 text-primary rounded-md">
                      <Icon name="CheckCircleIcon" size={24} variant="outline" />
                    </div>
                    <div>
                      <p className="text-3xl font-heading font-semibold text-foreground">
                        {voteStats.totalVotes}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Votes</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-md p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-accent/20 text-accent rounded-md">
                      <Icon name="UserGroupIcon" size={24} variant="outline" />
                    </div>
                    <div>
                      <p className="text-3xl font-heading font-semibold text-foreground">
                        {voteStats.totalCandidates}
                      </p>
                      <p className="text-sm text-muted-foreground">Candidates</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-md p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-success/20 text-success rounded-md">
                      <Icon name="ListBulletIcon" size={24} variant="outline" />
                    </div>
                    <div>
                      <p className="text-3xl font-heading font-semibold text-foreground">
                        {voteStats.totalPositions}
                      </p>
                      <p className="text-sm text-muted-foreground">Positions</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Positions Breakdown */}
              <div className="bg-card border border-border rounded-md p-6">
                <h2 className="text-xl font-heading font-semibold text-foreground mb-6">
                  Positions Breakdown
                </h2>
                {positions.length > 0 ? (
                  <div className="space-y-6">
                    {positions.map((pos) => (
                      <div key={pos.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground">{pos.title}</p>
                          <span className="text-sm text-muted-foreground">
                            {pos.candidateCount} candidates
                          </span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{
                              width: `${positions.length > 0 ? (pos.candidateCount / Math.max(...positions.map((p) => p.candidateCount), 1)) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        {pos.description && (
                          <p className="text-sm text-muted-foreground">{pos.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Icon
                      name="ListBulletIcon"
                      size={48}
                      variant="outline"
                      className="mx-auto text-muted-foreground mb-4"
                    />
                    <p className="text-muted-foreground">
                      No positions have been added to this election yet.
                    </p>
                  </div>
                )}
              </div>

              {/* Candidates */}
              <div className="bg-card border border-border rounded-md p-6">
                <h2 className="text-xl font-heading font-semibold text-foreground mb-6">
                  Candidates
                </h2>
                {candidates.length > 0 ? (
                  <div className="space-y-3">
                    {candidates.map((candidate) => (
                      <div
                        key={candidate.id}
                        className="flex items-center justify-between p-4 bg-muted rounded-md"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                            <span className="font-semibold">
                              {(candidate.full_name || candidate.candidate_name || '?').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {candidate.full_name || candidate.candidate_name || 'Unknown'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {candidate.position || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">
                          {candidate.vote_count || 0} votes
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Icon
                      name="UserGroupIcon"
                      size={48}
                      variant="outline"
                      className="mx-auto text-muted-foreground mb-4"
                    />
                    <p className="text-muted-foreground">
                      No candidates have registered for this election yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ElectionAnalyticsInteractive;