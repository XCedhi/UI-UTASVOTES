'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface FeedItem {
  id: string;
  candidateName: string;
  candidateAvatar: string;
  position: string;
  type: 'manifesto' | 'video' | 'announcement' | 'qa';
  title: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

const CampaignFeedInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'manifesto' | 'video' | 'announcement' | 'qa'
  >('all');
  const [feedItems, setFeedItems] = useState<FeedItem[]>([
    {
      id: '1',
      candidateName: 'Kwame Mensah',
      candidateAvatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
      position: 'Student Union President',
      type: 'manifesto',
      title: 'My Vision for UTAS 2026',
      content:
        'I pledge to improve student welfare, enhance campus facilities, and ensure every voice is heard...',
      timestamp: '2026-01-25T10:30:00',
      likes: 234,
      comments: 45,
      isLiked: false,
    },
  ]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

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
          <div>
            <h1 className="font-heading font-bold text-3xl text-foreground mb-2">Campaign Feed</h1>
            <p className="text-muted-foreground">
              Stay updated with candidate manifestos, announcements, and campaign content
            </p>
          </div>

          {/* Filters */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[
              { value: 'all', label: 'All Posts', icon: 'Squares2X2Icon' },
              { value: 'manifesto', label: 'Manifestos', icon: 'DocumentTextIcon' },
              { value: 'video', label: 'Videos', icon: 'VideoCameraIcon' },
              { value: 'announcement', label: 'Announcements', icon: 'MegaphoneIcon' },
              { value: 'qa', label: 'Q&A', icon: 'ChatBubbleLeftRightIcon' },
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
            {feedItems.map((item) => (
              <div key={item.id} className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                    <AppImage
                      src={item.candidateAvatar}
                      alt={item.candidateName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-semibold text-lg text-foreground">
                      {item.candidateName}
                    </h3>
                    <p className="text-sm text-muted-foreground">{item.position}</p>
                  </div>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium capitalize">
                    {item.type}
                  </span>
                </div>

                <h4 className="font-heading font-semibold text-xl text-foreground mb-3">
                  {item.title}
                </h4>
                <p className="text-muted-foreground mb-4">{item.content}</p>

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
                  <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-250">
                    <Icon name="ChatBubbleLeftIcon" size={20} variant="outline" />
                    {item.comments}
                  </button>
                  <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-250">
                    <Icon name="ShareIcon" size={20} variant="outline" />
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CampaignFeedInteractive;
