'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { getUserSession } from '@/lib/auth-utils';

export interface Election {
  id: string;
  title: string;
  position: string;
  type: 'departmental' | 'university-wide';
  status: 'active' | 'upcoming' | 'ended';
  startDate: string;
  endDate: string;
  description: string;
  hasVoted: boolean;
  totalCandidates?: number;
  positions?: Array<{ name: string; candidateCount: number }>;
  voterTurnout?: number;
  totalVoters?: number;
}

export interface Candidate {
  id: string;
  electionId: string;
  name: string;
  position: string;
  status: 'pending' | 'approved' | 'rejected';
  manifesto: string;
  avatar: string | null;
  department: string | null;
  level: string | null;
  gpa: string | null;
  email: string | null;
  votes: number;
  submittedAt: string;
}

export interface FeedItem {
  id: string;
  candidateName: string;
  candidateAvatar: string;
  candidateAvatarAlt: string;
  type: 'manifesto' | 'video' | 'announcement' | 'qa';
  title: string;
  content: string;
  mediaUrl?: string;
  mediaAlt?: string;
  createdAt: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
}

interface ElectionContextType {
  elections: Election[];
  candidates: Candidate[];
  feed: FeedItem[];
  notifications: Notification[];
  loading: boolean;
  castVote: (
    electionId: string,
    candidateId: string
  ) => Promise<{ success: boolean; receiptNumber?: string }>;
  toggleFeedLike: (feedId: string) => void;
  refreshData: () => Promise<void>;
}

const ElectionContext = createContext<ElectionContextType | null>(null);

export const useElectionContext = () => {
  const context = useContext(ElectionContext);
  if (!context) throw new Error('useElectionContext must be used within ElectionProvider');
  return context;
};

