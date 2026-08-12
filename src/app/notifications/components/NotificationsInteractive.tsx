'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';
import { supabase } from '@/lib/supabase';
import { useUserProfile } from '@/hooks/useUserProfile';

interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  action_url: string | null;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'election':
      return 'CheckBadgeIcon';
    case 'result':
      return 'ChartBarIcon';
    case 'application':
      return 'DocumentTextIcon';
    case 'approval':
    case 'application_approved':
      return 'CheckCircleIcon';
    case 'application_rejected':
      return 'XCircleIcon';
    case 'deadline':
      return 'ClockIcon';
    case 'system':
      return 'InformationCircleIcon';
    default:
      return 'BellIcon';
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'election':
    case 'approval':
    case 'application_approved':
      return 'text-success';
    case 'application_rejected':
      return 'text-error';
    case 'result':
      return 'text-primary';
    case 'application':
      return 'text-accent';
    case 'deadline':
      return 'text-warning';
    case 'system':
      return 'text-muted-foreground';
    default:
      return 'text-muted-foreground';
  }
};

const formatTimestamp = (timestamp: string) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const NotificationsInteractive = () => {
  const router = useRouter();
  const { profile } = useUserProfile();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
      if (!userId) return;
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleOpen = (notification: AppNotification) => {
    router.push(`/notifications/${notification.id}`);
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);
      const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
      if (!userId) return;
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      if (error) throw error;
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const filteredNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.is_read) : notifications;

  return (
    <div className="min-h-screen bg-background">
      <Header
        userRole={
          (profile?.role as 'student' | 'candidate' | 'commission' | 'admin') || 'student'
        }
        userName={profile?.full_name || 'Student'}
        userAvatar={profile?.avatar_url}
      />

      <main className="pt-24 pb-12 px-4 lg:px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-semibold text-2xl text-foreground">
                Notifications
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Updates about elections, your applications, and system messages
              </p>
            </div>
            {unreadCount > 0 && (
              <span className="px-3 py-1 bg-error text-error-foreground text-xs font-caption rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border flex flex-wrap items-center gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-md text-sm font-caption transition-all duration-250 ease-smooth ${
                  filter === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded-md text-sm font-caption transition-all duration-250 ease-smooth ${
                  filter === 'unread'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Unread
              </button>

              {notifications.length > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={markingAll || unreadCount === 0}
                  className="ml-auto text-xs text-primary hover:text-primary/80 transition-colors duration-250 ease-smooth disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {markingAll ? 'Marking...' : 'Mark all as read'}
                </button>
              )}
            </div>

            <div className={loading ? 'py-16' : ''}>
              {loading ? (
                <div className="text-center">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-muted-foreground mt-4">Loading notifications...</p>
                </div>
              ) : filteredNotifications.length > 0 ? (
                <div className="divide-y divide-border">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleOpen(notification)}
                      className={`p-4 sm:p-5 transition-all duration-250 ease-smooth cursor-pointer ${
                        notification.is_read ? 'hover:bg-muted/30' : 'bg-muted/50 hover:bg-muted/70'
                      }`}
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className={`mt-1 ${getNotificationColor(notification.type)}`}>
                          <Icon
                            name={getNotificationIcon(notification.type) as any}
                            size={22}
                            variant="outline"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={`text-sm sm:text-base font-medium ${
                                notification.is_read
                                  ? 'text-muted-foreground'
                                  : 'text-foreground'
                              }`}
                            >
                              {notification.title}
                            </p>
                            {!notification.is_read && (
                              <div className="w-2.5 h-2.5 rounded-full bg-accent flex-shrink-0 mt-1" />
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>

                          <div className="flex items-center gap-2 mt-2">
                            <Icon
                              name="ClockIcon"
                              size={12}
                              variant="outline"
                              className="text-muted-foreground"
                            />
                            <span className="text-xs text-muted-foreground font-caption">
                              {formatTimestamp(notification.created_at)}
                            </span>
                          </div>
                        </div>

                        <Icon
                          name="ChevronRightIcon"
                          size={18}
                          variant="outline"
                          className="text-muted-foreground flex-shrink-0 mt-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-16 text-center">
                  <Icon
                    name="BellSlashIcon"
                    size={48}
                    variant="outline"
                    className="mx-auto text-muted-foreground"
                  />
                  <p className="text-base text-foreground mt-4">
                    {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    You'll receive notifications about elections, your application decisions, and
                    system updates.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotificationsInteractive;
