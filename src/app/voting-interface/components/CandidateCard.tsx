import React from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface Candidate {
  id: string;
  name: string;
  photo: string;
  photoAlt: string;
  position: string;
  department: string;
  manifesto: string;
  keyPoints: string[];
  isSelected: boolean;
}

interface CandidateCardProps {
  candidate: Candidate;
  onSelect: (candidateId: string) => void;
  isDisabled: boolean;
}

const CandidateCard = ({ candidate, onSelect, isDisabled }: CandidateCardProps) => {
  return (
    <div
      className={`bg-card border-2 rounded-lg overflow-hidden transition-all duration-250 ease-smooth ${
        candidate.isSelected
          ? 'border-primary shadow-lg scale-[1.02]'
          : 'border-border hover:border-primary/50 hover:shadow-md'
      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={() => {
        if (!isDisabled) {
          onSelect(candidate.id);
        }
      }}
    >
      <div className="relative h-64 overflow-hidden bg-muted">
        <AppImage
          src={candidate.photo}
          alt={candidate.photoAlt}
          className="w-full h-full object-cover"
        />
        {candidate.isSelected && (
          <div className="absolute top-4 right-4 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
            <Icon name="CheckIcon" size={24} variant="solid" className="text-primary-foreground" />
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="mb-4">
          <span className="inline-block px-2.5 py-0.5 mb-2 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            {candidate.position}
          </span>
          <h3 className="text-xl font-heading font-semibold text-foreground mb-1">
            {candidate.name}
          </h3>
          <p className="text-xs text-muted-foreground">{candidate.department}</p>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <Icon name="DocumentTextIcon" size={16} variant="outline" />
            Manifesto Summary
          </h4>
          <p className="text-sm text-muted-foreground line-clamp-3">{candidate.manifesto}</p>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <Icon name="StarIcon" size={16} variant="outline" />
            Key Platform Points
          </h4>
          <ul className="space-y-1">
            {candidate.keyPoints.slice(0, 3).map((point, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Icon
                  name="CheckCircleIcon"
                  size={16}
                  variant="solid"
                  className="text-success mt-0.5"
                />
                <span className="line-clamp-1">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!isDisabled) {
              onSelect(candidate.id);
            }
          }}
          className={`w-full py-3 rounded-md font-medium transition-all duration-250 ease-smooth ${
            candidate.isSelected
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground hover:bg-primary hover:text-primary-foreground'
          } ${isDisabled ? 'cursor-not-allowed' : ''}`}
        >
          {candidate.isSelected ? (
            <span className="flex items-center justify-center gap-2">
              <Icon name="CheckCircleIcon" size={20} variant="solid" />
              Selected
            </span>
          ) : (
            'Select Candidate'
          )}
        </button>
      </div>
    </div>
  );
};

export default CandidateCard;
