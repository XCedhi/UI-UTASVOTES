'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface ResultsHeaderProps {
  electionName: string;
  electionDate: string;
  totalVotes: number;
  totalEligibleVoters: number;
  status: 'ongoing' | 'completed' | 'pending';
}

const ResultsHeader = ({
  electionName,
  electionDate,
  totalVotes,
  totalEligibleVoters,
  status,
}: ResultsHeaderProps) => {
  const turnoutPercentage = ((totalVotes / totalEligibleVoters) * 100).toFixed(2);

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-success text-success-foreground';
      case 'ongoing':
        return 'bg-warning text-warning-foreground';
      case 'pending':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return 'Final Results';
      case 'ongoing':
        return 'Live Results';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="bg-card border border-border rounded-md p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl lg:text-3xl font-heading font-semibold text-foreground">
              {electionName}
            </h1>
            <span className={`px-3 py-1 rounded-full text-xs font-caption ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon name="CalendarIcon" size={16} variant="outline" />
            <span className="text-sm font-caption">{electionDate}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-muted rounded-md p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="UserGroupIcon" size={20} variant="outline" className="text-primary" />
              <span className="text-xs text-muted-foreground font-caption">Total Votes</span>
            </div>
            <p className="text-2xl font-heading font-semibold text-foreground">
              {totalVotes.toLocaleString()}
            </p>
          </div>

          <div className="bg-muted rounded-md p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="UsersIcon" size={20} variant="outline" className="text-accent" />
              <span className="text-xs text-muted-foreground font-caption">Eligible Voters</span>
            </div>
            <p className="text-2xl font-heading font-semibold text-foreground">
              {totalEligibleVoters.toLocaleString()}
            </p>
          </div>

          <div className="bg-muted rounded-md p-4 col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="ChartBarIcon" size={20} variant="outline" className="text-success" />
              <span className="text-xs text-muted-foreground font-caption">Turnout</span>
            </div>
            <p className="text-2xl font-heading font-semibold text-foreground">
              {turnoutPercentage}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsHeader;
