import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface ElectionCardProps {
  id: string;
  title: string;
  type: 'departmental' | 'university-wide';
  status: 'active' | 'upcoming' | 'ended';
  startDate: string;
  endDate: string;
  totalCandidates: number;
  hasVoted: boolean;
  description: string;
}

const ElectionCard = ({
  id,
  title,
  type,
  status,
  startDate,
  endDate,
  totalCandidates,
  hasVoted,
  description,
}: ElectionCardProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'bg-success text-success-foreground';
      case 'upcoming':
        return 'bg-warning text-warning-foreground';
      case 'ended':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = () => {
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

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-250 ease-smooth">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon
              name={getTypeIcon() as any}
              size={24}
              variant="outline"
              className="text-primary"
            />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-lg text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground capitalize">{type.replace('-', ' ')}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-caption ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Icon name="CalendarIcon" size={16} variant="outline" className="text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Start Date</p>
            <p className="text-sm font-data text-foreground">{startDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="ClockIcon" size={16} variant="outline" className="text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">End Date</p>
            <p className="text-sm font-data text-foreground">{endDate}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Icon
            name="UserGroupIcon"
            size={20}
            variant="outline"
            className="text-muted-foreground"
          />
          <span className="text-sm text-muted-foreground">
            {totalCandidates} Candidate{totalCandidates !== 1 ? 's' : ''}
          </span>
        </div>

        {status === 'active' && (
          <Link
            href={`/voting-interface?election=${id}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-250 ease-smooth ${
              hasVoted
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5'
            }`}
          >
            <Icon
              name={hasVoted ? 'CheckCircleIcon' : 'CheckBadgeIcon'}
              size={20}
              variant="solid"
            />
            <span className="font-medium">{hasVoted ? 'Voted' : 'Vote Now'}</span>
          </Link>
        )}

        {status === 'ended' && (
          <Link
            href={`/election-results?election=${id}`}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-250 ease-smooth hover:-translate-y-0.5"
          >
            <Icon name="ChartBarIcon" size={20} variant="outline" />
            <span className="font-medium">View Results</span>
          </Link>
        )}

        {status === 'upcoming' && (
          <button
            disabled
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-muted text-muted-foreground cursor-not-allowed"
          >
            <Icon name="ClockIcon" size={20} variant="outline" />
            <span className="font-medium">Not Started</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ElectionCard;
