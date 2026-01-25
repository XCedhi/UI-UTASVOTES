'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import CandidateResultCard from './CandidateResultCard';

interface Candidate {
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

interface Position {
  id: string;
  title: string;
  category: string;
  totalVotes: number;
  candidates: Candidate[];
}

interface PositionResultsProps {
  positions: Position[];
}

const PositionResults = ({ positions }: PositionResultsProps) => {
  const [selectedPosition, setSelectedPosition] = useState<string>(positions[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  const currentPosition = positions.find((p) => p.id === selectedPosition);

  const filteredCandidates = currentPosition?.candidates.filter((candidate) =>
    candidate.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-card border border-border rounded-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="TrophyIcon" size={24} variant="outline" className="text-primary" />
        <h3 className="text-lg font-heading font-semibold text-foreground">Position Results</h3>
      </div>

      <div className="mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            className="flex-1 px-4 py-2 bg-muted border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {positions.map((position) => (
              <option key={position.id} value={position.id}>
                {position.title} - {position.category}
              </option>
            ))}
          </select>

          <div className="relative flex-1">
            <Icon
              name="MagnifyingGlassIcon"
              size={20}
              variant="outline"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {currentPosition && (
        <div className="mb-4 p-3 bg-muted rounded-md">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground font-caption">
              Total Votes for this Position
            </span>
            <span className="text-lg font-data font-semibold text-foreground">
              {currentPosition.totalVotes.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filteredCandidates && filteredCandidates.length > 0 ? (
          filteredCandidates.map((candidate, index) => (
            <CandidateResultCard key={index} {...candidate} />
          ))
        ) : (
          <div className="text-center py-8">
            <Icon
              name="UserGroupIcon"
              size={48}
              variant="outline"
              className="mx-auto text-muted-foreground mb-2"
            />
            <p className="text-sm text-muted-foreground">No candidates found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PositionResults;
