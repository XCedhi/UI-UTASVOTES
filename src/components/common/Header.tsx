'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { clearUserSession } from '@/lib/auth-utils';

interface HeaderProps {
  userRole?: 'student' | 'candidate' | 'commission' | 'admin' | null;
  userName?: string;
  userAvatar?: string;
  notificationCount?: number;
  electionStatus?: {
    isActive: boolean;
    name: string;
    endTime?: string;
  };
}

const Header = ({
  userRole = null,
  userName = 'Guest User',
  userAvatar,
  notificationCount = 0,
  electionStatus,
}: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const router = useRouter();

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
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-error-foreground text-xs font-caption rounded-full flex items-center justify-center">
                      {notificationCount > 9 ? '9+' : notificationCount}
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
                        alt={userName}
                        className="w-full h-full object-cover"
                        key={userAvatar.substring(0, 100)}
                      />
                    ) : (
                      <Icon
                        name="UserIcon"
                        size={24}
                        variant="solid"
                        className="text-primary-foreground"
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
          <div className="p-4 border-b border-border">
            <h3 className="font-heading font-semibold text-lg">Notifications</h3>
          </div>
          <div className="py-2">
            {notificationCount > 0 ? (
              <>
                <div className="px-4 py-3 hover:bg-muted transition-all duration-250 ease-smooth cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Election Results Available</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Results for Student Council 2026 are now available
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 hover:bg-muted transition-all duration-250 ease-smooth cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Voting Period Extended</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Voting deadline extended to January 25, 2026
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">5 hours ago</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="px-4 py-8 text-center">
                <Icon
                  name="BellSlashIcon"
                  size={48}
                  variant="outline"
                  className="mx-auto text-muted-foreground"
                />
                <p className="text-sm text-muted-foreground mt-4">No new notifications</p>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
