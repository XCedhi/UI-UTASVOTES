'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { clearUserSession } from '@/lib/auth-utils';
import { supabase } from '@/lib/supabase';

interface HeaderProps {
  userRole?: 'student' | 'candidate' | 'commission' | 'admin' | null;
  userName?: string;
  userAvatar?: string;
  electionStatus?: {
    isActive: boolean;
    name: string;
    endTime?: string;
  };
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  action_url?: string;
}

const Header = ({
  userRole = null,
  userName = 'Guest User',
  userAvatar,
  electionStatus,
}: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  // Fetch notifications when component mounts
  useEffect(() => {
    if (userRole) {
      fetchNotifications();
    }
  }, [userRole]);

  const fetchNotifications = async () => {
    try {
      // Get current user ID
      const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
      
      if (!userId) return;

      // Fetch notifications for this user
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      if (data) {
        setNotifications(data);
        const unread = data.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      // Update notification as read in database
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (!error) {
        // Update local state
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }

    // Navigate to action URL if provided
    if (notification.action_url) {
      router.push(notification.action_url);
      setIsNotificationOpen(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'election':
        return 'CheckBadgeIcon';
      case 'result':
        return 'ChartBarIcon';
      case 'application':
        return 'DocumentTextIcon';
      case 'approval':
        return 'CheckCircleIcon';
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
        return 'text-success';
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
    const notifDate = new Date(timestamp);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString();
  };

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/student-dashboard',
      pathOverrides: {
        admin: '/admin-dashboard',
        commission: '/electoral-commission-panel',
      },
      icon: 'HomeIcon',
      roles: ['student', 'candidate', 'commission', 'admin'],
    },
    {
      label: 'Campaign Feed',
      path: '/campaign-feed',
      icon: 'ChatBubbleLeftRightIcon',
      roles: ['student', 'candidate'],
    },
    {
      label: 'Vote',
      path: '/voting-interface',
      icon: 'CheckBadgeIcon',
      roles: ['student'],
      requiresActiveElection: true,
    },
    {
      label: 'Apply',
      path: '/candidate-registration',
      icon: 'DocumentTextIcon',
      roles: ['student'],
    },
    {
      label: 'Results',
      path: '/student-election-results',
      icon: 'ChartBarIcon',
      roles: ['student', 'candidate', 'commission', 'admin'],
      pathOverrides: {
        admin: '/admin-election-results',
        commission: '/electoral-commission-panel/election-results',
      },
    },
    {
      label: 'Import Data',
      path: '/electoral-commission-panel/import-students',
      icon: 'ArrowUpTrayIcon',
      roles: ['commission'],
    },
    {
      label: 'Manage Elections',
      path: '/admin-system-control/election',
      icon: 'Cog6ToothIcon',
      roles: ['admin'],
    },
  ];

  const visibleNavItems = navigationItems.filter((item) => {
    if (!userRole) return false;
    if (!item.roles.includes(userRole)) return false;
    if (item.requiresActiveElection && !electionStatus?.isActive) return false;
    return true;
  });

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsProfileMenuOpen(false);
    setIsNotificationOpen(false);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
    setIsNotificationOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
    setIsProfileMenuOpen(false);
  };

  const handleLogout = () => {
    clearUserSession();
    router.push('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-card shadow-md z-[1000]">
      <div className="mx-4 lg:mx-6">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-8">
            <Link
              href={
                !userRole
                  ? '/login'
                  : userRole === 'admin'
                    ? '/admin-dashboard'
                    : '/student-dashboard'
              }
              className="flex items-center"
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-transform duration-250 ease-smooth hover:scale-105"
              >
                <rect width="48" height="48" rx="12" fill="var(--color-primary)" />
                <path
                  d="M24 12L14 18V26C14 31.52 18.02 36.52 24 38C29.98 36.52 34 31.52 34 26V18L24 12Z"
                  fill="var(--color-primary-foreground)"
                />
                <path
                  d="M22 28L18 24L19.41 22.59L22 25.17L28.59 18.58L30 20L22 28Z"
                  fill="var(--color-accent)"
                />
              </svg>
              <span className="ml-3 text-xl font-heading font-semibold text-primary hidden sm:block">
                UTASVotes
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-2">
              {visibleNavItems.map((item) => {
                const path =
                  userRole && (item as any).pathOverrides && (item as any).pathOverrides[userRole]
                    ? (item as any).pathOverrides[userRole]
                    : item.path;
                return (
                  <Link
                    key={path}
                    href={path}
                    className="flex items-center gap-2 px-4 py-2 rounded-md text-foreground hover:bg-muted transition-all duration-250 ease-smooth hover:-translate-y-0.5"
                  >
                    <Icon name={item.icon as any} size={20} variant="outline" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {electionStatus && (
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-md bg-muted">
                <div
                  className={`w-2 h-2 rounded-full ${
                    electionStatus.isActive ? 'bg-success animate-pulse' : 'bg-muted-foreground'
                  }`}
                />
                <span className="text-sm font-caption text-muted-foreground">
                  {electionStatus.isActive ? `${electionStatus.name} Active` : 'No Active Election'}
                </span>
              </div>
            )}

            {userRole && (
              <>
                <button
                  onClick={toggleNotifications}
                  className="relative p-2 rounded-md hover:bg-muted transition-all duration-250 ease-smooth"
                  aria-label="Notifications"
                >
                  <Icon name="BellIcon" size={24} variant="outline" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-error-foreground text-xs font-caption rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-all duration-250 ease-smooth"
                  aria-label="User menu"
                >
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center overflow-hidden">
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt={userName || 'User profile'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/assets/images/no_image.png';
                        }}
                      />
                    ) : (
                      <img
                        src="/assets/images/no_image.png"
                        alt={userName || 'User profile'}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <Icon
                    name="ChevronDownIcon"
                    size={20}
                    variant="outline"
                    className="hidden lg:block text-muted-foreground"
                  />
                </button>
              </>
            )}

            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-md hover:bg-muted transition-all duration-250 ease-smooth"
              aria-label="Toggle menu"
            >
              <Icon
                name={isMobileMenuOpen ? 'XMarkIcon' : 'Bars3Icon'}
                size={24}
                variant="outline"
              />
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden bg-card border-t border-border">
          <nav className="px-4 py-4 space-y-2">
            {visibleNavItems.map((item) => {
              const path =
                userRole && (item as any).pathOverrides && (item as any).pathOverrides[userRole]
                  ? (item as any).pathOverrides[userRole]
                  : item.path;
              return (
                <Link
                  key={path}
                  href={path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-md text-foreground hover:bg-muted transition-all duration-250 ease-smooth"
                >
                  <Icon name={item.icon as any} size={20} variant="outline" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {isProfileMenuOpen && userRole && (
        <div className="absolute top-20 right-4 lg:right-6 w-64 bg-popover border border-border rounded-md shadow-lg z-[1100]">
          <div className="p-4 border-b border-border">
            <p className="font-medium text-popover-foreground">{userName}</p>
            <p className="text-sm text-muted-foreground capitalize">{userRole}</p>
          </div>
          <div className="py-2">
            <button
              onClick={() => {
                setIsProfileMenuOpen(false);
                const profilePath =
                  userRole === 'admin'
                    ? '/admin-profile'
                    : userRole === 'commission'
                      ? '/commission-profile'
                      : '/profile';
                router.push(profilePath);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-muted transition-all duration-250 ease-smooth"
            >
              <Icon name="UserCircleIcon" size={20} variant="outline" />
              <span>Profile</span>
            </button>
            <button
              onClick={() => {
                setIsProfileMenuOpen(false);
                const settingsPath =
                  userRole === 'admin'
                    ? '/admin-settings'
                    : userRole === 'commission'
                      ? '/commission-settings'
                      : '/settings';
                router.push(settingsPath);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-muted transition-all duration-250 ease-smooth"
            >
              <Icon name="Cog6ToothIcon" size={20} variant="outline" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => {
                handleLogout();
                setIsProfileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-left text-error hover:bg-muted transition-all duration-250 ease-smooth"
            >
              <Icon name="ArrowRightOnRectangleIcon" size={20} variant="outline" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {isNotificationOpen && userRole && (
        <div className="absolute top-20 right-4 lg:right-24 w-80 bg-popover border border-border rounded-md shadow-lg z-[1100] max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-heading font-semibold text-lg">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={() => fetchNotifications()}
                className="text-xs text-primary hover:underline"
              >
                Refresh
              </button>
            )}
          </div>
          <div className="py-2">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`px-4 py-3 hover:bg-muted transition-all duration-250 ease-smooth cursor-pointer border-l-2 ${
                    notification.is_read ? 'border-transparent' : 'border-accent bg-accent/5'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon
                      name={getNotificationIcon(notification.type) as any}
                      size={20}
                      variant={notification.is_read ? 'outline' : 'solid'}
                      className={getNotificationColor(notification.type)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${notification.is_read ? 'font-normal' : 'font-semibold'}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(notification.created_at)}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <Icon
                  name="BellSlashIcon"
                  size={48}
                  variant="outline"
                  className="mx-auto text-muted-foreground"
                />
                <p className="text-sm text-muted-foreground mt-4">No notifications yet</p>
                <p className="text-xs text-muted-foreground mt-2">
                  You'll receive notifications about elections, results, and system updates
                </p>
              </div>
            )}
          </div>
          {notifications.length > 0 && (
            <div className="p-3 border-t border-border">
              <button
                onClick={() => {
                  setIsNotificationOpen(false);
                  router.push('/notifications');
                }}
                className="w-full text-sm text-primary hover:underline text-center"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
