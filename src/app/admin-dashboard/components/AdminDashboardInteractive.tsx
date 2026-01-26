'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';

interface SystemMetric {
  label: string;
  value: string | number;
  change: number;
  icon: string;
  color: string;
  trend: 'up' | 'down' | 'neutral';
}

interface RecentActivity {
  id: string;
  type: 'election' | 'user' | 'system' | 'security';
  title: string;
  description: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'success';
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

const AdminDashboardInteractive = () => {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d');

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const systemMetrics: SystemMetric[] = [
    {
      label: 'Total Users',
      value: '12,847',
      change: 8.2,
      icon: 'UsersIcon',
      color: 'primary',
      trend: 'up',
    },
    {
      label: 'Active Elections',
      value: 3,
      change: 0,
      icon: 'CheckBadgeIcon',
      color: 'success',
      trend: 'neutral',
    },
    {
      label: 'Total Votes Cast',
      value: '8,234',
      change: 15.3,
      icon: 'ChartBarIcon',
      color: 'accent',
      trend: 'up',
    },
    {
      label: 'System Uptime',
      value: '99.9%',
      change: 0.1,
      icon: 'ServerIcon',
      color: 'success',
      trend: 'up',
    },
    {
      label: 'Pending Applications',
      value: 24,
      change: -12.5,
      icon: 'DocumentTextIcon',
      color: 'warning',
      trend: 'down',
    },
    {
      label: 'Security Alerts',
      value: 2,
      change: -50,
      icon: 'ShieldExclamationIcon',
      color: 'error',
      trend: 'down',
    },
  ];

  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'election',
      title: 'New Election Created',
      description: 'Student Council Elections 2026 has been created by EC Admin',
      timestamp: '2026-01-25T10:30:00',
      severity: 'success',
    },
    {
      id: '2',
      type: 'user',
      title: 'Bulk User Import',
      description: '1,234 new student accounts imported successfully',
      timestamp: '2026-01-25T09:15:00',
      severity: 'info',
    },
    {
      id: '3',
      type: 'security',
      title: 'Failed Login Attempts',
      description: '5 failed login attempts detected from IP 192.168.1.100',
      timestamp: '2026-01-25T08:45:00',
      severity: 'warning',
    },
    {
      id: '4',
      type: 'system',
      title: 'Database Backup Completed',
      description: 'Scheduled backup completed successfully (2.4 GB)',
      timestamp: '2026-01-25T03:00:00',
      severity: 'success',
    },
    {
      id: '5',
      type: 'election',
      title: 'Voting Period Extended',
      description: 'Departmental Elections deadline extended by 24 hours',
      timestamp: '2026-01-24T16:20:00',
      severity: 'info',
    },
  ];

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Import Student Data',
      description: 'Upload Excel file to create student accounts',
      icon: 'ArrowUpTrayIcon',
      href: '/admin-system-control/users/import',
      color: 'primary',
    },
    {
      id: '2',
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: 'UsersIcon',
      href: '/admin-system-control/users/manage',
      color: 'accent',
    },
    {
      id: '3',
      title: 'View Results',
      description: 'Access election results and analytics',
      icon: 'ChartBarIcon',
      href: '/admin-election-results',
      color: 'success',
    },
    {
      id: '4',
      title: 'System Status',
      description: 'Monitor system health and performance',
      icon: 'ServerIcon',
      href: '/admin-system-control/ops/status',
      color: 'warning',
    },
    {
      id: '5',
      title: 'Security Alerts',
      description: 'Review security incidents and logs',
      icon: 'ShieldCheckIcon',
      href: '/admin-system-control/ops/alerts',
      color: 'error',
    },
    {
      id: '6',
      title: 'Export Data',
      description: 'Generate reports and export data',
      icon: 'ArrowDownTrayIcon',
      href: '/admin-system-control/election/export',
      color: 'muted',
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success':
        return 'bg-success/10 text-success border-success/20';
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'error':
        return 'bg-error/10 text-error border-error/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const getMetricColor = (color: string) => {
    switch (color) {
      case 'primary':
        return 'bg-primary/10 text-primary';
      case 'success':
        return 'bg-success/10 text-success';
      case 'warning':
        return 'bg-warning/10 text-warning';
      case 'error':
        return 'bg-error/10 text-error';
      case 'accent':
        return 'bg-accent/10 text-accent';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (hours < 1) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <Header userRole="admin" userName="Admin" notificationCount={0} />
        <main className="pt-24 pb-12 px-4 lg:px-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="h-32 bg-muted animate-pulse rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        userRole="admin"
        userName="System Administrator"
        userAvatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"
        notificationCount={5}
        electionStatus={{
          isActive: true,
          name: 'Student Council Elections 2026',
          endTime: '2026-02-15T23:59:59',
        }}
      />

      <main className="pt-24 pb-12 px-4 lg:px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                System overview and administrative controls for UTASVotes
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                className="px-4 py-2 bg-card border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>

          {/* System Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systemMetrics.map((metric) => (
              <div
                key={metric.label}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-250 ease-smooth"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-lg ${getMetricColor(metric.color)} flex items-center justify-center`}
                  >
                    <Icon name={metric.icon as any} size={24} variant="outline" />
                  </div>
                  {metric.trend !== 'neutral' && (
                    <div
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                        metric.trend === 'up'
                          ? 'bg-success/10 text-success'
                          : 'bg-error/10 text-error'
                      }`}
                    >
                      <Icon
                        name={metric.trend === 'up' ? 'ArrowUpIcon' : 'ArrowDownIcon'}
                        size={12}
                        variant="solid"
                      />
                      {Math.abs(metric.change)}%
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                  <p className="text-2xl font-heading font-bold text-foreground">{metric.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="font-heading font-semibold text-xl text-foreground mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => router.push(action.href)}
                  className="bg-card border border-border rounded-lg p-4 text-left hover:shadow-md hover:border-primary/50 transition-all duration-250 ease-smooth group"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-md ${getMetricColor(action.color)} flex items-center justify-center group-hover:scale-110 transition-transform duration-250`}
                    >
                      <Icon name={action.icon as any} size={20} variant="outline" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground mb-1">{action.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {action.description}
                      </p>
                    </div>
                    <Icon
                      name="ChevronRightIcon"
                      size={20}
                      variant="outline"
                      className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-250"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="font-heading font-semibold text-xl text-foreground mb-4">
              Recent Activity
            </h2>
            <div className="bg-card border border-border rounded-lg divide-y divide-border">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="p-4 hover:bg-muted/30 transition-colors duration-250"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`px-3 py-1 rounded-md border ${getSeverityColor(activity.severity)}`}
                    >
                      <Icon
                        name={
                          activity.type === 'election'
                            ? 'CheckBadgeIcon'
                            : activity.type === 'user'
                              ? 'UsersIcon'
                              : activity.type === 'security'
                                ? 'ShieldExclamationIcon'
                                : 'ServerIcon'
                        }
                        size={20}
                        variant="outline"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground mb-1">{activity.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                      <p className="text-xs text-muted-foreground font-caption">
                        {formatTimestamp(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardInteractive;
