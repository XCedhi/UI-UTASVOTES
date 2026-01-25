'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface UserProfileMenuProps {
  userName: string;
  userEmail?: string;
  userRole: 'student' | 'candidate' | 'commission' | 'admin';
  userAvatar?: string;
  onLogout?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  className?: string;
}

const UserProfileMenu = ({
  userName,
  userEmail,
  userRole,
  userAvatar,
  onLogout,
  onProfileClick,
  onSettingsClick,
  className = '',
}: UserProfileMenuProps) => {
  const getRoleBadgeColor = () => {
    switch (userRole) {
      case 'admin':
        return 'bg-error text-error-foreground';
      case 'commission':
        return 'bg-primary text-primary-foreground';
      case 'candidate':
        return 'bg-accent text-accent-foreground';
      case 'student':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case 'admin':
        return 'System Administrator';
      case 'commission':
        return 'Electoral Commission';
      case 'candidate':
        return 'Candidate';
      case 'student':
        return 'Student Voter';
      default:
        return 'User';
    }
  };

  const menuItems = [
    {
      label: 'My Profile',
      icon: 'UserCircleIcon',
      onClick: onProfileClick,
      show: true,
    },
    {
      label: 'Settings',
      icon: 'Cog6ToothIcon',
      onClick: onSettingsClick,
      show: true,
    },
    {
      label: 'Help & Support',
      icon: 'QuestionMarkCircleIcon',
      onClick: () => console.log('Help clicked'),
      show: true,
    },
  ];

  return (
    <div className={`w-72 bg-popover border border-border rounded-md shadow-lg ${className}`}>
      <div className="p-4 border-b border-border">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center overflow-hidden flex-shrink-0">
            {userAvatar ? (
              <AppImage
                src={userAvatar}
                alt={userName}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              <Icon name="UserIcon" size={28} variant="solid" className="text-primary-foreground" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-medium text-popover-foreground truncate">{userName}</p>
            {userEmail && (
              <p className="text-sm text-muted-foreground truncate mt-0.5">{userEmail}</p>
            )}
            <span
              className={`inline-block px-2 py-0.5 rounded text-xs font-caption mt-2 ${getRoleBadgeColor()}`}
            >
              {getRoleLabel()}
            </span>
          </div>
        </div>
      </div>

      <div className="py-2">
        {menuItems
          .filter((item) => item.show)
          .map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-popover-foreground hover:bg-muted transition-all duration-250 ease-smooth"
            >
              <Icon name={item.icon as any} size={20} variant="outline" />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
      </div>

      {(userRole === 'commission' || userRole === 'admin') && (
        <>
          <div className="border-t border-border" />
          <div className="py-2">
            <Link
              href="/electoral-commission-panel"
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-popover-foreground hover:bg-muted transition-all duration-250 ease-smooth"
            >
              <Icon name="ShieldCheckIcon" size={20} variant="outline" />
              <span className="text-sm">Admin Panel</span>
            </Link>
          </div>
        </>
      )}

      <div className="border-t border-border" />
      <div className="py-2">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-error hover:bg-muted transition-all duration-250 ease-smooth"
        >
          <Icon name="ArrowRightOnRectangleIcon" size={20} variant="outline" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>

      <div className="px-4 py-3 border-t border-border bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">UTASVotes Electoral System v2.0</p>
        <p className="text-xs text-muted-foreground text-center mt-1">
          © 2026 University of Tasmania
        </p>
      </div>
    </div>
  );
};

export default UserProfileMenu;
