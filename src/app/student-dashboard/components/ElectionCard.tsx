'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface Position {
  name: string;
  candidateCount: number;
}

interface ElectionCardProps {
  id: string;
  title: string;
  type: 'departmental' | 'university-wide';
  status: 'active' | 'upcoming' | 'ended';
  startDate: string;
  endDate: string;
  totalCandidates: number;
  positions?: Position[];
  hasVoted: boolean;
  description: string;
  voterTurnout?: number;
  totalVoters?: number;
}

const ElectionCard = ({
  id,
  title,
  type,
  status,
  startDate,
  endDate,
  totalCandidates,
  positions = [],
  hasVoted,
  description,
  voterTurnout = 0,
  totalVoters = 0,
}: ElectionCardProps) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    if (status !== 'active') return;

    const calculateTimeLeft = () => {
      const end = new Date(endDate).getTime();
      const now = new Date().getTime();
      const difference = end - now;

      if (difference <= 0) {
        setTimeLeft('Voting Ended');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      // Mark as urgent if less than 24 hours left
      setIsUrgent(difference < 24 * 60 * 60 * 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h left`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m left`);
      } else {
        setTimeLeft(`${minutes}m left`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [endDate, status]);

  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return hasVoted ? 'bg-success text-success-foreground' : 'bg-primary text-primary-foreground';
      case 'upcoming':
        return 'bg-warning text-warning-foreground';
      case 'ended':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = () => {
    if (status === 'active' && hasVoted) return 'You Voted ✓';
    switch (status) {
      case 'active':
        return 'Voting Open';
      case 'upcoming':
        return 'Coming Soon';
      case 'ended':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  const getTypeIcon = () => {
    return type === 'university-wide' ? 'AcademicCapIcon' : 'BuildingLibraryIcon';
  };

  const turnoutPercentage = totalVoters > 0 ? Math.round((voterTurnout / totalVoters) * 100) : 0;

  return (
    <div className={`bg-card border-2 rounded-xl p-6 hover:shadow-xl transition-all duration-300 ease-smooth ${
      status === 'active' && !hasVoted ? 'border-primary shadow-lg' : 'border-border'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon
              name={getTypeIcon() as any}
              size={28}
              variant="outline"
              className="text-primary"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-bold text-xl text-foreground mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground capitalize">{type?.replace('-', ' ') || 'Election'}</p>
          </div>
        </div>
        <span className={`px-4 py-1.5 rounded-full text-xs font-semibold ${getStatusColor()} flex-shrink-0`}>
          {getStatusText()}
        </span>
      </div>

      {/* Countdown Timer for Active Elections */}
      {status === 'active' && timeLeft && (
        <div className={`mb-4 p-3 rounded-lg ${
          isUrgent ? 'bg-error/10 border border-error/20' : 'bg-primary/10 border border-primary/20'
        }`}>
          <div className="flex items-center gap-2">
            <Icon 
              name="ClockIcon" 
              size={20} 
              variant="outline" 
              className={isUrgent ? 'text-error' : 'text-primary'}
            />
            <span className={`font-semibold ${isUrgent ? 'text-error' : 'text-primary'}`}>
              {timeLeft}
            </span>
            {isUrgent && !hasVoted && (
              <span className="ml-auto text-xs font-medium text-error">Closing Soon!</span>
            )}
          </div>
        </div>
      )}

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>

      {/* Positions & Candidates */}
      {positions.length > 0 && (
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="BriefcaseIcon" size={16} variant="outline" className="text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">Positions Available</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {positions.slice(0, 4).map((position, index) => (
              <div key={index} className="text-xs">
                <span className="text-foreground font-medium">{position.name}</span>
                <span className="text-muted-foreground"> ({position.candidateCount})</span>
              </div>
            ))}
          </div>
          {positions.length > 4 && (
            <p className="text-xs text-muted-foreground mt-2">
              +{positions.length - 4} more position{positions.length - 4 !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}

      {/* Voter Turnout */}
      {status === 'active' && totalVoters > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-foreground">Voter Turnout</span>
            <span className="text-xs font-semibold text-primary">{turnoutPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${turnoutPercentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {voterTurnout.toLocaleString()} of {totalVoters.toLocaleString()} students voted
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2">
          <Icon name="CalendarIcon" size={16} variant="outline" className="text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Start</p>
            <p className="text-sm font-semibold text-foreground">{startDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="CalendarIcon" size={16} variant="outline" className="text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">End</p>
            <p className="text-sm font-semibold text-foreground">{endDate}</p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Icon
            name="UserGroupIcon"
            size={20}
            variant="outline"
            className="text-muted-foreground"
          />
          <span className="text-sm font-medium text-foreground">
            {totalCandidates} Candidate{totalCandidates !== 1 ? 's' : ''}
          </span>
        </div>

        {status === 'active' && (
          <Link
            href={hasVoted ? '#' : `/voting-interface?election=${id}`}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all duration-250 ease-smooth font-semibold ${
              hasVoted
                ? 'bg-success/20 text-success border-2 border-success/30 cursor-default'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-1 hover:shadow-lg'
            }`}
            onClick={(e) => hasVoted && e.preventDefault()}
          >
            <Icon
              name={hasVoted ? 'CheckCircleIcon' : 'CheckBadgeIcon'}
              size={20}
              variant="solid"
            />
            <span>{hasVoted ? 'Voted' : 'Vote Now'}</span>
          </Link>
        )}

        {status === 'ended' && (
          <Link
            href={`/election-results?election=${id}`}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-250 ease-smooth hover:-translate-y-1 hover:shadow-lg font-semibold"
          >
            <Icon name="ChartBarIcon" size={20} variant="outline" />
            <span>View Results</span>
          </Link>
        )}

        {status === 'upcoming' && (
          <button
            disabled
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-muted text-muted-foreground cursor-not-allowed font-semibold"
          >
            <Icon name="ClockIcon" size={20} variant="outline" />
            <span>Not Started</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ElectionCard;
