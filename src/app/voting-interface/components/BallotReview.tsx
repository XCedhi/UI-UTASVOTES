import React from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface SelectedCandidate {
  id: string;
  name: string;
  photo: string;
  photoAlt: string;
  position: string;
  department: string;
}

interface BallotReviewProps {
  selections: SelectedCandidate[];
  totalPositions: number;
  onEdit: (positionId: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const BallotReview = ({
  selections,
  totalPositions,
  onEdit,
  onSubmit,
  onCancel,
}: BallotReviewProps) => {
  const isComplete = selections.length === totalPositions;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="bg-primary/5 border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-heading font-semibold text-foreground mb-1">
              Review Your Ballot
            </h3>
            <p className="text-sm text-muted-foreground">
              Verify your selections before final submission
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-heading font-bold text-primary">
              {selections.length}/{totalPositions}
            </p>
            <p className="text-xs text-muted-foreground">Positions Filled</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {!isComplete && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Icon
                name="ExclamationTriangleIcon"
                size={20}
                variant="solid"
                className="text-warning mt-0.5"
              />
              <div>
                <h4 className="text-sm font-medium text-foreground mb-1">Incomplete Ballot</h4>
                <p className="text-xs text-muted-foreground">
                  You have selected {selections.length} out of {totalPositions} positions. Please
                  complete all selections before submitting.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4 mb-6">
          {selections.map((candidate) => (
            <div
              key={candidate.id}
              className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border border-border"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
                <AppImage
                  src={candidate.photo}
                  alt={candidate.photoAlt}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-medium text-foreground mb-0.5">{candidate.name}</h4>
                <p className="text-sm text-primary font-medium">{candidate.position}</p>
                <p className="text-xs text-muted-foreground">{candidate.department}</p>
              </div>
              <button
                onClick={() => onEdit(candidate.id)}
                className="px-4 py-2 bg-card border border-border rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors duration-250 ease-smooth"
              >
                Change
              </button>
            </div>
          ))}
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Icon
              name="ShieldCheckIcon"
              size={20}
              variant="solid"
              className="text-primary mt-0.5"
            />
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">
                Secure & Anonymous Voting
              </h4>
              <p className="text-xs text-muted-foreground">
                Your ballot is encrypted end-to-end. Once submitted, your vote cannot be changed or
                traced back to you. You will receive a confirmation receipt via email.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-muted text-foreground rounded-md font-medium hover:bg-muted/80 transition-all duration-250 ease-smooth"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!isComplete}
            className={`flex-1 px-6 py-3 rounded-md font-medium transition-all duration-250 ease-smooth ${
              isComplete
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {isComplete ? (
              <span className="flex items-center justify-center gap-2">
                <Icon name="CheckCircleIcon" size={20} variant="solid" />
                Submit Ballot
              </span>
            ) : (
              'Complete All Selections'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BallotReview;
