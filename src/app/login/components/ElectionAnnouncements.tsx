'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { supabase } from '@/lib/supabase';

interface Announcement {
  id: number;
  type: 'election' | 'deadline' | 'result' | 'system' | 'fee_update' | 'general';
  title: string;
  message: string;
  published_at: string;
  priority: 'high' | 'medium' | 'low';
  is_active: boolean;
}

const ElectionAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('published_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching announcements:', error);
        return;
      }

      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAnnouncementIcon = (type: Announcement['type']) => {
    switch (type) {
      case 'election':
        return 'CheckBadgeIcon';
      case 'deadline':
        return 'ClockIcon';
      case 'result':
        return 'ChartBarIcon';
      case 'system':
        return 'InformationCircleIcon';
      case 'fee_update':
        return 'CurrencyDollarIcon';
      case 'general':
        return 'MegaphoneIcon';
      default:
        return 'BellIcon';
    }
  };

  const getAnnouncementColor = (type: Announcement['type']) => {
    switch (type) {
      case 'election':
        return 'text-primary';
      case 'deadline':
        return 'text-warning';
      case 'result':
        return 'text-success';
      case 'system':
        return 'text-accent';
      case 'fee_update':
        return 'text-secondary';
      case 'general':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  const getPriorityBadge = (priority: Announcement['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-error/10 text-error border-error/20';
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'low':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto bg-card/80 backdrop-blur-md border border-border rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon name="MegaphoneIcon" size={24} variant="outline" className="text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-heading font-semibold text-foreground">Election Updates</h3>
            <p className="text-sm text-muted-foreground">Latest announcements and news</p>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-background/50 border border-border rounded-md">
              <div className="h-4 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-card/80 backdrop-blur-md border border-border rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <Icon name="MegaphoneIcon" size={24} variant="outline" className="text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-heading font-semibold text-foreground">Election Updates</h3>
          <p className="text-sm text-muted-foreground">Latest announcements and news</p>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        {announcements.length === 0 ? (
          <div className="p-8 text-center">
            <Icon name="InformationCircleIcon" size={48} variant="outline" className="text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No announcements at this time</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="p-4 bg-background/50 border border-border rounded-md hover:bg-muted/30 transition-all duration-250 ease-smooth"
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1 ${getAnnouncementColor(announcement.type)}`}>
                  <Icon
                    name={getAnnouncementIcon(announcement.type) as any}
                    size={20}
                    variant="outline"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-sm font-medium text-foreground line-clamp-2">
                      {announcement.title}
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-caption border flex-shrink-0 ${getPriorityBadge(
                        announcement.priority
                      )}`}
                    >
                      {announcement.priority}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
                    {announcement.message}
                  </p>

                  <div className="flex items-center gap-2">
                    <Icon
                      name="CalendarIcon"
                      size={14}
                      variant="outline"
                      className="text-muted-foreground"
                    />
                    <span className="text-xs text-muted-foreground font-caption">
                      {formatDate(announcement.published_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ElectionAnnouncements;
