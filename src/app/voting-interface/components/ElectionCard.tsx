import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface Election {
  id: string;
  name: string;
  category: 'departmental' | 'university-wide';
  positions: number;
  votingDeadline: string;
  description: string;
  isCompleted: boolean;
}

interface ElectionCardProps {
  election: Election;
  onStartVoting: (electionId: string) => void;
}

const ElectionCard = ({ election, onStartVoting }: ElectionCardProps) => {
  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeRemaining = (deadline: string) => {
    const end = new Date(deadline);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Voting Closed';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`;
    return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
  };

  const getCategoryColor = () => {
    return election.category === 'university-wide'
      ? 'bg-primary text-primary-foreground'
      : 'bg-accent text-accent-foreground';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-250 ease-smooth">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-caption ${getCategoryColor()}`}>
              {election.category === 'university-wide' ? 'University-Wide' : 'Departmental'}
            </span>
            {election.isCompleted && (
              <span className="px-3 py-1 rounded-full text-xs font-caption bg-success text-success-foreground">
                Completed
              </span>
            )}
          </div>
          <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
            {election.name}
          </h3>
          <p className="text-sm text-muted-foreground">{election.description}</p>
        </div>
        <Icon
          name={election.category === 'university-wide' ? 'AcademicCapIcon' : 'BuildingLibraryIcon'}
          size={32}
          variant="outline"
          className="text-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Icon
            name="UserGroupIcon"
            size={20}
            variant="outline"
            className="text-muted-foreground"
          />
          <div>
            <p className="text-xs text-muted-foreground">Positions</p>
            <p className="text-sm font-medium text-foreground">{election.positions}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="ClockIcon" size={20} variant="outline" className="text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Deadline</p>
            <p className="text-sm font-medium text-foreground">
              {formatDeadline(election.votingDeadline)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              election.isCompleted ? 'bg-success' : 'bg-warning animate-pulse'
            }`}
          />
          <span className="text-sm font-caption text-muted-foreground">
            {election.isCompleted ? 'Vote Submitted' : getTimeRemaining(election.votingDeadline)}
          </span>
        </div>
        <button
          onClick={() => onStartVoting(election.id)}
          className={`px-6 py-2 rounded-md font-medium transition-all duration-250 ease-smooth ${
            election.isCompleted
              ? 'bg-muted text-muted-foreground'
              : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5'
          }`}
        >
          {election.isCompleted ? 'Completed' : 'Start Voting'}
        </button>
      </div>
    </div>
  );
};

export default ElectionCard;
