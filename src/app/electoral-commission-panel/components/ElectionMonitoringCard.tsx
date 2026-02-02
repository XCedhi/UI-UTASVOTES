'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface ElectionData {
  id: string;
  name: string;
  status: 'active' | 'scheduled' | 'completed';
  totalVoters: number;
  votedCount: number;
  startDate: string;
  endDate: string;
  positions: number;
  candidates: number;
  turnoutPercentage: number;
}

interface ElectionMonitoringCardProps {
  election: ElectionData;
  onViewAnalytics: (id: string) => void;
  onManageElection: (id: string) => void;
  onDeleteElection?: (id: string) => void;
}

const ElectionMonitoringCard = ({
  election,
  onViewAnalytics,
  onManageElection,
  onDeleteElection,
}: ElectionMonitoringCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success text-success-foreground';
      case 'scheduled':
        return 'bg-warning text-warning-foreground';
      case 'completed':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return 'PlayIcon';
      case 'scheduled':
        return 'ClockIcon';
      case 'completed':
        return 'CheckCircleIcon';
      default:
        return 'InformationCircleIcon';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getTurnoutColor = (percentage: number) => {
    if (percentage >= 70) return 'text-success';
    if (percentage >= 40) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="bg-card border border-border rounded-md p-6 hover:shadow-md transition-all duration-250 ease-smooth">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-semibold text-lg text-foreground mb-1">
            {election.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {formatDate(election.startDate)} - {formatDate(election.endDate)}
          </p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-caption flex items-center gap-1 ${getStatusColor(election.status)}`}
        >
          <Icon name={getStatusIcon(election.status) as any} size={14} variant="solid" />
          {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-muted rounded-md p-3">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="UsersIcon" size={16} variant="outline" className="text-muted-foreground" />
            <span className="text-xs font-caption text-muted-foreground">Total Voters</span>
          </div>
          <p className="text-2xl font-heading font-semibold text-foreground font-data">
            {election.totalVoters.toLocaleString()}
          </p>
        </div>

        <div className="bg-muted rounded-md p-3">
          <div className="flex items-center gap-2 mb-1">
            <Icon
              name="CheckBadgeIcon"
              size={16}
              variant="outline"
              className="text-muted-foreground"
            />
            <span className="text-xs font-caption text-muted-foreground">Voted</span>
          </div>
          <p className="text-2xl font-heading font-semibold text-foreground font-data">
            {election.votedCount.toLocaleString()}
          </p>
        </div>

        <div className="bg-muted rounded-md p-3">
          <div className="flex items-center gap-2 mb-1">
            <Icon
              name="BriefcaseIcon"
              size={16}
              variant="outline"
              className="text-muted-foreground"
            />
            <span className="text-xs font-caption text-muted-foreground">Positions</span>
          </div>
          <p className="text-2xl font-heading font-semibold text-foreground font-data">
            {election.positions}
          </p>
        </div>

        <div className="bg-muted rounded-md p-3">
          <div className="flex items-center gap-2 mb-1">
            <Icon
              name="UserGroupIcon"
              size={16}
              variant="outline"
              className="text-muted-foreground"
            />
            <span className="text-xs font-caption text-muted-foreground">Candidates</span>
          </div>
          <p className="text-2xl font-heading font-semibold text-foreground font-data">
            {election.candidates}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-caption text-muted-foreground">Voter Turnout</span>
          <span
            className={`text-sm font-data font-semibold ${getTurnoutColor(election.turnoutPercentage)}`}
          >
            {election.turnoutPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ease-smooth ${
              election.turnoutPercentage >= 70
                ? 'bg-success'
                : election.turnoutPercentage >= 40
                  ? 'bg-warning'
                  : 'bg-error'
            }`}
            style={{ width: `${election.turnoutPercentage}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onViewAnalytics(election.id)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250 ease-smooth"
        >
          <Icon name="ChartBarIcon" size={16} variant="outline" />
          <span className="text-sm font-medium">View Analytics</span>
        </button>

        <button
          onClick={() => onManageElection(election.id)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-all duration-250 ease-smooth"
        >
          <Icon name="Cog6ToothIcon" size={16} variant="outline" />
          <span className="text-sm font-medium">Manage</span>
        </button>

        {onDeleteElection && (
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete "${election.name}"? This action cannot be undone.`)) {
                onDeleteElection(election.id);
              }
            }}
            className="px-4 py-2 bg-error/10 text-error border border-error/20 rounded-md hover:bg-error/20 transition-all duration-250 ease-smooth"
            title="Delete Election"
          >
            <Icon name="TrashIcon" size={16} variant="outline" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ElectionMonitoringCard;
