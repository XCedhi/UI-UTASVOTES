'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface TimelineEvent {
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface ElectionTimelineProps {
  events: TimelineEvent[];
}

const ElectionTimeline = ({ events }: ElectionTimelineProps) => {
  const getStatusColor = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-success';
      case 'current':
        return 'bg-warning';
      case 'upcoming':
        return 'bg-muted-foreground';
      default:
        return 'bg-muted-foreground';
    }
  };

  return (
    <div className="bg-card border border-border rounded-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="ClockIcon" size={24} variant="outline" className="text-primary" />
        <h3 className="text-lg font-heading font-semibold text-foreground">Election Timeline</h3>
      </div>

      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(
                  event.status
                )} text-white flex-shrink-0`}
              >
                <Icon name={event.icon as any} size={20} variant="solid" />
              </div>
              {index < events.length - 1 && <div className="w-0.5 h-full bg-border mt-2" />}
            </div>

            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-medium text-foreground">{event.title}</h4>
                <span className="text-xs text-muted-foreground font-caption whitespace-nowrap">
                  {event.timestamp}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ElectionTimeline;
