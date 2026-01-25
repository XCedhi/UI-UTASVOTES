import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface VotingInstructionsProps {
  electionName: string;
  deadline: string;
}

const VotingInstructions = ({ electionName, deadline }: VotingInstructionsProps) => {
  const instructions = [
    {
      icon: 'InformationCircleIcon',
      title: 'Review Candidates',
      description:
        "Read each candidate's manifesto and platform points carefully before making your selection.",
    },
    {
      icon: 'HandRaisedIcon',
      title: 'One Vote Per Position',
      description:
        'You can only select one candidate for each position. Your selection will be highlighted.',
    },
    {
      icon: 'ShieldCheckIcon',
      title: 'Secure & Anonymous',
      description:
        'Your vote is encrypted and anonymous. No one can trace your ballot back to you.',
    },
    {
      icon: 'ClockIcon',
      title: 'Review Before Submit',
      description:
        'You can change your selections until you submit. Once submitted, votes cannot be changed.',
    },
    {
      icon: 'CheckBadgeIcon',
      title: 'Confirmation Receipt',
      description:
        "After submission, you'll receive a confirmation receipt via email for your records.",
    },
  ];

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Icon
            name="QuestionMarkCircleIcon"
            size={24}
            variant="outline"
            className="text-primary"
          />
        </div>
        <div>
          <h3 className="text-lg font-heading font-semibold text-foreground">
            Voting Instructions
          </h3>
          <p className="text-sm text-muted-foreground">{electionName}</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {instructions.map((instruction, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon
                name={instruction.icon as any}
                size={18}
                variant="outline"
                className="text-primary"
              />
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">{instruction.title}</h4>
              <p className="text-xs text-muted-foreground">{instruction.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Icon
            name="ExclamationTriangleIcon"
            size={20}
            variant="solid"
            className="text-warning mt-0.5"
          />
          <div>
            <h4 className="text-sm font-medium text-foreground mb-1">Voting Deadline</h4>
            <p className="text-xs text-muted-foreground">
              Voting closes on{' '}
              <span className="font-medium text-foreground">{formatDeadline(deadline)}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Make sure to submit your ballot before the deadline. Late submissions will not be
              accepted.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Icon name="LifebuoyIcon" size={18} variant="outline" />
          Need Help?
        </h4>
        <div className="space-y-2">
          <button className="w-full flex items-center justify-between px-4 py-2 bg-muted rounded-md hover:bg-muted/80 transition-colors duration-250 ease-smooth">
            <span className="text-sm text-foreground">View Voting Guide</span>
            <Icon
              name="ArrowRightIcon"
              size={16}
              variant="outline"
              className="text-muted-foreground"
            />
          </button>
          <button className="w-full flex items-center justify-between px-4 py-2 bg-muted rounded-md hover:bg-muted/80 transition-colors duration-250 ease-smooth">
            <span className="text-sm text-foreground">Contact Support</span>
            <Icon
              name="ArrowRightIcon"
              size={16}
              variant="outline"
              className="text-muted-foreground"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VotingInstructions;
