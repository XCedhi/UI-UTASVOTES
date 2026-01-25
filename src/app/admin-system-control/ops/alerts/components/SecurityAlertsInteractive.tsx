'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';

const SecurityAlertsInteractive = () => {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const alerts = [
    {
      id: '1',
      type: 'warning',
      title: 'Multiple Failed Login Attempts',
      description: '5 failed login attempts from IP 192.168.1.100',
      timestamp: '2026-01-25T10:30:00',
    },
    {
      id: '2',
      type: 'info',
      title: 'System Update Available',
      description: 'Security patch v2.1.3 is ready for installation',
      timestamp: '2026-01-25T09:15:00',
    },
  ];

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
              <p className="text-muted-foreground">Review security incidents and system logs</p>
            </div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-all duration-250"
            >
              <Icon name="ArrowLeftIcon" size={20} variant="outline" />
              Back
            </button>
          </div>

          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <Icon
                    name="ShieldExclamationIcon"
                    size={24}
                    variant="outline"
                    className={alert.type === 'warning' ? 'text-warning' : 'text-primary'}
                  />
                  <div className="flex-1">
                    <h3 className="font-heading font-semibold text-lg text-foreground mb-1">
                      {alert.title}
                    </h3>
                    <p className="text-muted-foreground mb-2">{alert.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SecurityAlertsInteractive;
