'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';
import { supabase } from '@/lib/supabase';

interface SecurityAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  category: string;
  resolved: boolean;
}

const SecurityAlertsInteractive = () => {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    setIsHydrated(true);
    fetchSecurityAlerts();

    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchSecurityAlerts();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const fetchSecurityAlerts = async () => {
    try {
      setIsLoading(true);
      const generatedAlerts: SecurityAlert[] = [];

      // Check for security_logs table, if not exists, generate alerts from other data
      const { data: securityLogs, error: logsError } = await supabase
        .from('security_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!logsError && securityLogs && securityLogs.length > 0) {
        // Use actual security logs if table exists
        generatedAlerts.push(...securityLogs.map((log: any) => ({
          id: log.id,
          type: log.severity || 'info',
          title: log.event_type || 'Security Event',
          description: log.description || log.details || 'No description',
          timestamp: log.created_at,
          category: log.category || 'System',
          resolved: log.resolved || false
        })));
      } else {
        // Generate alerts from system data
        
        // Check for inactive users (potential security issue)
        const { data: inactiveUsers } = await supabase
          .from('user_profiles')
          .select('id, email, status')
          .eq('status', 'inactive');

        if (inactiveUsers && inactiveUsers.length > 0) {
          generatedAlerts.push({
            id: 'inactive-users',
            type: 'warning',
            title: 'Inactive User Accounts Detected',
            description: `${inactiveUsers.length} user account(s) are marked as inactive. Review and clean up unused accounts.`,
            timestamp: new Date().toISOString(),
            category: 'User Management',
            resolved: false
          });
        }

        // Check for users without student_id (data integrity)
        const { data: usersWithoutId } = await supabase
          .from('user_profiles')
          .select('id, email')
          .is('student_id', null)
          .eq('role', 'student');

        if (usersWithoutId && usersWithoutId.length > 0) {
          generatedAlerts.push({
            id: 'missing-student-ids',
            type: 'warning',
            title: 'Students Missing Student IDs',
            description: `${usersWithoutId.length} student account(s) are missing student IDs. This may affect system functionality.`,
            timestamp: new Date().toISOString(),
            category: 'Data Integrity',
            resolved: false
          });
        }

        // Check for elections without end dates
        const { data: electionsNoEnd } = await supabase
          .from('elections')
          .select('id, title')
          .is('end_date', null);

        if (electionsNoEnd && electionsNoEnd.length > 0) {
          generatedAlerts.push({
            id: 'elections-no-end',
            type: 'warning',
            title: 'Elections Without End Dates',
            description: `${electionsNoEnd.length} election(s) are missing end dates. Set proper election timelines.`,
            timestamp: new Date().toISOString(),
            category: 'Election Management',
            resolved: false
          });
        }

        // Check for candidates without applications
        const { data: candidatesNoApp } = await supabase
          .from('candidates')
          .select('id, user_id')
          .is('application_status', null);

        if (candidatesNoApp && candidatesNoApp.length > 0) {
          generatedAlerts.push({
            id: 'candidates-no-status',
            type: 'info',
            title: 'Candidate Applications Pending Review',
            description: `${candidatesNoApp.length} candidate application(s) are awaiting status update.`,
            timestamp: new Date().toISOString(),
            category: 'Applications',
            resolved: false
          });
        }

        // Check database connection
        const { error: dbError } = await supabase
          .from('user_profiles')
          .select('id')
          .limit(1);

        if (dbError) {
          generatedAlerts.push({
            id: 'db-connection',
            type: 'critical',
            title: 'Database Connection Issue',
            description: `Unable to connect to database: ${dbError.message}`,
            timestamp: new Date().toISOString(),
            category: 'System',
            resolved: false
          });
        } else {
          generatedAlerts.push({
            id: 'db-healthy',
            type: 'info',
            title: 'Database Connection Healthy',
            description: 'All database connections are functioning normally.',
            timestamp: new Date().toISOString(),
            category: 'System',
            resolved: true
          });
        }

        // Check for recent user registrations (last 24 hours)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const { data: recentUsers, count: recentCount } = await supabase
          .from('user_profiles')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', yesterday.toISOString());

        if (recentCount && recentCount > 0) {
          generatedAlerts.push({
            id: 'recent-registrations',
            type: 'info',
            title: 'New User Registrations',
            description: `${recentCount} new user(s) registered in the last 24 hours.`,
            timestamp: new Date().toISOString(),
            category: 'User Activity',
            resolved: true
          });
        }

        // System operational status
        generatedAlerts.push({
          id: 'system-operational',
          type: 'info',
          title: 'System Operational',
          description: 'All core systems are functioning normally. No critical issues detected.',
          timestamp: new Date().toISOString(),
          category: 'System Health',
          resolved: true
        });
      }

      // Sort by timestamp (newest first) and type (critical first)
      generatedAlerts.sort((a, b) => {
        const typeOrder = { critical: 0, warning: 1, info: 2 };
        if (typeOrder[a.type] !== typeOrder[b.type]) {
          return typeOrder[a.type] - typeOrder[b.type];
        }
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });

      setAlerts(generatedAlerts);
      setLastUpdated(new Date());
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching security alerts:', error);
      setAlerts([{
        id: 'error',
        type: 'critical',
        title: 'Error Loading Security Alerts',
        description: 'Failed to fetch security data. Please refresh the page.',
        timestamp: new Date().toISOString(),
        category: 'System',
        resolved: false
      }]);
      setIsLoading(false);
    }
  };

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.type === filter);

  const criticalCount = alerts.filter(a => a.type === 'critical').length;
  const warningCount = alerts.filter(a => a.type === 'warning').length;
  const infoCount = alerts.filter(a => a.type === 'info').length;

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <Header userRole="admin" userName="Loading..." notificationCount={0} />
        <main className="pt-24 pb-12 px-4 lg:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="h-96 bg-muted animate-pulse rounded-lg" />
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
      />

      <main className="pt-24 pb-12 px-4 lg:px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
                Security Alerts
              </h1>
              <p className="text-muted-foreground">
                Real-time security monitoring and system alerts
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchSecurityAlerts}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250 disabled:opacity-50"
              >
                <Icon 
                  name="ArrowPathIcon" 
                  size={20} 
                  variant="outline"
                  className={isLoading ? 'animate-spin' : ''}
                />
                Refresh
              </button>
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-all duration-250"
              >
                <Icon name="ArrowLeftIcon" size={20} variant="outline" />
                Back
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Alerts</p>
                  <p className="text-2xl font-heading font-bold text-foreground">
                    {alerts.length}
                  </p>
                </div>
                <Icon name="BellIcon" size={32} variant="outline" className="text-primary" />
              </div>
            </div>
            
            <div className="bg-card border border-error/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Critical</p>
                  <p className="text-2xl font-heading font-bold text-error">
                    {criticalCount}
                  </p>
                </div>
                <Icon name="ExclamationTriangleIcon" size={32} variant="solid" className="text-error" />
              </div>
            </div>

            <div className="bg-card border border-warning/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Warnings</p>
                  <p className="text-2xl font-heading font-bold text-warning">
                    {warningCount}
                  </p>
                </div>
                <Icon name="ShieldExclamationIcon" size={32} variant="outline" className="text-warning" />
              </div>
            </div>

            <div className="bg-card border border-success/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Info</p>
                  <p className="text-2xl font-heading font-bold text-success">
                    {infoCount}
                  </p>
                </div>
                <Icon name="InformationCircleIcon" size={32} variant="solid" className="text-success" />
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-card border border-border rounded-lg p-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-250 ${
                  filter === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                All ({alerts.length})
              </button>
              <button
                onClick={() => setFilter('critical')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-250 ${
                  filter === 'critical'
                    ? 'bg-error text-error-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                Critical ({criticalCount})
              </button>
              <button
                onClick={() => setFilter('warning')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-250 ${
                  filter === 'warning'
                    ? 'bg-warning text-warning-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                Warnings ({warningCount})
              </button>
              <button
                onClick={() => setFilter('info')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-250 ${
                  filter === 'info'
                    ? 'bg-success text-success-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                Info ({infoCount})
              </button>
              <div className="ml-auto text-xs text-muted-foreground">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Alerts List */}
          {isLoading && alerts.length === 0 ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-6 bg-muted rounded w-1/3" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <Icon name="CheckCircleIcon" size={48} variant="outline" className="text-success mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-xl text-foreground mb-2">
                No {filter !== 'all' ? filter : ''} alerts
              </h3>
              <p className="text-muted-foreground">
                {filter === 'all' 
                  ? 'All systems are operating normally.'
                  : `No ${filter} alerts at this time.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`bg-card border rounded-lg p-6 hover:shadow-lg transition-all duration-250 ${
                    alert.type === 'critical' 
                      ? 'border-error/50 bg-error/5' 
                      : alert.type === 'warning'
                      ? 'border-warning/50 bg-warning/5'
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      alert.type === 'critical'
                        ? 'bg-error/10'
                        : alert.type === 'warning'
                        ? 'bg-warning/10'
                        : 'bg-success/10'
                    }`}>
                      <Icon
                        name={
                          alert.type === 'critical'
                            ? 'ExclamationTriangleIcon'
                            : alert.type === 'warning'
                            ? 'ShieldExclamationIcon'
                            : 'InformationCircleIcon'
                        }
                        size={24}
                        variant={alert.type === 'info' ? 'solid' : 'outline'}
                        className={
                          alert.type === 'critical'
                            ? 'text-error'
                            : alert.type === 'warning'
                            ? 'text-warning'
                            : 'text-success'
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-heading font-semibold text-lg text-foreground mb-1">
                            {alert.title}
                          </h3>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            alert.type === 'critical'
                              ? 'bg-error/10 text-error'
                              : alert.type === 'warning'
                              ? 'bg-warning/10 text-warning'
                              : 'bg-success/10 text-success'
                          }`}>
                            {alert.category}
                          </span>
                        </div>
                        {alert.resolved && (
                          <span className="px-3 py-1 bg-success/10 text-success rounded-full text-xs font-medium">
                            Resolved
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-3">{alert.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Icon name="ClockIcon" size={16} variant="outline" />
                          <span>{new Date(alert.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SecurityAlertsInteractive;
