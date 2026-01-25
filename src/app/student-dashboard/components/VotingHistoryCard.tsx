import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface VotingHistoryItem {
  id: string;
  electionName: string;
  votedDate: string;
  position: string;
  status: 'completed' | 'pending-results';
}

interface VotingHistoryCardProps {
  history: VotingHistoryItem[];
}

const VotingHistoryCard = ({ history }: VotingHistoryCardProps) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-lg text-foreground">Voting History</h3>
        <Icon name="ClockIcon" size={20} variant="outline" className="text-muted-foreground" />
      </div>

      {history.length > 0 ? (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-all duration-250 ease-smooth"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-medium text-foreground text-sm">{item.electionName}</h4>
                <Icon
                  name="CheckCircleIcon"
                  size={16}
                  variant="solid"
                  className="text-success flex-shrink-0"
                />
              </div>
              <p className="text-xs text-muted-foreground mb-1">{item.position}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground font-caption">{item.votedDate}</p>
                {item.status === 'completed' && (
                  <Link
                    href={`/election-results?election=${item.id}`}
                    className="text-xs text-primary hover:text-primary/80 transition-colors duration-250 ease-smooth"
                  >
                    View Results
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <Icon
            name="InboxIcon"
            size={48}
            variant="outline"
            className="mx-auto text-muted-foreground mb-3"
          />
          <p className="text-sm text-muted-foreground">No voting history yet</p>
          <p className="text-xs text-muted-foreground mt-1">Your votes will appear here</p>
        </div>
      )}
    </div>
  );
};

export default VotingHistoryCard;
