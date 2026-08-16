'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/common/Header';
import ElectionStatusIndicator from '@/components/common/ElectionStatusIndicator';
import ElectionCard from './ElectionCard';
import CampaignFeedItem from './CampaignFeedItem';
import VotingHistoryCard from './VotingHistoryCard';
import UpcomingDeadlinesCard from './UpcomingDeadlinesCard';
import QuickActionsCard from './QuickActionsCard';
import Icon from '@/components/ui/AppIcon';
import { useElectionContext, Election } from '@/contexts/ElectionContext';
import { supabase } from '@/lib/supabase';

interface CampaignFeed {
  id: string;
  candidateName: string;
  candidateAvatar: string;
  candidateAvatarAlt: string;
  position: string;
  contentType: 'manifesto' | 'video' | 'announcement' | 'qa';
  title: string;
  content: string;
  mediaUrl?: string;
  mediaAlt?: string;
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

interface VotingHistoryItem {
  id: string;
  electionName: string;
  votedDate: string;
  position: string;
  status: 'completed' | 'pending-results';
}

interface Deadline {
  id: string;
  title: string;
  date: string;
  type: 'voting' | 'registration' | 'result';
  daysRemaining: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

const StudentDashboardInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'manifesto' | 'video' | 'announcement' | 'qa'>(
    'all'
  );
  const [feedItems, setFeedItems] = useState<CampaignFeed[]>([]);
  const { elections, notifications, feed, toggleFeedLike } = useElectionContext();
  const [showComments, setShowComments] = useState(false);
  const [activeFeedId, setActiveFeedId] = useState<string | null>(null);
  interface CommentItem {
    id: string;
    user_name: string;
    content: string;
    created_at: string;
  }
  const [commentsList, setCommentsList] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [addingComment, setAddingComment] = useState(false);
  
