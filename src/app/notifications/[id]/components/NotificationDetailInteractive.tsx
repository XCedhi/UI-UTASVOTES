'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

const formatFullTimestamp = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const NotificationDetailInteractive = () => {
  const params = useParams();
  const router = useRouter();
  const { profile } = useUserProfile();
  const [notification, setNotification] = useState<AppNotification | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadNotification = async () => {
      try {
        const id = params.id as string;
        const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
        if (!id || !userId) {
          setNotFound(true);
          return;
        }

        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) {
          setNotFound(true);
          return;
        }

        // Privacy: only the user the notification belongs to can open it.
        if (data.user_id !== userId) {
          setNotFound(true);
          return;
        }

        setNotification(data);

        // Auto-mark as read when the student opens the full message.
        if (!data.is_read) {
          const { error: readError } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);
          if (!readError) {
            setNotification((prev) => (prev ? { ...prev, is_read: true } : prev));
          }
        }
      } catch (error) {
        console.error('Error loading notification:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadNotification();
  }, [params.id]);

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
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => router.push('/notifications')}
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-250 ease-smooth"
          >
            <Icon name="ArrowLeftIcon" size={16} variant="outline" />
            Back to Notifications
          </button>

          {loading ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground mt-4">Loading notification...</p>
            </div>
          ) : notFound || !notification ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <Icon
                name="BellSlashIcon"
                size={48}
                variant="outline"
                className="mx-auto text-muted-foreground"
              />
              <h1 className="font-heading font-semibold text-xl text-foreground mt-4">
                Notification not found
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                This notification doesn't exist or is no longer available to you.
              </p>
              <button
                onClick={() => router.push('/notifications')}
                className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-all duration-250 ease-smooth"
              >
                <Icon name="BellIcon" size={16} variant="outline" />
                Go to Notifications
              </button>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ${getNotificationColor(
                      notification.type
                    )}`}
                  >
                    <Icon
                      name={getNotificationIcon(notification.type) as any}
                      size={24}
                      variant="outline"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="font-heading font-semibold text-xl sm:text-2xl text-foreground">
                      {notification.title}
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                      <Icon
                        name="ClockIcon"
                        size={14}
                        variant="outline"
                        className="text-muted-foreground"
                      />
                      <span className="text-sm text-muted-foreground">
                        {formatFullTimestamp(notification.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border mt-6 pt-6">
                  <p className="text-foreground leading-relaxed whitespace-pre-line">
                    {notification.message}
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-between flex-wrap gap-3">
                  <button
                    onClick={() => router.push('/student-dashboard')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-all duration-250 ease-smooth"
                  >
                    <Icon name="HomeIcon" size={16} variant="outline" />
                    Go to Dashboard
                  </button>
                  <button
                    onClick={() => router.push('/notifications')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-md text-sm font-medium hover:bg-muted/70 transition-all duration-250 ease-smooth"
                  >
                    <Icon name="BellIcon" size={16} variant="outline" />
                    View All Notifications
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default NotificationDetailInteractive;
