import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface SystemStatusProps {
  className?: string;
}

const SystemStatus = ({ className = '' }: SystemStatusProps) => {
  const systemMetrics = [
    {
      label: 'System Status',
      value: 'Operational',
      status: 'success',
      icon: 'CheckCircleIcon',
    },
    {
      label: 'Active Elections',
      value: '3',
      status: 'primary',
      icon: 'CheckBadgeIcon',
    },
    {
      label: 'Total Voters',
      value: '12,847',
      status: 'accent',
      icon: 'UsersIcon',
    },
    {
      label: 'Votes Cast Today',
      value: '2,341',
      status: 'success',
      icon: 'ChartBarIcon',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-success/10 text-success border-success/20';
      case 'primary':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'accent':
        return 'bg-accent/10 text-accent border-accent/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div
      className={`bg-card/80 backdrop-blur-md border border-border rounded-lg shadow-lg p-6 ${className}`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
          <Icon name="ServerIcon" size={24} variant="outline" className="text-success" />
        </div>
        <div>
          <h3 className="text-xl font-heading font-semibold text-foreground">System Status</h3>
          <p className="text-sm text-muted-foreground">Real-time electoral system metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {systemMetrics.map((metric, index) => (
          <div
            key={index}
            className={`p-4 border rounded-md ${getStatusColor(metric.status)} transition-all duration-250 ease-smooth hover:scale-105`}
          >
            <div className="flex items-center gap-3">
              <Icon name={metric.icon as any} size={24} variant="outline" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-caption opacity-80">{metric.label}</p>
                <p className="text-lg font-data font-medium mt-1">{metric.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>Last updated: Just now</span>
          </div>
          <span className="font-caption">GMT</span>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;
