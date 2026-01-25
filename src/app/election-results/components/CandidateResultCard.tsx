'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface CandidateResultCardProps {
  rank: number;
  name: string;
  position: string;
  department: string;
  votes: number;
  percentage: number;
  image: string;
  alt: string;
  isWinner: boolean;
}

const CandidateResultCard = ({
  rank,
  name,
  position,
  department,
  votes,
  percentage,
  image,
  alt,
  isWinner,
}: CandidateResultCardProps) => {
  const getRankColor = () => {
    if (rank === 1) return 'bg-warning text-warning-foreground';
    if (rank === 2) return 'bg-muted-foreground text-white';
    if (rank === 3) return 'bg-accent text-accent-foreground';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div
      className={`bg-card border rounded-md p-4 transition-all duration-250 ease-smooth hover:shadow-md ${
        isWinner ? 'border-success shadow-sm' : 'border-border'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-muted">
            <AppImage
              src={image}
              alt={alt}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </div>
          <div
            className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getRankColor()}`}
          >
            {rank}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-heading font-semibold text-foreground truncate">
                {name}
              </h3>
              <p className="text-sm text-muted-foreground">{position}</p>
              <p className="text-xs text-muted-foreground font-caption mt-0.5">{department}</p>
            </div>
            {isWinner && (
              <div className="flex items-center gap-1 px-2 py-1 bg-success/10 rounded-md">
                <Icon name="TrophyIcon" size={16} variant="solid" className="text-success" />
                <span className="text-xs font-caption text-success font-medium">Winner</span>
              </div>
            )}
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground font-caption">Votes Received</span>
              <span className="text-sm font-data font-medium text-foreground">
                {votes.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ease-smooth ${
                  isWinner ? 'bg-success' : 'bg-primary'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground font-caption">Vote Share</span>
              <span className="text-sm font-data font-semibold text-foreground">
                {percentage.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateResultCard;
