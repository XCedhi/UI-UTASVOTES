import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface Position {
  id: string;
  name: string;
  isCompleted: boolean;
}

interface ProgressIndicatorProps {
  positions: Position[];
  currentPositionId: string;
  onPositionClick: (positionId: string) => void;
}

const ProgressIndicator = ({
  positions,
  currentPositionId,
  onPositionClick,
}: ProgressIndicatorProps) => {
  const completedCount = positions.filter((p) => p.isCompleted).length;
  const progressPercentage = (completedCount / positions.length) * 100;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-heading font-semibold text-foreground">Voting Progress</h3>
        <span className="text-sm font-caption text-muted-foreground">
          {completedCount}/{positions.length} Completed
        </span>
      </div>

      <div className="mb-6">
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-smooth"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          {progressPercentage === 100
            ? 'All positions filled!'
            : `${Math.round(progressPercentage)}% complete`}
        </p>
      </div>

      <div className="space-y-2">
        {positions.map((position, index) => (
          <button
            key={position.id}
            onClick={() => onPositionClick(position.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-250 ease-smooth ${
              position.id === currentPositionId
                ? 'bg-primary/10 border-2 border-primary'
                : position.isCompleted
                  ? 'bg-success/5 border border-success/20 hover:bg-success/10'
                  : 'bg-muted border border-border hover:bg-muted/80'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                position.isCompleted
                  ? 'bg-success text-success-foreground'
                  : position.id === currentPositionId
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted-foreground/20 text-muted-foreground'
              }`}
            >
              {position.isCompleted ? (
                <Icon name="CheckIcon" size={18} variant="solid" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            <div className="flex-1 text-left">
              <p
                className={`text-sm font-medium ${
                  position.id === currentPositionId ? 'text-primary' : 'text-foreground'
                }`}
              >
                {position.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {position.isCompleted ? 'Selection made' : 'Not selected'}
              </p>
            </div>
            {position.id === currentPositionId && (
              <Icon name="ChevronRightIcon" size={20} variant="outline" className="text-primary" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;
