'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

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
  castVote: (electionId: string, candidateId: string) => Promise<void>;
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

      if (!electionsError && electionsData) {
        setElections(
          electionsData.map((e: any) => ({
            id: e.id,
            title: e.title,
            position: e.position,
            type: e.type,
            status: e.status,
            startDate: e.start_date,
            endDate: e.end_date,
            description: e.description || '',
            hasVoted: false,
            totalCandidates: e.total_candidates || 0,
            positions: e.positions || [
              { name: 'President', candidateCount: 5 },
              { name: 'Vice President', candidateCount: 3 },
              { name: 'Secretary', candidateCount: 4 },
              { name: 'Treasurer', candidateCount: 2 },
            ],
            voterTurnout: e.voter_turnout || 1250,
            totalVoters: e.total_voters || 3500,
          }))
        );
      }

      // Load candidates
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('candidates')
        .select('*')
        .order('votes', { ascending: false });

      if (!candidatesError && candidatesData) {
        setCandidates(
          candidatesData.map((c: any) => ({
            id: c.id,
            electionId: c.election_id,
            name: c.full_name || c.name, // Use full_name from database
            position: c.position,
            status: c.status,
            manifesto: c.manifesto || '',
            avatar: c.avatar,
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

      // Load notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

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
  }, []);

  const castVote = async (electionId: string, candidateId: string) => {
    // Simulate vote casting
    console.log('Vote cast:', { electionId, candidateId });
    // Update local state
    setElections((prev) => prev.map((e) => (e.id === electionId ? { ...e, hasVoted: true } : e)));
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
