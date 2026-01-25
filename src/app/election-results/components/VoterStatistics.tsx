'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface StatisticItem {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface VoterStatisticsProps {
  statistics: StatisticItem[];
}

const VoterStatistics = ({ statistics }: VoterStatisticsProps) => {
  return (
    <div className="bg-card border border-border rounded-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="ChartPieIcon" size={24} variant="outline" className="text-primary" />
        <h3 className="text-lg font-heading font-semibold text-foreground">Voter Statistics</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {statistics.map((stat, index) => (
          <div key={index} className="bg-muted rounded-md p-4">
            <div className="flex items-start justify-between mb-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.color}`}
              >
                <Icon name={stat.icon as any} size={20} variant="outline" className="text-white" />
              </div>
              {stat.trend && (
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded ${
                    stat.trend.isPositive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                  }`}
                >
                  <Icon
                    name={stat.trend.isPositive ? 'ArrowTrendingUpIcon' : 'ArrowTrendingDownIcon'}
                    size={14}
                    variant="outline"
                  />
                  <span className="text-xs font-data font-medium">
                    {Math.abs(stat.trend.value)}%
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-caption mb-1">{stat.label}</p>
            <p className="text-2xl font-heading font-semibold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoterStatistics;