export const ElectionProvider = ({ children }: { children: ReactNode }) => {
  const [elections, setElections] = useState<Election[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load elections
      const { data: electionsData, error: electionsError } = await supabase
        .from('elections')
        .select('*')
        .order('created_at', { ascending: false });

      // Load the current user's votes from server API so each student only sees their own vote state
      let votedElectionIds = new Set<string>();
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const localSession = getUserSession();

        const voteStatusRes = await fetch('/api/vote/status', {
          headers: {
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
            ...(localSession?.userId ? { 'x-user-id': localSession.userId } : {}),
            ...(localSession?.email ? { 'x-user-email': localSession.email } : {}),
          },
        });

        if (voteStatusRes.ok) {
          const voteStatus = await voteStatusRes.json();
          if (Array.isArray(voteStatus.votedElectionIds)) {
            votedElectionIds = new Set(voteStatus.votedElectionIds);
          }
        }
      } catch (voteStatusError) {
        console.warn('Failed to load user vote status:', voteStatusError);
      }

      // Fetch real positions and candidates to compute accurate election positions & counts
      const { data: dbPositions } = await supabase
        .from('positions')
        .select('*');

      const { data: dbCandidates } = await supabase
        .from('candidates')
        .select('*')
        .order('votes', { ascending: false });

      if (!electionsError && electionsData) {
        setElections(
          electionsData.map((e: any) => {
            // Compute a real status from the voting window when dates exist so
            // the voting UI only surfaces elections that are actually open NOW
            const now = Date.now();
            const startTime = e.voting_start || e.start_date;
            const endTime = e.voting_end || e.end_date;
            const startMs = startTime ? new Date(startTime).getTime() : null;
            const endMs = endTime ? new Date(endTime).getTime() : null;

            let status: 'active' | 'upcoming' | 'ended' = 'active';
            if (e.status === 'completed' || e.status === 'cancelled' || e.status === 'ended') {
              status = 'ended';
            } else if (e.status === 'active') {
              status = endMs !== null && now > endMs ? 'ended' : 'active';
            } else if (e.status === 'upcoming' || e.status === 'scheduled') {
              status = startMs !== null && now >= startMs ? 'active' : 'upcoming';
            } else {
              status = startMs === null || endMs === null
                ? (e.status || 'active')
                : now < startMs
                  ? 'upcoming'
                  : now > endMs
                    ? 'ended'
                    : 'active';
            }

            // Real positions for this election from DB + approved candidates
            const electionDbPositions = (dbPositions || []).filter(
              (p: any) => p.election_id === e.id
            );
            const electionApprovedCandidates = (dbCandidates || []).filter(
              (c: any) => c.election_id === e.id && c.status === 'approved'
            );

            // Build list of position objects for this election
            const positionNamesSet = new Set<string>();
            const electionPositionsList: Array<{ id?: string; name: string; candidateCount: number }> = [];

            electionDbPositions.forEach((p: any) => {
              const posTitle = p.title || p.name || 'Position';
              positionNamesSet.add(posTitle.trim().toLowerCase());
              const count = electionApprovedCandidates.filter(
                (c: any) => (c.position || '').trim().toLowerCase() === posTitle.trim().toLowerCase()
              ).length;
              electionPositionsList.push({
                id: p.id,
                name: posTitle,
                candidateCount: count,
              });
            });

            // Also include any approved candidate position titles not in positions table
            electionApprovedCandidates.forEach((c: any) => {
              const posTitle = (c.position || '').trim();
              if (posTitle && !positionNamesSet.has(posTitle.toLowerCase())) {
                positionNamesSet.add(posTitle.toLowerCase());
                const count = electionApprovedCandidates.filter(
                  (cand: any) => (cand.position || '').trim().toLowerCase() === posTitle.toLowerCase()
                ).length;
                electionPositionsList.push({
                  id: `pos-${e.id}-${posTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                  name: posTitle,
                  candidateCount: count,
                });
              }
            });

            return {
              id: e.id,
              title: e.name || e.title || 'Election',
              position: electionPositionsList.length > 0 ? electionPositionsList[0].name : 'President',
              type: e.election_type || e.type || 'university-wide',
              status,
              startDate: e.voting_start || e.start_date,
              endDate: e.voting_end || e.end_date,
              description: e.description || '',
              hasVoted: votedElectionIds.has(e.id),
              totalCandidates: electionApprovedCandidates.length,
              positions: electionPositionsList,
              voterTurnout: e.voter_turnout || 0,
              totalVoters: e.total_voters || 0,
            };
          })
        );
      }

      // Store candidates in context state
      if (dbCandidates) {
        setCandidates(
          dbCandidates.map((c: any) => ({
            id: c.id,
            electionId: c.election_id,
            name: c.full_name || c.name,
            position: c.position,
            status: c.status,
            manifesto: c.manifesto || '',
            avatar: c.photo_url || c.avatar || c.photo || null,
            department: c.department,
            level: c.level,
            gpa: c.gpa,
            email: c.email,
            votes: c.votes || 0,
            submittedAt: c.submitted_at,
          }))
        );
      }

      // Load feed items
      const { data: feedData, error: feedError } = await supabase
        .from('feed_items')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!feedError && feedData) {
        setFeed(
          feedData.map((f: any) => ({
            id: f.id,
            candidateName: f.candidate_name,
            candidateAvatar: f.candidate_avatar || 'https://via.placeholder.com/150',
            candidateAvatarAlt: f.candidate_avatar_alt || f.candidate_name,
            type: f.type,
            title: f.title,
            content: f.content,
            mediaUrl: f.media_url,
            mediaAlt: f.media_alt,
            createdAt: f.created_at,
            likes: 0,
            comments: 0,
            isLiked: false,
          }))
        );
      }

      // Load user-specific notifications
      const localUser = getUserSession();
      let notifQuery = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (localUser?.userId) {
        notifQuery = notifQuery.eq('user_id', localUser.userId);
      }

      const { data: notificationsData, error: notificationsError } = await notifQuery;

      if (!notificationsError && notificationsData) {
        setNotifications(
          notificationsData.map((n: any) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            createdAt: n.created_at,
          }))
        );
      }
    } catch (error) {
      console.error('Error loading election data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Re-sync elections and votes when Supabase session changes
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      loadData();
    });

    // Re-sync elections and votes when user logs in, logs out, or switches accounts
    const handleAuthEvent = () => {
      loadData();
    };

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'userId' || e.key === 'userEmail' || e.key === 'userRole') {
        loadData();
      }
    };

    window.addEventListener('utas-auth-change', handleAuthEvent);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      authListener?.subscription?.unsubscribe();
      window.removeEventListener('utas-auth-change', handleAuthEvent);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  const castVote = async (electionId: string, candidateId: string) => {
    // Attach both the real Supabase session (preferred by the server) and the
    // app's localStorage session (fallback) so voting works even when the
    // Supabase access token is missing or expired.
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const localSession = getUserSession();

    const response = await fetch('/api/vote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : {}),
        ...(localSession?.userId ? { 'x-user-id': localSession.userId } : {}),
        ...(localSession?.email ? { 'x-user-email': localSession.email } : {}),
      },
      body: JSON.stringify({ electionId, candidateId }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to cast vote');
    }

    // Update local state and reload fresh data
    setElections((prev) =>
      prev.map((e) => (e.id === electionId ? { ...e, hasVoted: true } : e))
    );
    await loadData();

    return { success: true, receiptNumber: result.receiptNumber };
  };

  const toggleFeedLike = (feedId: string) => {
    setFeed((prev) =>
      prev.map((item) =>
        item.id === feedId
          ? {
              ...item,
              isLiked: !item.isLiked,
              likes: item.isLiked ? item.likes - 1 : item.likes + 1,
            }
          : item
      )
    );
  };

  const refreshData = async () => {
    await loadData();
  };

  const value: ElectionContextType = {
    elections,
    candidates,
    feed,
    notifications,
    loading,
    castVote,
    toggleFeedLike,
    refreshData,
  };

  return <ElectionContext.Provider value={value}>{children}</ElectionContext.Provider>;
};
