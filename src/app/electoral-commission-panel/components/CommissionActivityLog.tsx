import React from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface ActivityLog {
  id: string;
  commissionMember: string;
  memberAvatar: string;
  action: string;
  target: string;
  timestamp: string;
  actionType: 'approval' | 'rejection' | 'update' | 'creation' | 'deletion';
}

interface CommissionActivityLogProps {
  activities: ActivityLog[];
}

const CommissionActivityLog = ({ activities }: CommissionActivityLogProps) => {
  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'approval':
        return 'CheckCircleIcon';
      case 'rejection':
        return 'XCircleIcon';
      case 'update':
        return 'PencilSquareIcon';
      case 'creation':
        return 'PlusCircleIcon';
      case 'deletion':
        return 'TrashIcon';
      default:
        return 'InformationCircleIcon';
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'approval':
        return 'text-success';
      case 'rejection':
        return 'text-error';
      case 'update':
        return 'text-primary';
      case 'creation':
        return 'text-accent';
      case 'deletion':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-card border border-border rounded-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-heading font-semibold text-lg text-foreground">
            Commission Activity Log
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Recent actions by commission members</p>
        </div>
        <Icon
          name="ClipboardDocumentListIcon"
          size={24}
          variant="outline"
          className="text-primary"
        />
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 bg-muted rounded-md hover:bg-muted/80 transition-all duration-250 ease-smooth"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-background">
              <AppImage
                src={activity.memberAvatar}
                alt={`Profile photo of ${activity.commissionMember}, commission member`}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2">
                <Icon
                  name={getActionIcon(activity.actionType) as any}
                  size={16}
                  variant="solid"
                  className={`mt-0.5 flex-shrink-0 ${getActionColor(activity.actionType)}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{activity.commissionMember}</span>{' '}
                    <span className="text-muted-foreground">{activity.action}</span>{' '}
                    <span className="font-medium">{activity.target}</span>
                  </p>
                  <p className="text-xs text-muted-foreground font-caption mt-1">
                    {formatTimestamp(activity.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommissionActivityLog;
