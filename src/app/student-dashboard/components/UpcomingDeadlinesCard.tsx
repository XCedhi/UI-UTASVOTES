import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface Deadline {
  id: string;
  title: string;
  date: string;
  type: 'voting' | 'registration' | 'result';
  daysRemaining: number;
}

interface UpcomingDeadlinesCardProps {
  deadlines: Deadline[];
}

const UpcomingDeadlinesCard = ({ deadlines }: UpcomingDeadlinesCardProps) => {
  const getDeadlineIcon = (type: Deadline['type']) => {
    switch (type) {
      case 'voting':
        return 'CheckBadgeIcon';
      case 'registration':
        return 'DocumentTextIcon';
      case 'result':
        return 'ChartBarIcon';
      default:
        return 'CalendarIcon';
    }
  };

  const getDeadlineColor = (daysRemaining: number) => {
    if (daysRemaining <= 1) return 'text-error';
    if (daysRemaining <= 3) return 'text-warning';
    return 'text-success';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-lg text-foreground">Upcoming Deadlines</h3>
        <Icon name="BellAlertIcon" size={20} variant="outline" className="text-muted-foreground" />
      </div>

      {deadlines.length > 0 ? (
        <div className="space-y-3">
          {deadlines.map((deadline) => (
            <div
              key={deadline.id}
              className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-all duration-250 ease-smooth"
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${getDeadlineColor(deadline.daysRemaining)}`}>
                  <Icon name={getDeadlineIcon(deadline.type) as any} size={20} variant="outline" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground text-sm mb-1">{deadline.title}</h4>
                  <div className="flex items-center gap-2">
                    <Icon
                      name="CalendarIcon"
                      size={14}
                      variant="outline"
                      className="text-muted-foreground"
                    />
                    <p className="text-xs text-muted-foreground font-caption">{deadline.date}</p>
                  </div>
                  <p
                    className={`text-xs font-caption mt-1 ${getDeadlineColor(deadline.daysRemaining)}`}
                  >
                    {deadline.daysRemaining === 0
                      ? 'Today'
                      : deadline.daysRemaining === 1
                        ? '1 day remaining'
                        : `${deadline.daysRemaining} days remaining`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <Icon
            name="CalendarDaysIcon"
            size={48}
            variant="outline"
            className="mx-auto text-muted-foreground mb-3"
          />
          <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
          <p className="text-xs text-muted-foreground mt-1">Check back later for updates</p>
        </div>
      )}
    </div>
  );
};

export default UpcomingDeadlinesCard;
