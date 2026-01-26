import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface QuickStat {
  label: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: string;
}

interface QuickStatsGridProps {
  stats: QuickStat[];
}

const QuickStatsGrid = ({ stats }: QuickStatsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-card border border-border rounded-md p-6 hover:shadow-md transition-all duration-250 ease-smooth"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-md ${stat.color}`}>
              <Icon name={stat.icon as any} size={24} variant="outline" />
            </div>
            {stat.trend && (
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-caption ${
                  stat.trend.isPositive ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
                }`}
              >
                <Icon
                  name={stat.trend.isPositive ? 'ArrowUpIcon' : 'ArrowDownIcon'}
                  size={12}
                  variant="solid"
                />
                <span>{Math.abs(stat.trend.value)}%</span>
              </div>
            )}
          </div>

          <p className="text-3xl font-heading font-semibold text-foreground mb-1 font-data">
            {stat.value}
          </p>
          <p className="text-sm text-muted-foreground font-caption">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

export default QuickStatsGrid;
