'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';

const SystemStatusInteractive = () => {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const systemMetrics = [
    { label: 'CPU Usage', value: '45%', status: 'success', icon: 'CpuChipIcon' },
    { label: 'Memory', value: '62%', status: 'warning', icon: 'CircleStackIcon' },
    { label: 'Disk Space', value: '78%', status: 'warning', icon: 'ServerIcon' },
    { label: 'Network', value: 'Healthy', status: 'success', icon: 'SignalIcon' },
    { label: 'Database', value: 'Online', status: 'success', icon: 'CircleStackIcon' },
    { label: 'API Response', value: '120ms', status: 'success', icon: 'BoltIcon' },
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
                System Status
              </h1>
              <p className="text-muted-foreground">Monitor system health and performance</p>
            </div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-all duration-250"
            >
              <Icon name="ArrowLeftIcon" size={20} variant="outline" />
              Back
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systemMetrics.map((metric) => (
              <div key={metric.label} className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <Icon
                    name={metric.icon as any}
                    size={32}
                    variant="outline"
                    className={`text-${metric.status}`}
                  />
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      metric.status === 'success'
                        ? 'bg-success/10 text-success'
                        : 'bg-warning/10 text-warning'
                    }`}
                  >
                    {metric.status === 'success' ? 'Healthy' : 'Warning'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                <p className="text-2xl font-heading font-bold text-foreground">{metric.value}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SystemStatusInteractive;
