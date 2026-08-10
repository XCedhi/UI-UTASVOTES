'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  candidateCount: number;
  isSubmitting?: boolean;
}

const ConfirmationModal = ({
  isOpen,
  onConfirm,
  onCancel,
  candidateCount,
  isSubmitting = false,
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-popover border border-border rounded-lg shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-250">
        <div className="bg-primary/5 border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
              <Icon
                name="ExclamationTriangleIcon"
                size={24}
                variant="solid"
                className="text-warning"
              />
            </div>
            <div>
              <h3 className="text-lg font-heading font-semibold text-popover-foreground">
                Confirm Ballot Submission
              </h3>
              <p className="text-sm text-muted-foreground">This action cannot be undone</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <Icon
                name="InformationCircleIcon"
                size={20}
                variant="solid"
                className="text-primary mt-0.5"
              />
              <div>
                <p className="text-sm text-popover-foreground">
                  You are about to submit your ballot with{' '}
                  <span className="font-medium">
                    {candidateCount} selection{candidateCount > 1 ? 's' : ''}
                  </span>
                  .
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Icon
                name="LockClosedIcon"
                size={20}
                variant="solid"
                className="text-success mt-0.5"
              />
              <div>
                <p className="text-sm text-popover-foreground">
                  Once submitted, your vote is final and cannot be changed. Your ballot will be
                  encrypted and anonymized.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Icon name="EnvelopeIcon" size={20} variant="solid" className="text-accent mt-0.5" />
              <div>
                <p className="text-sm text-popover-foreground">
                  You will receive a confirmation receipt at your registered email address
                  (@cktutas.edu.gh).
                </p>
              </div>
            </div>
          </div>

          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
            <p className="text-xs text-muted-foreground text-center">
              By submitting this ballot, you confirm that you have reviewed your selections and
              understand that this action is irreversible.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-muted text-foreground rounded-md font-medium hover:bg-muted/80 transition-all duration-250 ease-smooth disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Go Back
            </button>
            <button
              onClick={onConfirm}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-all duration-250 ease-smooth hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              <span className="flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <Icon name="ArrowPathIcon" size={20} variant="outline" className="animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Icon name="CheckCircleIcon" size={20} variant="solid" />
                    Confirm & Submit
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
