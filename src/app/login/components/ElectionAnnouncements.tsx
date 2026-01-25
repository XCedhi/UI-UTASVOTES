import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface Announcement {
  id: string;
  type: 'election' | 'deadline' | 'result' | 'system';
  title: string;
  message: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
}

interface ElectionAnnouncementsProps {
  announcements?: Announcement[];
}

const ElectionAnnouncements = ({ announcements }: ElectionAnnouncementsProps) => {
  const mockAnnouncements: Announcement[] = announcements || [
    {
      id: '1',
      type: 'election',
      title: 'Student Council Elections 2026 Now Open',
      message:
        'Voting for the Student Council Elections 2026 is now live. Cast your vote before January 25, 2026 at 11:59 PM GMT.',
      date: '2026-01-20',
      priority: 'high',
    },
    {
      id: '2',
      type: 'deadline',
      title: 'Candidate Registration Deadline Extended',
      message:
        'The deadline for candidate registration has been extended to January 23, 2026. Submit your application now.',
      date: '2026-01-18',
      priority: 'medium',
    },
    {
      id: '3',
      type: 'result',
      title: 'Departmental Elections Results Available',
      message:
        'Results for Computer Science and Engineering departmental elections are now available in the results section.',
      date: '2026-01-15',
      priority: 'low',
    },
    {
      id: '4',
      type: 'system',
      title: 'System Maintenance Scheduled',
      message:
        'The electoral system will undergo maintenance on January 24, 2026 from 2:00 AM to 4:00 AM GMT. Voting will be temporarily unavailable.',
      date: '2026-01-22',
      priority: 'medium',
    },
  ];

  const getAnnouncementIcon = (type: Announcement['type']) => {
    switch (type) {
      case 'election':
        return 'CheckBadgeIcon';
      case 'deadline':
        return 'ClockIcon';
      case 'result':
        return 'ChartBarIcon';
      case 'system':
        return 'InformationCircleIcon';
      default:
        return 'BellIcon';
    }
  };

  const getAnnouncementColor = (type: Announcement['type']) => {
    switch (type) {
      case 'election':
        return 'text-primary';
      case 'deadline':
        return 'text-warning';
      case 'result':
        return 'text-success';
      case 'system':
        return 'text-accent';
      default:
        return 'text-muted-foreground';
    }
  };

  const getPriorityBadge = (priority: Announcement['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-error/10 text-error border-error/20';
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'low':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="w-full max-w-md mx-auto bg-card/80 backdrop-blur-md border border-border rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <Icon name="MegaphoneIcon" size={24} variant="outline" className="text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-heading font-semibold text-foreground">Election Updates</h3>
          <p className="text-sm text-muted-foreground">Latest announcements and news</p>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {mockAnnouncements.map((announcement) => (
          <div
            key={announcement.id}
            className="p-4 bg-background/50 border border-border rounded-md hover:bg-muted/30 transition-all duration-250 ease-smooth"
          >
            <div className="flex items-start gap-3">
              <div className={`mt-1 ${getAnnouncementColor(announcement.type)}`}>
                <Icon
                  name={getAnnouncementIcon(announcement.type) as any}
                  size={20}
                  variant="outline"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-sm font-medium text-foreground line-clamp-2">
                    {announcement.title}
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-caption border flex-shrink-0 ${getPriorityBadge(
                      announcement.priority
                    )}`}
                  >
                    {announcement.priority}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
                  {announcement.message}
                </p>

                <div className="flex items-center gap-2">
                  <Icon
                    name="CalendarIcon"
                    size={14}
                    variant="outline"
                    className="text-muted-foreground"
                  />
                  <span className="text-xs text-muted-foreground font-caption">
                    {formatDate(announcement.date)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-all duration-250 ease-smooth">
          <Icon name="NewspaperIcon" size={20} variant="outline" />
          <span className="text-sm font-medium">View All Announcements</span>
        </button>
      </div>
    </div>
  );
};

export default ElectionAnnouncements;
