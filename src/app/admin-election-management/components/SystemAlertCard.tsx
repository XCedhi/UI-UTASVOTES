import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface SystemAlert {
  id: string;
  type: 'security' | 'system' | 'fraud' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  isResolved: boolean;
}

interface SystemAlertCardProps {
  alert: SystemAlert;
}

const SystemAlertCard = ({ alert }: SystemAlertCardProps) => {
  const getAlertColor = (type: string, severity: string) => {
    if (severity === 'critical') return 'border-error bg-error/10';
    if (severity === 'high') return 'border-warning bg-warning/10';

    switch (type) {
      case 'security':
      case 'fraud':
        return 'border-error bg-error/10';
      case 'warning':
        return 'border-warning bg-warning/10';
      case 'system':
        return 'border-primary bg-primary/10';
      default:
        return 'border-muted bg-muted/50';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'security':
        return 'ShieldExclamationIcon';
      case 'fraud':
        return 'ExclamationTriangleIcon';
      case 'warning':
        return 'ExclamationCircleIcon';
      case 'system':
        return 'ComputerDesktopIcon';
      default:
        return 'InformationCircleIcon';
    }
  };

  const getAlertIconColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-error';
      case 'high':
        return 'text-warning';
      case 'medium':
        return 'text-accent';
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

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`border-l-4 rounded-md p-4 ${getAlertColor(alert.type, alert.severity)}`}>
      <div className="flex items-start gap-3">
        <Icon
          name={getAlertIcon(alert.type) as any}
          size={20}
          variant="solid"
          className={getAlertIconColor(alert.severity)}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-medium text-foreground">{alert.title}</h4>
            {alert.isResolved && (
              <span className="px-2 py-0.5 bg-success text-success-foreground text-xs font-caption rounded-full flex-shrink-0">
                Resolved
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground font-caption">
            <span className="capitalize">{alert.severity} Priority</span>
            <span>•</span>
            <span>{formatTimestamp(alert.timestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemAlertCard;
