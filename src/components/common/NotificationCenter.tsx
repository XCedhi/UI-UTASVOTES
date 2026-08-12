'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Notification {
  id: string;
  type:
    | 'election'
    | 'deadline'
    | 'result'
    | 'approval'
    | 'application'
    | 'application_approved'
    | 'application_rejected'
    | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

interface NotificationCenterProps {
  notifications?: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
  className?: string;
}

const NotificationCenter = ({
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  className = '',
}: NotificationCenterProps) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'election':
        return 'CheckBadgeIcon';
      case 'deadline':
        return 'ClockIcon';
      case 'result':
        return 'ChartBarIcon';
      case 'approval':
      case 'application_approved':
        return 'CheckCircleIcon';
      case 'application_rejected':
        return 'XCircleIcon';
      case 'application':
        return 'DocumentTextIcon';
      case 'system':
        return 'InformationCircleIcon';
      default:
        return 'BellIcon';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'election':
        return 'text-primary';
      case 'deadline':
        return 'text-warning';
      case 'result':
        return 'text-success';
      case 'approval':
      case 'application_approved':
        return 'text-success';
      case 'application_rejected':
        return 'text-error';
      case 'application':
        return 'text-accent';
      case 'system':
        return 'text-accent';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    } else {
      // No action URL (e.g. per-student application decisions) → open the
      // full notification message page.
      window.location.href = `/notifications/${notification.id}`;
    }
  };

  return (
    <div className={`bg-popover border border-border rounded-md shadow-lg ${className}`}>
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-semibold text-lg text-popover-foreground">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-error text-error-foreground text-xs font-caption rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
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
            <div className="ml-auto flex items-center gap-2">
              {unreadCount > 0 && onMarkAllAsRead && (
                <button
                  onClick={onMarkAllAsRead}
                  className="text-xs text-primary hover:text-primary/80 transition-colors duration-250 ease-smooth"
                >
                  Mark all read
                </button>
              )}
              {onClearAll && (
                <button
                  onClick={onClearAll}
                  className="text-xs text-error hover:text-error/80 transition-colors duration-250 ease-smooth"
                >
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {filteredNotifications.length > 0 ? (
          <div className="divide-y divide-border">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 transition-all duration-250 ease-smooth cursor-pointer ${
                  !notification.isRead ? 'bg-muted/50' : 'hover:bg-muted/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${getNotificationColor(notification.type)}`}>
                    <Icon
                      name={getNotificationIcon(notification.type) as any}
                      size={20}
                      variant="outline"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm font-medium ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}
                      >
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
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
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-12 text-center">
            <Icon
              name="BellSlashIcon"
              size={48}
              variant="outline"
              className="mx-auto text-muted-foreground mb-4"
            />
            <p className="text-sm text-muted-foreground">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              You&apos;ll see updates about elections, deadlines, and results here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
