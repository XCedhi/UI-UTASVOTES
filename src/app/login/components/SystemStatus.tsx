'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { supabase } from '@/lib/supabase';

interface SystemMetric {
  label: string;
  value: string;
  status: 'success' | 'primary' | 'accent' | 'warning';
  icon: string;
}

interface SystemStatusProps {
  className?: string;
}

const SystemStatus = ({ className = '' }: SystemStatusProps) => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    {
      label: 'System Status',
      value: 'Loading...',
      status: 'success',
      icon: 'CheckCircleIcon',
    },
    {
      label: 'Active Elections',
      value: '0',
      status: 'primary',
      icon: 'CheckBadgeIcon',
    },
    {
      label: 'Registered Users',
      value: '0',
      status: 'accent',
      icon: 'UsersIcon',
    },
    {
      label: 'Total Candidates',
      value: '0',
      status: 'warning',
      icon: 'UserGroupIcon',
    },
  ]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSystemMetrics();
    // Refresh every 30 seconds
    const interval = setInterval(fetchSystemMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemMetrics = async () => {
    try {
      // Fetch active elections count
      const { count: activeElectionsCount } = await supabase
        .from('elections')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fetch total registered users
      const { count: usersCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fetch total candidates
      const { count: candidatesCount } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true });

      // Fetch ongoing elections (for status check)
      const { data: ongoingElections } = await supabase
        .from('elections')
        .select('id')
        .in('status', ['active', 'upcoming'])
        .limit(1);

      const systemStatus = ongoingElections && ongoingElections.length > 0 ? 'Operational' : 'Idle';

      setMetrics([
        {
          label: 'System Status',
          value: systemStatus,
          status: systemStatus === 'Operational' ? 'success' : 'accent',
          icon: systemStatus === 'Operational' ? 'CheckCircleIcon' : 'ClockIcon',
        },
        {
          label: 'Active Elections',
          value: (activeElectionsCount || 0).toString(),
          status: 'primary',
          icon: 'CheckBadgeIcon',
        },
        {
          label: 'Registered Users',
          value: formatNumber(usersCount || 0),
          status: 'accent',
          icon: 'UsersIcon',
        },
        {
          label: 'Total Candidates',
          value: (candidatesCount || 0).toString(),
          status: 'warning',
          icon: 'UserGroupIcon',
        },
      ]);

      setLastUpdated(new Date());
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toString();
  };

  const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 10) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-success/10 text-success border-success/20';
      case 'primary':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'accent':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-card/80 backdrop-blur-md border border-border rounded-lg shadow-lg p-6 ${className}`}>
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
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 border rounded-md bg-muted/20 border-border">
              <div className="h-4 bg-muted animate-pulse rounded mb-2" />
              <div className="h-6 bg-muted animate-pulse rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

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
        {metrics.map((metric, index) => (
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
            <span>Last updated: {getTimeAgo(lastUpdated)}</span>
          </div>
          <button
            onClick={fetchSystemMetrics}
            className="flex items-center gap-1 hover:text-primary transition-colors"
            title="Refresh metrics"
          >
            <Icon name="ArrowPathIcon" size={14} variant="outline" />
            <span className="font-caption">Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;
