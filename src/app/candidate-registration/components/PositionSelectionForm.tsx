'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Position {
  id: string;
  title: string;
  description: string;
  fee: number;
  requirements: string[];
  electionId: string;
  electionName: string;
}

interface Election {
  id: string;
  name: string;
  election_type: 'departmental' | 'university-wide';
  department: string | null;
  status: string;
  voting_start: string;
  voting_end: string;
  positions: Position[];
}

interface PositionSelectionFormProps {
  selectedPosition: string;
  positions: Position[];
  elections: Election[];
  studentDepartment: string;
  errors: Record<string, string>;
  onChange: (positionId: string, electionId: string) => void;
  preselectedElectionId?: string;
}

const PositionSelectionForm = ({
  selectedPosition,
  positions,
  elections,
  studentDepartment,
  errors,
  onChange,
  preselectedElectionId,
}: PositionSelectionFormProps) => {
  const [selectedElection, setSelectedElection] = useState<string>('');
  const [availablePositions, setAvailablePositions] = useState<Position[]>([]);

  // Filter elections based on student's department
  const eligibleElections = elections.filter((election) => {
    if (election.election_type === 'university-wide') {
      return true; // All students can see university-wide elections
    }
    if (election.election_type === 'departmental') {
      // Only show if the student is in that department (case-insensitive)
      if (!election.department || !studentDepartment) return false;
      return (
        election.department.trim().toLowerCase() ===
        studentDepartment.trim().toLowerCase()
      );
    }
    return false;
  });

  // Auto-select the election when deep-linked from a notification
  useEffect(() => {
    if (
      preselectedElectionId &&
      preselectedElectionId !== selectedElection &&
      eligibleElections.some((e) => e.id === preselectedElectionId)
    ) {
      setSelectedElection(preselectedElectionId);
      onChange('', preselectedElectionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedElectionId]);

  // Update available positions when election is selected
  useEffect(() => {
    if (selectedElection) {
      const election = elections.find((e) => e.id === selectedElection);
      if (election) {
        setAvailablePositions(election.positions || []);
      }
    } else {
      setAvailablePositions([]);
    }
  }, [selectedElection, elections]);

  const handleElectionSelect = (electionId: string) => {
    setSelectedElection(electionId);
    // Reset position selection when election changes
    onChange('', electionId);
  };

  const handlePositionSelect = (positionId: string) => {
    onChange(positionId, selectedElection);
  };

  const getElectionTypeLabel = (type: string) => {
    return type === 'university-wide' ? 'University-Wide' : 'Departmental';
  };

  const getElectionStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/20 text-success';
      case 'upcoming':
        return 'bg-warning/20 text-warning';
      case 'completed':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-8">
      {/* Step 1: Select Election */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-4">
          Step 1: Select Election <span className="text-error">*</span>
        </label>
        <p className="text-sm text-muted-foreground mb-4">
          Choose the election you want to participate in
        </p>
        
        {eligibleElections.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-md border border-border">
            <Icon
              name="ExclamationTriangleIcon"
              size={48}
              variant="outline"
              className="mx-auto text-warning mb-4"
            />
            <p className="text-foreground font-medium mb-2">No Active Elections</p>
            <p className="text-sm text-muted-foreground">
              There are currently no elections available for your department.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {eligibleElections.map((election) => (
              <button
                key={election.id}
                type="button"
                onClick={() => handleElectionSelect(election.id)}
                className={`text-left p-6 rounded-md border-2 transition-all duration-250 ease-smooth ${
                  selectedElection === election.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-250 ease-smooth ${
                          selectedElection === election.id
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground'
                        }`}
                      >
                        {selectedElection === election.id && (
                          <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                        )}
                      </div>
                      <h3 className="font-heading font-semibold text-lg text-foreground">
                        {election.name}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getElectionStatusColor(election.status)}`}>
                        {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
                      </span>
                      <span className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium">
                        {getElectionTypeLabel(election.election_type)}
                      </span>
                      {election.election_type === 'departmental' && election.department && (
                        <span className="px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium">
                          {election.department}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Icon name="CalendarIcon" size={16} variant="outline" />
                        <span>
                          {new Date(election.voting_start).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <span>→</span>
                      <div className="flex items-center gap-2">
                        <Icon name="CalendarIcon" size={16} variant="outline" />
                        <span>
                          {new Date(election.voting_end).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="px-3 py-2 bg-accent/10 rounded-md">
                      <p className="text-xs text-muted-foreground font-caption">Positions</p>
                      <p className="text-2xl font-heading font-semibold text-accent">
                        {election.positions?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
        {errors.election && <p className="text-sm text-error mt-2">{errors.election}</p>}
      </div>

      {/* Step 2: Select Position (only show if election is selected) */}
      {selectedElection && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-4">
            Step 2: Select Position <span className="text-error">*</span>
          </label>
          <p className="text-sm text-muted-foreground mb-4">
            Choose the position you want to apply for in this election
          </p>

          {availablePositions.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-md border border-border">
              <Icon
                name="BriefcaseIcon"
                size={48}
                variant="outline"
                className="mx-auto text-muted-foreground mb-4 opacity-50"
              />
              <p className="text-foreground font-medium mb-2">No Positions Available</p>
              <p className="text-sm text-muted-foreground">
                There are no positions created for this election yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {availablePositions.map((position) => (
                <button
                  key={position.id}
                  type="button"
                  onClick={() => handlePositionSelect(position.id)}
                  className={`text-left p-6 rounded-md border-2 transition-all duration-250 ease-smooth ${
                    selectedPosition === position.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-250 ease-smooth ${
                            selectedPosition === position.id
                              ? 'border-primary bg-primary'
                              : 'border-muted-foreground'
                          }`}
                        >
                          {selectedPosition === position.id && (
                            <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                          )}
                        </div>
                        <h3 className="font-heading font-semibold text-lg text-foreground">
                          {position.title}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{position.description}</p>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">Key Requirements:</p>
                        <ul className="space-y-1">
                          {position.requirements.map((req, index) => (
                            <li
                              key={index}
                              className="text-sm text-muted-foreground flex items-start gap-2"
                            >
                              <Icon
                                name="CheckCircleIcon"
                                size={16}
                                variant="solid"
                                className="text-success mt-0.5 flex-shrink-0"
                              />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="px-4 py-2 bg-accent/10 rounded-md">
                        <p className="text-xs text-muted-foreground font-caption">Application Fee</p>
                        <p className="text-xl font-heading font-semibold text-accent">
                          GHS {position.fee}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          {errors.position && <p className="text-sm text-error mt-2">{errors.position}</p>}
        </div>
      )}

      {selectedPosition && selectedElection && (
        <div className="bg-primary/5 border border-primary/20 rounded-md p-4">
          <div className="flex items-start gap-3">
            <Icon
              name="InformationCircleIcon"
              size={20}
              variant="solid"
              className="text-primary flex-shrink-0 mt-0.5"
            />
            <div>
              <p className="text-sm text-foreground font-medium mb-1">Selection Complete</p>
              <p className="text-sm text-muted-foreground">
                You are applying for{' '}
                <span className="font-medium text-primary">
                  {availablePositions.find((p) => p.id === selectedPosition)?.title}
                </span>
                {' '}in{' '}
                <span className="font-medium text-primary">
                  {eligibleElections.find((e) => e.id === selectedElection)?.name}
                </span>
                . Please ensure you meet all requirements before proceeding.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionSelectionForm;
