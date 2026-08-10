'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/lib/supabase';
import { resolveCandidatePhoto } from '@/lib/candidate-photo';

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
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [highlightElectionId, setHighlightElectionId] = useState<string | null>(null);
  const { profile, loading: profileLoading } = useUserProfile();

  useEffect(() => {
    setIsHydrated(true);
    fetchCompletedElections();

    // Deep link from a "certified results" notification:
    // /student-election-results?election=<electionId>
    const params = new URLSearchParams(window.location.search);
    const electionId = params.get('election');
    if (electionId) {
      setHighlightElectionId(electionId);
    }
  }, []);

  // When the deep-linked election is loaded, scroll its card into view and
  // briefly highlight it so the student lands right on their certified results.
  useEffect(() => {
    if (!highlightElectionId || elections.length === 0) return;

    const card = document.getElementById(`election-card-${highlightElectionId}`);
    if (!card) return;

    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const timer = setTimeout(() => setHighlightElectionId(null), 5000);
    return () => clearTimeout(timer);
  }, [elections, highlightElectionId]);

  const fetchCompletedElections = async () => {
    try {
      // Fetch only completed elections
      const { data: electionsData, error: electionsError } = await supabase
        .from('elections')
        .select('*')
        .eq('status', 'completed')
        .order('end_date', { ascending: false });

      if (electionsError) {
        console.error('Error fetching elections:', electionsError);
        setLoading(false);
        return;
      }

      if (!electionsData || electionsData.length === 0) {
        setElections([]);
        setLoading(false);
        return;
      }

      // Fetch candidates for each election
      const electionsWithCandidates = await Promise.all(
        electionsData.map(async (election) => {
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

          // Calculate total votes and percentages
          const totalVotes = candidatesData?.reduce((sum, c) => sum + (c.votes || 0), 0) || 0;
          
          const candidates: Candidate[] = (candidatesData || []).map((c, index) => ({
            id: c.id,
            name: c.full_name || c.name || 'Unknown Candidate',
            position: c.position || election.position || 'Candidate',
            votes: c.votes || 0,
            percentage: totalVotes > 0 ? ((c.votes || 0) / totalVotes) * 100 : 0,
            image: resolveCandidatePhoto(c.avatar || c.photo_url),
            isWinner: index === 0 && (c.votes || 0) > 0, // First candidate with votes is winner
          }));

          return {
            id: election.id,
            title: election.title || 'Election',
            status: 'completed' as const,
            endDate: election.end_date || '',
            totalVotes,
            candidates,
          };
        })
      );

      // Filter out null values and set elections
      const validElections = electionsWithCandidates.filter((e): e is Election => e !== null);
      setElections(validElections);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching election results:', error);
      setLoading(false);
    }
  };

  if (!isHydrated || profileLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          userRole={(profile?.role as 'student' | 'candidate' | 'commission' | 'admin') || 'student'} 
          userName={profile?.full_name || 'Loading...'} 
          userAvatar={profile?.avatar_url}
          notificationCount={0} 
        />
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
        userRole={(profile?.role as 'student' | 'candidate' | 'commission' | 'admin') || 'student'}
        userName={profile?.full_name || 'Student'}
        userAvatar={profile?.avatar_url}
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

          {elections.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <Icon
                name="ChartBarIcon"
                size={64}
                variant="outline"
                className="mx-auto text-muted-foreground mb-4"
              />
              <h3 className="font-heading font-semibold text-xl text-foreground mb-2">
                No Completed Elections
              </h3>
              <p className="text-muted-foreground">
                Results will appear here once elections are completed
              </p>
            </div>
          ) : (
            elections.map((election) => (
              <div
                key={election.id}
                id={`election-card-${election.id}`}
                className={`bg-card border rounded-lg p-6 transition-all duration-500 ${
                  highlightElectionId === election.id
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'border-border'
                }`}
              >
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

                {election.candidates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No candidates found for this election
                  </div>
                ) : (
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
                                <Icon
                                  name="CheckBadgeIcon"
                                  size={24}
                                  variant="solid"
                                  className="text-primary"
                                />
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
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentElectionResultsInteractive;
