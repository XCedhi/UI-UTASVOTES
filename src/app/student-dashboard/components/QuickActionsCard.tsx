import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

interface QuickActionsCardProps {
  actions: QuickAction[];
}

const QuickActionsCard = ({ actions }: QuickActionsCardProps) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-lg text-foreground">Quick Actions</h3>
        <Icon name="BoltIcon" size={20} variant="outline" className="text-muted-foreground" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((action) => (
          <Link
            key={action.id}
            href={action.href}
            className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-all duration-250 ease-smooth hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center flex-shrink-0`}
              >
                <Icon
                  name={action.icon as any}
                  size={20}
                  variant="outline"
                  className="text-white"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground text-sm mb-1">{action.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsCard;
