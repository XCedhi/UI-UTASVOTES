'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface SuccessModalProps {
  isOpen: boolean;
  receiptNumber: string;
  onClose: () => void;
}

const SuccessModal = ({ isOpen, receiptNumber, onClose }: SuccessModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-popover border border-border rounded-lg shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-250">
        <div className="bg-success/5 border-b border-border px-6 py-8 text-center">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="CheckCircleIcon" size={48} variant="solid" className="text-success" />
          </div>
          <h3 className="text-2xl font-heading font-semibold text-popover-foreground mb-2">
            Vote Submitted Successfully!
          </h3>
          <p className="text-sm text-muted-foreground">Your ballot has been securely recorded</p>
        </div>

        <div className="p-6">
          <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Receipt Number</span>
              <button className="text-xs text-primary hover:text-primary/80 transition-colors duration-250 ease-smooth">
                Copy
              </button>
            </div>
            <p className="text-lg font-data font-medium text-foreground">{receiptNumber}</p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <Icon name="EnvelopeIcon" size={20} variant="solid" className="text-primary mt-0.5" />
              <div>
                <p className="text-sm text-popover-foreground">
                  A confirmation email has been sent to your registered email address with your
                  receipt details.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Icon
                name="ShieldCheckIcon"
                size={20}
                variant="solid"
                className="text-success mt-0.5"
              />
              <div>
                <p className="text-sm text-popover-foreground">
                  Your vote is encrypted and anonymous. No one can trace your ballot back to you.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Icon name="ChartBarIcon" size={20} variant="solid" className="text-accent mt-0.5" />
              <div>
                <p className="text-sm text-popover-foreground">
                  Results will be available after the voting period ends. You&apos;ll be notified
                  via email.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/election-results"
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium text-center hover:bg-primary/90 transition-all duration-250 ease-smooth hover:-translate-y-0.5"
            >
              View Election Results
            </Link>
            <Link
              href="/student-dashboard"
              className="w-full px-6 py-3 bg-muted text-foreground rounded-md font-medium text-center hover:bg-muted/80 transition-all duration-250 ease-smooth"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
