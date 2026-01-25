'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface ElectionStatusIndicatorProps {
  isActive: boolean;
  electionName: string;
  endTime?: string;
  startTime?: string;
  className?: string;
}

const ElectionStatusIndicator = ({
  isActive,
  electionName,
  endTime,
  startTime,
  className = '',
}: ElectionStatusIndicatorProps) => {
  const formatTimeRemaining = (endTimeStr: string) => {
    const end = new Date(endTimeStr);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const formatStartTime = (startTimeStr: string) => {
    const start = new Date(startTimeStr);
    const now = new Date();
    const diff = start.getTime() - now.getTime();

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `Starts in ${days}d ${hours}h`;
    if (hours > 0) return `Starts in ${hours}h`;
    return 'Starting soon';
  };

  const getStatusColor = () => {
    if (isActive) {
      if (endTime) {
        const end = new Date(endTime);
        const now = new Date();
        const hoursRemaining = (end.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursRemaining <= 2) return 'bg-error';
        if (hoursRemaining <= 24) return 'bg-warning';
      }
      return 'bg-success';
    }
    return 'bg-muted-foreground';
  };

  const getStatusText = () => {
    if (isActive) {
      return endTime ? formatTimeRemaining(endTime) : 'Active';
    }
    if (startTime) {
      const upcomingText = formatStartTime(startTime);
      if (upcomingText) return upcomingText;
    }
    return 'No Active Election';
  };

  const getStatusIcon = () => {
    if (isActive) {
      return 'CheckBadgeIcon';
    }
    if (startTime && new Date(startTime) > new Date()) {
      return 'ClockIcon';
    }
    return 'XCircleIcon';
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2 rounded-md bg-card border border-border ${className}`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${getStatusColor()} ${isActive ? 'animate-pulse' : ''}`}
        />
        <Icon
          name={getStatusIcon() as any}
          size={20}
          variant="outline"
          className="text-muted-foreground"
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{electionName}</p>
        <p className="text-xs text-muted-foreground font-caption">{getStatusText()}</p>
      </div>

      {isActive && endTime && (
        <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-muted">
          <Icon name="ClockIcon" size={16} variant="outline" className="text-muted-foreground" />
          <span className="text-xs font-data text-muted-foreground">
            {new Date(endTime).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      )}
    </div>
  );
};

export default ElectionStatusIndicator;
