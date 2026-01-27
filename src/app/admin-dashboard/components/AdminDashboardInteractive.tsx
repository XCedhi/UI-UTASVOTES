'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';
import { supabase } from '@/lib/supabase';

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
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeElection, setActiveElection] = useState<any>(null);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    setIsHydrated(true);
    fetchUserProfile();
    fetchDashboardData();
  }, []);

  const fetchUserProfile = async () => {
    try {
      // Get current user session
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserProfile(profile);
        }

        // Fetch unread notifications count
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false);

        setNotificationCount(count || 0);
      }

      // Fetch active election
      const now = new Date().toISOString();
      const { data: elections } = await supabase
        .from('elections')
        .select('*')
        .lte('voting_start', now)
        .gte('voting_end', now)
        .order('voting_start', { ascending: false })
        .limit(1);

      if (elections && elections.length > 0) {
        setActiveElection(elections[0]);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch total users
      const { count: totalUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch active elections
      const { count: activeElections } = await supabase
        .from('elections')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fetch total votes
      const { count: totalVotes } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true });

      // Fetch pending applications
      const { count: pendingApplications } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Fetch security alerts
      const { count: securityAlerts } = await supabase
        .from('system_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('is_resolved', false);

      // Update system metrics with real data
      setSystemMetrics([
        {
          label: 'Total Users',
          value: totalUsers || 0,
          change: 0,
          icon: 'UsersIcon',
          color: 'primary',
          trend: 'neutral',
        },
        {
          label: 'Active Elections',
          value: activeElections || 0,
          change: 0,
          icon: 'CheckBadgeIcon',
          color: 'success',
          trend: 'neutral',
        },
        {
          label: 'Total Votes Cast',
          value: totalVotes || 0,
          change: 0,
          icon: 'ChartBarIcon',
          color: 'accent',
          trend: 'neutral',
        },
        {
          label: 'System Uptime',
          value: '99.9%',
          change: 0,
          icon: 'ServerIcon',
          color: 'success',
          trend: 'neutral',
        },
        {
          label: 'Pending Applications',
          value: pendingApplications || 0,
          change: 0,
          icon: 'DocumentTextIcon',
          color: 'warning',
          trend: 'neutral',
        },
        {
          label: 'Security Alerts',
          value: securityAlerts || 0,
          change: 0,
          icon: 'ShieldExclamationIcon',
          color: 'error',
          trend: 'neutral',
        },
      ]);

      // Fetch recent activity logs
      const { data: activityLogs } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (activityLogs && activityLogs.length > 0) {
        const activities: RecentActivity[] = activityLogs.map((log: any) => ({
          id: log.id,
          type: log.action_type === 'creation' ? 'election' : 
                log.action_type === 'approval' || log.action_type === 'rejection' ? 'user' : 
                'system',
          title: log.action,
          description: log.target || 'System activity',
          timestamp: log.created_at,
          severity: log.action_type === 'approval' || log.action_type === 'creation' ? 'success' :
                    log.action_type === 'rejection' ? 'warning' : 'info',
        }));
        setRecentActivities(activities);
      } else {
        // Show placeholder if no activity logs
        setRecentActivities([
          {
            id: '1',
            type: 'system',
            title: 'System Initialized',
            description: 'Dashboard is ready. Start by creating elections or importing users.',
            timestamp: new Date().toISOString(),
            severity: 'info',
          },
        ]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
      
      // Set default values on error
      setSystemMetrics([
        {
          label: 'Total Users',
          value: 0,
          change: 0,
          icon: 'UsersIcon',
          color: 'primary',
          trend: 'neutral',
        },
        {
          label: 'Active Elections',
          value: 0,
          change: 0,
          icon: 'CheckBadgeIcon',
          color: 'success',
          trend: 'neutral',
        },
        {
          label: 'Total Votes Cast',
          value: 0,
          change: 0,
          icon: 'ChartBarIcon',
          color: 'accent',
          trend: 'neutral',
        },
        {
          label: 'System Uptime',
          value: '99.9%',
          change: 0,
          icon: 'ServerIcon',
          color: 'success',
          trend: 'neutral',
        },
        {
          label: 'Pending Applications',
          value: 0,
          change: 0,
          icon: 'DocumentTextIcon',
          color: 'warning',
          trend: 'neutral',
        },
        {
          label: 'Security Alerts',
          value: 0,
          change: 0,
          icon: 'ShieldExclamationIcon',
          color: 'error',
          trend: 'neutral',
        },
      ]);
    }
  };

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

  if (!isHydrated || loading) {
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
        userName={userProfile?.full_name || 'System Administrator'}
        userAvatar={userProfile?.avatar_url || userProfile?.profile_picture_url}
        notificationCount={notificationCount}
        electionStatus={
          activeElection
            ? {
                isActive: true,
                name: activeElection.name,
                endTime: activeElection.voting_end,
              }
            : undefined
        }
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
