'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { supabase } from '@/lib/supabase';

interface Reply {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

interface Comment {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  replies: Reply[];
}

interface FeedItem {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorRole: 'student' | 'candidate';
  position?: string;
  department: string;
  type: 'manifesto' | 'video' | 'announcement' | 'qa' | 'discussion';
  title: string;
  content: string;
  hashtags: string[];
  timestamp: string;
  likes: number;
  comments: Comment[];
  shares: number;
  isLiked: boolean;
  imageUrl?: string;
}

const CampaignFeedInteractive = () => {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'manifesto' | 'video' | 'announcement' | 'qa' | 'discussion'
  >('all');
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [showReplyForm, setShowReplyForm] = useState<string | null>(null);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);

  useEffect(() => {
    setIsHydrated(true);
    fetchCurrentUser();
    fetchFeedItems();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setCurrentUser(profile);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchFeedItems = async () => {
    try {
      setIsLoading(true);
      
      // Fetch feed items with user profiles
      const { data: feedData, error } = await supabase
        .from('feed_items')
        .select(`
          *,
          user_profiles!inner(
            full_name,
            avatar_url,
            student_id,
            department,
            role
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching feed items:', error);
        setFeedItems([]);
        return;
      }

      if (!feedData || feedData.length === 0) {
        setFeedItems([]);
        return;
      }

      // Transform database data to match FeedItem interface
      const transformedItems: FeedItem[] = await Promise.all(
        feedData.map(async (item: any) => {
          // Fetch comments count
          const { count: commentsCount } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('feed_id', item.id);

          // Fetch likes count
          const { count: likesCount } = await supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('feed_id', item.id);

          // Check if current user liked this post
          let isLiked = false;
          if (currentUser) {
            const { data: userLike } = await supabase
              .from('likes')
              .select('id')
              .eq('feed_id', item.id)
              .eq('user_id', currentUser.id)
              .single();
            isLiked = !!userLike;
          }

          return {
            id: item.id,
            authorName: item.user_profiles.full_name,
            authorAvatar: item.user_profiles.avatar_url || '/assets/images/no_image.png',
            authorRole: item.user_profiles.role === 'candidate' ? 'candidate' : 'student',
            position: item.position || undefined,
            department: item.user_profiles.department,
            type: item.type || 'discussion',
            title: item.title || '',
            content: item.content || '',
            hashtags: item.hashtags || [],
            timestamp: item.created_at,
            likes: likesCount || 0,
            comments: [], // Will be loaded when expanded
            shares: item.shares || 0,
            isLiked,
            imageUrl: item.image_url || undefined,
          };
        })
      );

      setFeedItems(transformedItems);
    } catch (error) {
      console.error('Error in fetchFeedItems:', error);
      setFeedItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleLike = (id: string) => {
    setFeedItems((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              isLiked: !item.isLiked,
              likes: item.isLiked ? item.likes - 1 : item.likes + 1,
            }
          : item
      )
    );
  };

  const handleAddComment = (postId: string) => {
    const text = commentText[postId]?.trim();
    if (!text) return;

    setFeedItems((items) =>
      items.map((item) =>
        item.id === postId
          ? {
              ...item,
              comments: [
                ...item.comments,
                {
                  id: `c${Date.now()}`,
                  authorName: 'John Mensah',
                  authorAvatar:
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
                  content: text,
                  timestamp: new Date().toISOString(),
                  likes: 0,
                  isLiked: false,
                  replies: [],
                },
              ],
            }
          : item
      )
    );

    setCommentText({ ...commentText, [postId]: '' });
  };

  const handleAddReply = (postId: string, commentId: string) => {
    const text = replyText[commentId]?.trim();
    if (!text) return;

    setFeedItems((items) =>
      items.map((item) =>
        item.id === postId
          ? {
              ...item,
              comments: item.comments.map((comment) =>
                comment.id === commentId
                  ? {
                      ...comment,
                      replies: [
                        ...comment.replies,
                        {
                          id: `r${Date.now()}`,
                          authorName: 'John Mensah',
                          authorAvatar:
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
                          content: text,
                          timestamp: new Date().toISOString(),
                          likes: 0,
                          isLiked: false,
                        },
                      ],
                    }
                  : comment
              ),
            }
          : item
      )
    );

    setReplyText({ ...replyText, [commentId]: '' });
    setShowReplyForm(null);
  };

  const handleLikeComment = (postId: string, commentId: string) => {
    setFeedItems((items) =>
      items.map((item) =>
        item.id === postId
          ? {
              ...item,
              comments: item.comments.map((comment) =>
                comment.id === commentId
                  ? {
                      ...comment,
                      isLiked: !comment.isLiked,
                      likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
                    }
                  : comment
              ),
            }
          : item
      )
    );
  };

  const handleLikeReply = (postId: string, commentId: string, replyId: string) => {
    setFeedItems((items) =>
      items.map((item) =>
        item.id === postId
          ? {
              ...item,
              comments: item.comments.map((comment) =>
                comment.id === commentId
                  ? {
                      ...comment,
                      replies: comment.replies.map((reply) =>
                        reply.id === replyId
                          ? {
                              ...reply,
                              isLiked: !reply.isLiked,
                              likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                            }
                          : reply
                      ),
                    }
                  : comment
              ),
            }
          : item
      )
    );
  };

  const handleShare = (postId: string) => {
    setFeedItems((items) =>
      items.map((item) =>
        item.id === postId
          ? {
              ...item,
              shares: item.shares + 1,
            }
          : item
      )
    );
    alert('Post shared successfully!');
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <Header userRole="student" userName="Loading..." notificationCount={0} />
        <main className="pt-24 pb-12 px-4 lg:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="h-96 bg-muted animate-pulse rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  const filteredItems =
    activeFilter === 'all' ? feedItems : feedItems.filter((item) => item.type === activeFilter);

  return (
    <div className="min-h-screen bg-background">
      <Header
        userRole="student"
        userName="John Mensah"
        userAvatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
        notificationCount={3}
        electionStatus={{
          isActive: true,
          name: 'Student Council Elections 2026',
          endTime: '2026-02-15T23:59:59',
        }}
      />

      <main className="pt-24 pb-12 px-4 lg:px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
                Campaign Feed
              </h1>
              <p className="text-muted-foreground">
                Share ideas, engage with candidates, and stay updated
              </p>
            </div>
            <button
              onClick={() => router.push('/campaign-feed/create')}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250 shadow-md"
            >
              <Icon name="PlusIcon" size={20} variant="outline" />
              Create Post
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[
              { value: 'all', label: 'All Posts', icon: 'Squares2X2Icon' },
              { value: 'discussion', label: 'Discussions', icon: 'ChatBubbleLeftRightIcon' },
              { value: 'manifesto', label: 'Manifestos', icon: 'DocumentTextIcon' },
              { value: 'announcement', label: 'Announcements', icon: 'MegaphoneIcon' },
              { value: 'qa', label: 'Q&A', icon: 'QuestionMarkCircleIcon' },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-250 whitespace-nowrap ${
                  activeFilter === filter.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-foreground border border-border hover:border-primary/50'
                }`}
              >
                <Icon name={filter.icon as any} size={20} variant="outline" />
                {filter.label}
              </button>
            ))}
          </div>

          {/* Feed Items */}
          <div className="space-y-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-card border border-border rounded-lg p-6">
                {/* Post Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                    <AppImage
                      src={item.authorAvatar}
                      alt={item.authorName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold text-lg text-foreground">
                      {item.authorName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.authorRole === 'candidate' ? item.position : item.department} •{' '}
                      {formatTimestamp(item.timestamp)}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium capitalize flex-shrink-0">
                    {item.type}
                  </span>
                </div>

                {/* Post Content */}
                <h4 className="font-heading font-semibold text-xl text-foreground mb-3">
                  {item.title}
                </h4>
                <p className="text-muted-foreground mb-3">{item.content}</p>

                {/* Hashtags */}
                {item.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.hashtags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-sm text-primary hover:text-primary/80 cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center gap-6 pt-4 border-t border-border">
                  <button
                    onClick={() => handleLike(item.id)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-250"
                  >
                    <Icon
                      name="HeartIcon"
                      size={20}
                      variant={item.isLiked ? 'solid' : 'outline'}
                      className={item.isLiked ? 'text-error' : ''}
                    />
                    {item.likes}
                  </button>
                  <button
                    onClick={() =>
                      setExpandedComments(expandedComments === item.id ? null : item.id)
                    }
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-250"
                  >
                    <Icon name="ChatBubbleLeftIcon" size={20} variant="outline" />
                    {item.comments.length}
                  </button>
                  <button
                    onClick={() => handleShare(item.id)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-250"
                  >
                    <Icon name="ShareIcon" size={20} variant="outline" />
                    {item.shares}
                  </button>
                </div>

                {/* Comments Section */}
                {expandedComments === item.id && (
                  <div className="mt-6 pt-6 border-t border-border space-y-4">
                    {/* Add Comment Form */}
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                        <AppImage
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
                          alt="You"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={commentText[item.id] || ''}
                          onChange={(e) =>
                            setCommentText({ ...commentText, [item.id]: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddComment(item.id);
                          }}
                          placeholder="Write a comment..."
                          className="flex-1 px-4 py-2 bg-background border border-border rounded-md text-foreground text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                          onClick={() => handleAddComment(item.id)}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250 text-sm"
                        >
                          Post
                        </button>
                      </div>
                    </div>

                    {/* Comments List */}
                    {item.comments.map((comment) => (
                      <div key={comment.id} className="space-y-3">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                            <AppImage
                              src={comment.authorAvatar}
                              alt={comment.authorName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="bg-muted rounded-lg p-3">
                              <p className="font-medium text-sm text-foreground">
                                {comment.authorName}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {comment.content}
                              </p>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <button
                                onClick={() => handleLikeComment(item.id, comment.id)}
                                className={`hover:text-primary transition-colors ${
                                  comment.isLiked ? 'text-error' : ''
                                }`}
                              >
                                {comment.isLiked ? 'Liked' : 'Like'} ({comment.likes})
                              </button>
                              <button
                                onClick={() =>
                                  setShowReplyForm(
                                    showReplyForm === comment.id ? null : comment.id
                                  )
                                }
                                className="hover:text-primary transition-colors"
                              >
                                Reply
                              </button>
                              <span>{formatTimestamp(comment.timestamp)}</span>
                            </div>

                            {/* Reply Form */}
                            {showReplyForm === comment.id && (
                              <div className="flex gap-2 mt-3">
                                <input
                                  type="text"
                                  value={replyText[comment.id] || ''}
                                  onChange={(e) =>
                                    setReplyText({ ...replyText, [comment.id]: e.target.value })
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddReply(item.id, comment.id);
                                  }}
                                  placeholder="Write a reply..."
                                  className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-foreground text-sm outline-none focus:ring-2 focus:ring-primary"
                                />
                                <button
                                  onClick={() => handleAddReply(item.id, comment.id)}
                                  className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250 text-sm"
                                >
                                  Reply
                                </button>
                              </div>
                            )}

                            {/* Replies */}
                            {comment.replies.length > 0 && (
                              <div className="ml-6 mt-3 space-y-3">
                                {comment.replies.map((reply) => (
                                  <div key={reply.id} className="flex gap-2">
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
                                      <AppImage
                                        src={reply.authorAvatar}
                                        alt={reply.authorName}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <div className="bg-muted rounded-lg p-2">
                                        <p className="font-medium text-xs text-foreground">
                                          {reply.authorName}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {reply.content}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                        <button
                                          onClick={() =>
                                            handleLikeReply(item.id, comment.id, reply.id)
                                          }
                                          className={`hover:text-primary transition-colors ${
                                            reply.isLiked ? 'text-error' : ''
                                          }`}
                                        >
                                          {reply.isLiked ? 'Liked' : 'Like'} ({reply.likes})
                                        </button>
                                        <span>{formatTimestamp(reply.timestamp)}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CampaignFeedInteractive;
