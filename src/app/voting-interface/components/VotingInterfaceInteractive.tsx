'use client';

import React, { useState, useEffect } from 'react';
import ElectionCard from './ElectionCard';
import CandidateCard from './CandidateCard';
import VotingInstructions from './VotingInstructions';
import BallotReview from './BallotReview';
import ConfirmationModal from './ConfirmationModal';
import SuccessModal from './SuccessModal';
import ProgressIndicator from './ProgressIndicator';
import Icon from '@/components/ui/AppIcon';
import { useElectionContext } from '@/contexts/ElectionContext';

interface LocalElection {
  id: string;
  name: string;
  category: 'departmental' | 'university-wide';
  positions: number;
  votingDeadline: string;
  description: string;
  isCompleted: boolean;
}

interface Position {
  id: string;
  name: string;
  electionId: string;
  isCompleted: boolean;
}

interface LocalCandidate {
  id: string;
  name: string;
  photo: string;
  photoAlt: string;
  position: string;
  positionId: string;
  department: string;
  manifesto: string;
  keyPoints: string[];
  isSelected: boolean;
}

const VotingInterfaceInteractive = () => {
  const {
    elections: globalElections,
    candidates: globalCandidates,
    castVote,
  } = useElectionContext();
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeView, setActiveView] = useState<'elections' | 'voting' | 'review'>('elections');
  const [selectedElection, setSelectedElection] = useState<LocalElection | null>(null);
  const [currentPositionId, setCurrentPositionId] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState('');

  // Local state to manage selections before submission
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Map global elections to local structure - ONLY ACTIVE ELECTIONS
  const elections: LocalElection[] = globalElections
    .filter((e) => e.status === 'active') // Only show active elections
    .map((e) => ({
      id: e.id,
      name: e.title,
      category: e.type,
      positions: 1, // Simplified for now
      votingDeadline: e.endDate,
      description: e.description,
      isCompleted: e.hasVoted,
    }));

  // Generate positions (simplified: 1 position per election based on election.position)
  const positions: Position[] = globalElections
    .filter((e) => e.status === 'active') // Only active elections
    .map((e) => ({
      id: `pos-${e.id}`,
      name: e.position,
      electionId: e.id,
    isCompleted:
      selectedCandidateIds.size > 0 &&
      Array.from(selectedCandidateIds).some(
        (id) => globalCandidates.find((c) => c.id === id)?.electionId === e.id
      ),
  }));

  // Map global candidates to local structure
  const candidates: LocalCandidate[] = globalCandidates
    .filter((c) => c.status === 'approved')
    .map((c) => ({
      id: c.id,
      name: c.name,
      photo: c.avatar || 'https://via.placeholder.com/150',
      photoAlt: c.name || 'Candidate photo',
      position: c.position,
      positionId: `pos-${c.electionId}`,
      department: c.department || 'N/A',
      manifesto: c.manifesto,
      keyPoints: [], // Context doesn't have keyPoints yet
      isSelected: selectedCandidateIds.has(c.id),
    }));

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12">
        <div className="mx-4 lg:mx-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-12 bg-muted rounded-lg w-1/3" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="h-64 bg-muted rounded-lg" />
                  <div className="h-64 bg-muted rounded-lg" />
                </div>
                <div className="h-96 bg-muted rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleStartVoting = (electionId: string) => {
    const election = elections.find((e) => e.id === electionId);
    if (election && !election.isCompleted) {
      setSelectedElection(election);
      const electionPositions = positions.filter((p) => p.electionId === electionId);
      if (electionPositions.length > 0) {
        setCurrentPositionId(electionPositions[0].id);
      }
      // Reset selections for this voting session if needed, but we keep them in state
      setActiveView('voting');
    }
  };

  const handleCandidateSelect = (candidateId: string) => {
    // Determine the position of this candidate
    const candidate = candidates.find((c) => c.id === candidateId);
    if (!candidate) return;

    // Deselect other candidates for the same position
    const otherCandidatesInPosition = candidates.filter(
      (c) => c.positionId === candidate.positionId && c.id !== candidateId
    );

    const newSelectedIds = new Set(selectedCandidateIds);
    otherCandidatesInPosition.forEach((c) => newSelectedIds.delete(c.id));

    if (newSelectedIds.has(candidateId)) {
      // Toggle off if already selected? Usually voting is radio button behavior
      // But let's assume clicking again keeps it selected or does nothing
      newSelectedIds.add(candidateId);
    } else {
      newSelectedIds.add(candidateId);
    }

    setSelectedCandidateIds(newSelectedIds);
  };

  const handlePositionClick = (positionId: string) => {
    setCurrentPositionId(positionId);
  };

  const handleReviewBallot = () => {
    setActiveView('review');
  };

  const handleEditSelection = (candidateId: string) => {
    const candidate = candidates.find((c) => c.id === candidateId);
    if (candidate) {
      setCurrentPositionId(candidate.positionId);
      setActiveView('voting');
    }
  };

  const handleSubmitBallot = () => {
    setShowConfirmation(true);
  };

  const handleConfirmSubmission = () => {
    const receipt = `UTAS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    setReceiptNumber(receipt);
    setShowConfirmation(false);
    setShowSuccess(true);

    if (selectedElection) {
      // Find selected candidates for this election
      const selectedForThisElection = candidates.filter(
        (c) => c.positionId === `pos-${selectedElection.id}` && selectedCandidateIds.has(c.id)
      );

      // Cast votes in global context
      selectedForThisElection.forEach((c) => {
        // Find original candidate to get electionId (though we know it matches selectedElection)
        const globalC = globalCandidates.find((gc) => gc.id === c.id);
        if (globalC) {
          castVote(globalC.electionId, globalC.id);
        }
      });
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    setActiveView('elections');
    setSelectedElection(null);
    setCurrentPositionId('');
    setSelectedCandidateIds(new Set());
  };

  const currentPositionCandidates = candidates.filter((c) => c.positionId === currentPositionId);

  const selectedCandidates = candidates
    .filter((c) => c.isSelected)
    .map((c) => ({
      id: c.id,
      name: c.name,
      photo: c.photo,
      photoAlt: c.photoAlt,
      position: c.position,
      positionId: c.positionId,
      department: c.department,
    }));

  // Filter selected candidates to only show those relevant to the currently selected election (for review)
  const selectedCandidatesForReview = selectedElection
    ? selectedCandidates.filter((c) => c.positionId === `pos-${selectedElection.id}`)
    : [];

  const electionPositions = selectedElection
    ? positions.filter((p) => p.electionId === selectedElection.id)
    : [];

  const allPositionsFilled = electionPositions.every((p) => {
    // Check if any candidate is selected for this position
    return candidates.some((c) => c.positionId === p.id && selectedCandidateIds.has(c.id));
  });

  return (
    <>
      {activeView === 'elections' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-semibold text-foreground mb-2">
                Active Elections
              </h1>
              <p className="text-muted-foreground">Select an election to cast your vote</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-md">
              <Icon name="CheckBadgeIcon" size={20} variant="outline" className="text-success" />
              <span className="text-sm font-caption text-muted-foreground">
                {elections.filter((e) => e.isCompleted).length} Completed
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {elections.map((election) => (
              <ElectionCard
                key={election.id}
                election={election}
                onStartVoting={handleStartVoting}
              />
            ))}
          </div>
        </div>
      )}

      {activeView === 'voting' && selectedElection && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveView('elections')}
              className="p-2 hover:bg-muted rounded-md transition-colors duration-250 ease-smooth"
            >
              <Icon name="ArrowLeftIcon" size={24} variant="outline" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-heading font-semibold text-foreground mb-2">
                {selectedElection.name}
              </h1>
              <p className="text-muted-foreground">
                Select your preferred candidate for each position
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <div className="flex items-center justify-between bg-card border border-border rounded-lg p-4">
                <div>
                  <h2 className="text-xl font-heading font-semibold text-foreground">
                    {positions.find((p) => p.id === currentPositionId)?.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Select one candidate for this position
                  </p>
                </div>
                {allPositionsFilled && (
                  <button
                    onClick={handleReviewBallot}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-all duration-250 ease-smooth hover:-translate-y-0.5"
                  >
                    Review Ballot
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {currentPositionCandidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    onSelect={handleCandidateSelect}
                    isDisabled={false}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <ProgressIndicator
                positions={electionPositions.map((p) => ({
                  ...p,
                  isCompleted: candidates.some(
                    (c) => c.positionId === p.id && selectedCandidateIds.has(c.id)
                  ),
                }))}
                currentPositionId={currentPositionId}
                onPositionClick={handlePositionClick}
              />
              <VotingInstructions
                electionName={selectedElection.name}
                deadline={selectedElection.votingDeadline}
              />
            </div>
          </div>
        </div>
      )}

      {activeView === 'review' && selectedElection && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveView('voting')}
              className="p-2 hover:bg-muted rounded-md transition-colors duration-250 ease-smooth"
            >
              <Icon name="ArrowLeftIcon" size={24} variant="outline" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-heading font-semibold text-foreground mb-2">
                Review Your Ballot
              </h1>
              <p className="text-muted-foreground">
                Verify your selections before final submission
              </p>
            </div>
          </div>

          <div className="max-w-3xl mx-auto">
            <BallotReview
              selections={selectedCandidatesForReview}
              totalPositions={electionPositions.length}
              onEdit={handleEditSelection}
              onSubmit={handleSubmitBallot}
              onCancel={() => setActiveView('voting')}
            />
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showConfirmation}
        onConfirm={handleConfirmSubmission}
        onCancel={() => setShowConfirmation(false)}
        candidateCount={selectedCandidatesForReview.length}
      />

      <SuccessModal
        isOpen={showSuccess}
        receiptNumber={receiptNumber}
        onClose={handleCloseSuccess}
      />
    </>
  );
};

export default VotingInterfaceInteractive;