  // Real user data from database
  const [userData, setUserData] = useState<{
    full_name: string;
    email: string;
    student_id: string;
    department: string;
    avatar_url?: string;
  } | null>(null);
  const [realElections, setRealElections] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    setIsHydrated(true);
    fetchUserDataAndElections();
  }, []);

  const fetchUserDataAndElections = async () => {
    try {
      // Get userId from localStorage
      const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
      const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
      
      if (!userId && !userEmail) {
        setLoadingData(false);
        return;
      }

      // Fetch user profile using userId or email
      let profile = null;
      if (userId) {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (!error && data) {
          profile = data;
        }
      }
      
      // Fallback to email if userId didn't work
      if (!profile && userEmail) {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('email', userEmail)
          .single();
        
        if (!error && data) {
          profile = data;
        }
      }

      if (profile) {
        setUserData(profile);
      }

      // Fetch active elections
      const { data: electionsData, error: electionsError } = await supabase
        .from('elections')
        .select('*')
        .order('created_at', { ascending: false });

      if (!electionsError && electionsData) {
        setRealElections(electionsData);
      }

      setLoadingData(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoadingData(false);
    }
  };

  const electionsToShow: Election[] = elections;

  // Mock data for voting history and deadlines (could be moved to context later)
  const mockVotingHistory: VotingHistoryItem[] = [
    {
      id: 'vote-001',
      electionName: 'Computer Science Department Representative',
      votedDate: '18/01/2026',
      position: 'Department Representative',
      status: 'pending-results',
    },
    {
      id: 'vote-002',
      electionName: 'Library Committee Member 2025',
      votedDate: '10/12/2025',
      position: 'Committee Member',
      status: 'completed',
    },
  ];

  const mockDeadlines: Deadline[] = [
    {
      id: 'deadline-001',
      title: 'Student Council President Voting Ends',
      date: '25/01/2026',
      type: 'voting',
      daysRemaining: 3,
    },
    {
      id: 'deadline-002',
      title: 'CS Department Rep Voting Ends',
      date: '28/01/2026',
      type: 'voting',
      daysRemaining: 6,
    },
    {
      id: 'deadline-003',
      title: 'Sports Committee Results Announcement',
      date: '12/02/2026',
      type: 'result',
      daysRemaining: 21,
    },
  ];

  const mockQuickActions: QuickAction[] = [
    {
      id: 'action-001',
      title: 'Apply as Candidate',
      description: 'Register to run in upcoming elections',
      icon: 'DocumentTextIcon',
      href: '/candidate-registration',
      color: 'bg-primary',
    },
    {
      id: 'action-002',
      title: 'View All Results',
      description: 'Check past election outcomes',
      icon: 'ChartBarIcon',
      href: '/student-election-results',
      color: 'bg-success',
    },
    {
      id: 'action-003',
      title: 'Election Guidelines',
      description: 'Learn about voting process',
      icon: 'InformationCircleIcon',
      href: '/election-guidelines',
      color: 'bg-accent',
    },
    {
      id: 'action-004',
      title: 'Report Issue',
      description: 'Contact electoral commission',
      icon: 'ExclamationTriangleIcon',
      href: '/report-issue',
      color: 'bg-warning',
    },
  ];

  const handleLike = (feedId: string) => {
    if (!isHydrated) return;
    toggleFeedLike(feedId);
  };

  const loadComments = async (feedId: string) => {
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('feed_id', feedId)
        .order('created_at', { ascending: false });
      if (!error && data) {
        setCommentsList(data as unknown as CommentItem[]);
      } else {
        setCommentsList([]);
      }
    } finally {
      setLoadingComments(false);
    }
  };

  const handleComment = async (feedId: string) => {
    if (!isHydrated) return;
    setActiveFeedId(feedId);
    setShowComments(true);
    setNewComment('');
    await loadComments(feedId);
  };

  const submitComment = async () => {
    if (!activeFeedId || !newComment.trim()) return;
    setAddingComment(true);
    try {
      let userName = 'Student';
      try {
        const email =
          typeof window !== 'undefined' ? window.localStorage.getItem('userEmail') : null;
        if (email) userName = email.split('@')[0];
      } catch {
        void 0;
      }
      const { data, error } = await supabase
        .from('comments')
        .insert({
          feed_id: activeFeedId,
          user_name: userName,
          content: newComment.trim(),
        })
        .select()
        .single();
      if (!error && data) {
        setCommentsList((prev) => [data as unknown as CommentItem, ...prev]);
        setNewComment('');
      }
    } finally {
      setAddingComment(false);
    }
  };

  const filteredFeed = isHydrated
    ? activeTab === 'all'
      ? feed
      : feed.filter((item) => item.type === activeTab)
    : [];

  if (!isHydrated || loadingData) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          userRole="student"
          userName="Loading..."
          notificationCount={0}
          electionStatus={{
            isActive: true,
            name: 'Loading...',
            endTime: '2026-01-25T23:59:59',
          }}
        />
        <main className="pt-20">
          <div className="mx-4 lg:mx-6 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/4"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Get first name from full name
  const firstName = userData?.full_name?.split(' ')[0] || 'Student';
  
  // Get active election if any
  const activeElection = realElections.find(e => e.status === 'active');

  return (
    <div className="min-h-screen bg-background">
      <Header
        userRole="student"
        userName={userData?.full_name || 'Student'}
        userAvatar={userData?.avatar_url}
        notificationCount={notifications.length}
        electionStatus={activeElection ? {
          isActive: true,
          name: activeElection.title,
          endTime: activeElection.end_date,
        } : undefined}
      />

      <main className="pt-20">
        <div className="mx-4 lg:mx-6 py-8">
          <div className="mb-6">
            <h1 className="font-heading text-3xl font-semibold text-foreground mb-2">
              Student Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {firstName}! Stay updated with ongoing elections and campaign activities.
            </p>
          </div>

          {activeElection && (
            <div className="mb-6">
              <ElectionStatusIndicator
                isActive={true}
                electionName={activeElection.title}
                endTime={activeElection.end_date}
                className="w-full"
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                  Active Elections
                </h2>
                {elections.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {elections.map((election) => (
                      <ElectionCard 
                        key={election.id} 
                        id={election.id}
                        title={election.title}
                        type={election.type}
                        status={election.status}
                        startDate={election.startDate}
                        endDate={election.endDate}
                        totalCandidates={election.totalCandidates || 0}
                        positions={election.positions || []}
                        hasVoted={election.hasVoted}
                        description={election.description || ''}
                        voterTurnout={election.voterTurnout || 0}
                        totalVoters={election.totalVoters || 0}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-lg p-8 text-center">
                    <Icon name="InformationCircleIcon" size={48} variant="outline" className="text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No elections available at the moment.</p>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading text-2xl font-semibold text-foreground">
                    Campaign Feed
                  </h2>
                  <div className="flex items-center gap-2">
                    <a
                      href="/campaign-feed/create"
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250 text-sm font-medium flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4.5v15m7.5-7.5h-15"
                        />
                      </svg>
                      Create Post
                    </a>
                    <button
                      onClick={() => setActiveTab('all')}
                      className={`px-3 py-1 rounded-md text-sm font-caption transition-all duration-250 ease-smooth ${
                        activeTab === 'all'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setActiveTab('manifesto')}
                      className={`px-3 py-1 rounded-md text-sm font-caption transition-all duration-250 ease-smooth ${
                        activeTab === 'manifesto'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      Manifestos
                    </button>
                    <button
                      onClick={() => setActiveTab('video')}
                      className={`px-3 py-1 rounded-md text-sm font-caption transition-all duration-250 ease-smooth ${
                        activeTab === 'video'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      Videos
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredFeed.map((item) => (
                    <CampaignFeedItem
                      key={item.id}
                      id={item.id}
                      candidateName={item.candidateName}
                      candidateAvatar={item.candidateAvatar}
                      candidateAvatarAlt={item.candidateAvatarAlt || item.candidateName || 'Candidate avatar'}
                      position={'Candidate'}
                      contentType={item.type}
                      title={item.title}
                      content={item.content}
                      mediaUrl={item.mediaUrl}
                      mediaAlt={item.mediaAlt || item.title || 'Campaign content'}
                      timestamp={item.createdAt}
                      likes={item.likes}
                      comments={item.comments}
                      isLiked={item.isLiked}
                      onLike={() => handleLike(item.id)}
                      onComment={() => handleComment(item.id)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <QuickActionsCard actions={mockQuickActions} />
              <VotingHistoryCard history={mockVotingHistory} />
              <UpcomingDeadlinesCard deadlines={mockDeadlines} />
            </div>
          </div>
        </div>
      </main>
      {showComments && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-heading font-semibold text-foreground">Comments</h3>
              <button
                onClick={() => {
                  setShowComments(false);
                  setActiveFeedId(null);
                  setCommentsList([]);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 max-h-64 overflow-auto border border-border rounded-md p-3 bg-background">
              {loadingComments ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
              ) : commentsList.length === 0 ? (
                <div className="text-sm text-muted-foreground">No comments yet</div>
              ) : (
                commentsList.map((c) => (
                  <div key={c.id} className="p-2 border border-border rounded">
                    <div className="text-xs text-muted-foreground">
                      {new Date(c.created_at).toLocaleString()}
                    </div>
                    <div className="text-sm text-foreground">
                      <span className="font-medium">{c.user_name}</span>: {c.content}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment"
                className="flex-1 px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground"
              />
              <button
                onClick={submitComment}
                disabled={addingComment}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {addingComment ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboardInteractive;
