'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface CandidateApplication {
  id: string;
  candidateName: string;
  studentId: string;
  email: string;
  position: string;
  department: string;
  avatar: string;
  submittedAt: string;
  documents: {
    idCard: boolean;
    transcript: boolean;
    manifesto: boolean;
  };
  eligibilityStatus: 'pending' | 'verified' | 'rejected';
  paymentStatus: 'pending' | 'completed';
  applicationFee: number;
}

interface CandidateApplicationCardProps {
  application: CandidateApplication;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onViewDetails: (id: string) => void;
}

const CandidateApplicationCard = ({
  application,
  onApprove,
  onReject,
  onViewDetails,
}: CandidateApplicationCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-success text-success-foreground';
      case 'rejected':
        return 'bg-error text-error-foreground';
      default:
        return 'bg-warning text-warning-foreground';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    return status === 'completed'
      ? 'bg-success text-success-foreground'
      : 'bg-warning text-warning-foreground';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const allDocumentsSubmitted = Object.values(application.documents).every((doc) => doc);

  return (
    <div className="bg-card border border-border rounded-md p-6 hover:shadow-md transition-all duration-250 ease-smooth">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-muted">
          <AppImage
            src={application.avatar}
            alt={`Profile photo of ${application.candidateName}, candidate for ${application.position}`}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-semibold text-lg text-foreground truncate">
                {application.candidateName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {application.studentId} • {application.email}
              </p>
            </div>

            <div className="flex flex-col gap-2 items-end">
              <span
                className={`px-3 py-1 rounded-full text-xs font-caption ${getStatusColor(
                  application.eligibilityStatus
                )}`}
              >
                {application.eligibilityStatus.charAt(0).toUpperCase() +
                  application.eligibilityStatus.slice(1)}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-caption ${getPaymentStatusColor(
                  application.paymentStatus
                )}`}
              >
                Payment: {application.paymentStatus}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <div className="flex items-center gap-2">
              <Icon
                name="BriefcaseIcon"
                size={16}
                variant="outline"
                className="text-muted-foreground"
              />
              <span className="text-sm text-foreground font-medium">{application.position}</span>
            </div>

            <div className="flex items-center gap-2">
              <Icon
                name="BuildingLibraryIcon"
                size={16}
                variant="outline"
                className="text-muted-foreground"
              />
              <span className="text-sm text-foreground">{application.department}</span>
            </div>

            <div className="flex items-center gap-2">
              <Icon
                name="CurrencyDollarIcon"
                size={16}
                variant="outline"
                className="text-muted-foreground"
              />
              <span className="text-sm text-foreground font-data">
                GHS {application.applicationFee.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Icon
                name="ClockIcon"
                size={16}
                variant="outline"
                className="text-muted-foreground"
              />
              <span className="text-sm text-muted-foreground font-caption">
                {formatDate(application.submittedAt)}
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="text-xs font-caption text-muted-foreground mb-2">Document Verification</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Icon
                  name={application.documents.idCard ? 'CheckCircleIcon' : 'XCircleIcon'}
                  size={16}
                  variant="solid"
                  className={application.documents.idCard ? 'text-success' : 'text-error'}
                />
                <span className="text-xs text-foreground">ID Card</span>
              </div>

              <div className="flex items-center gap-2">
                <Icon
                  name={application.documents.transcript ? 'CheckCircleIcon' : 'XCircleIcon'}
                  size={16}
                  variant="solid"
                  className={application.documents.transcript ? 'text-success' : 'text-error'}
                />
                <span className="text-xs text-foreground">Transcript</span>
              </div>

              <div className="flex items-center gap-2">
                <Icon
                  name={application.documents.manifesto ? 'CheckCircleIcon' : 'XCircleIcon'}
                  size={16}
                  variant="solid"
                  className={application.documents.manifesto ? 'text-success' : 'text-error'}
                />
                <span className="text-xs text-foreground">Manifesto</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => onViewDetails(application.id)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-all duration-250 ease-smooth"
            >
              <Icon name="EyeIcon" size={16} variant="outline" />
              <span className="text-sm font-medium">View Details</span>
            </button>

            {application.eligibilityStatus === 'pending' && allDocumentsSubmitted && (
              <>
                <button
                  onClick={() => onApprove(application.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-success text-success-foreground rounded-md hover:bg-success/90 transition-all duration-250 ease-smooth"
                >
                  <Icon name="CheckIcon" size={16} variant="outline" />
                  <span className="text-sm font-medium">Approve</span>
                </button>

                <button
                  onClick={() => onReject(application.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-error text-error-foreground rounded-md hover:bg-error/90 transition-all duration-250 ease-smooth"
                >
                  <Icon name="XMarkIcon" size={16} variant="outline" />
                  <span className="text-sm font-medium">Reject</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateApplicationCard;
