'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';

interface Application {
  id: string;
  candidateName: string;
  studentId: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  level: string;
  program: string;
  avatar: string;
  submittedAt: string;
  manifesto: string;
  documents: {
    idCard: { uploaded: boolean; url?: string; verified: boolean };
    transcript: { uploaded: boolean; url?: string; verified: boolean };
    manifesto: { uploaded: boolean; url?: string; verified: boolean };
  };
  eligibilityStatus: 'pending' | 'verified' | 'rejected';
  paymentStatus: 'pending' | 'completed';
  applicationFee: number;
  verificationNotes: string;
}

const ApplicationDetailsInteractive = () => {
  const router = useRouter();
  const params = useParams();
  const [isHydrated, setIsHydrated] = useState(false);
  const [application, setApplication] = useState<Application | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{ name: string; url: string } | null>(null);

  useEffect(() => {
    setIsHydrated(true);
    // Mock data - replace with actual API call
    setApplication({
      id: params.id as string,
      candidateName: 'Kwame Mensah',
      studentId: 'UTAS2024001',
      email: 'kwame.mensah@cktutas.edu.gh',
      phone: '+233 24 123 4567',
      position: 'SRC President',
      department: 'Computer Science',
      level: '300',
      program: 'BSc Computer Science',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      submittedAt: '2026-01-20T10:30:00',
      manifesto: 'I pledge to represent the student body with integrity and dedication. My vision includes improving campus facilities, enhancing student welfare programs, and fostering better communication between students and administration.',
      documents: {
        idCard: { 
          uploaded: true, 
          url: 'https://images.unsplash.com/photo-1633409361618-c73427e4e206?w=800&h=600&fit=crop', 
          verified: true 
        },
        transcript: { 
          uploaded: true, 
          url: 'https://images.unsplash.com/photo-1554224311-beee460c201f?w=800&h=600&fit=crop', 
          verified: true 
        },
        manifesto: { 
          uploaded: true, 
          url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=600&fit=crop', 
          verified: false 
        },
      },
      eligibilityStatus: 'pending',
      paymentStatus: 'completed',
      applicationFee: 50.00,
      verificationNotes: '',
    });
  }, [params.id]);

  const handleApprove = async () => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setApplication((prev) => prev ? { ...prev, eligibilityStatus: 'verified' } : null);
      setShowApproveModal(false);
      setIsProcessing(false);
    }, 1500);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setApplication((prev) => prev ? { ...prev, eligibilityStatus: 'rejected', verificationNotes: rejectionReason } : null);
      setShowRejectModal(false);
      setIsProcessing(false);
      setRejectionReason('');
    }, 1500);
  };

  const handleViewDocument = (docName: string, docUrl: string) => {
    setSelectedDocument({ 
      name: docName.replace(/([A-Z])/g, ' $1').trim(), 
      url: docUrl 
    });
    setShowDocumentModal(true);
  };

  if (!isHydrated || !application) {
    return (
      <div className="min-h-screen bg-background">
        <Header userRole="commission" userName="Loading..." notificationCount={0} />
        <main className="pt-24 pb-12 px-4 lg:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="h-96 bg-muted animate-pulse rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-success/10 text-success';
      case 'rejected':
        return 'bg-error/10 text-error';
      default:
        return 'bg-warning/10 text-warning';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        userRole="commission"
        userName="Electoral Commissioner"
        userAvatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
        notificationCount={3}
      />

      <main className="pt-24 pb-12 px-4 lg:px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
                Application Details
              </h1>
              <p className="text-muted-foreground">Review and verify candidate application</p>
            </div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-all duration-250"
            >
              <Icon name="ArrowLeftIcon" size={20} variant="outline" />
              Back
            </button>
          </div>

          {/* Status Banner */}
          <div className={`p-4 rounded-lg border ${
            application.eligibilityStatus === 'verified' 
              ? 'bg-success/10 border-success/20' 
              : application.eligibilityStatus === 'rejected'
                ? 'bg-error/10 border-error/20'
                : 'bg-warning/10 border-warning/20'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon 
                  name={
                    application.eligibilityStatus === 'verified' 
                      ? 'CheckCircleIcon' 
                      : application.eligibilityStatus === 'rejected'
                        ? 'XCircleIcon'
                        : 'ClockIcon'
                  } 
                  size={24} 
                  variant="solid" 
                  className={
                    application.eligibilityStatus === 'verified' 
                      ? 'text-success' 
                      : application.eligibilityStatus === 'rejected'
                        ? 'text-error'
                        : 'text-warning'
                  }
                />
                <div>
                  <p className="font-medium text-foreground">
                    Application Status: <span className="capitalize">{application.eligibilityStatus}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Submitted on {new Date(application.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {application.eligibilityStatus === 'pending' && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-error text-error-foreground rounded-md hover:bg-error/90 transition-all duration-250"
                  >
                    <Icon name="XMarkIcon" size={20} variant="outline" />
                    Reject
                  </button>
                  <button
                    onClick={() => setShowApproveModal(true)}
                    className="flex items-center gap-2 px-6 py-2 bg-success text-success-foreground rounded-md hover:bg-success/90 transition-all duration-250 shadow-md"
                  >
                    <Icon name="CheckIcon" size={20} variant="outline" />
                    Approve
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Candidate Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Candidate Card */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex flex-col items-center text-center">
                  <img
                    src={application.avatar}
                    alt={application.candidateName}
                    className="w-32 h-32 rounded-full object-cover mb-4"
                  />
                  <h2 className="font-heading font-bold text-xl text-foreground mb-1">
                    {application.candidateName}
                  </h2>
                  <p className="text-muted-foreground mb-2">{application.studentId}</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(application.eligibilityStatus)}`}>
                    {application.eligibilityStatus}
                  </span>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="EnvelopeIcon" size={16} variant="outline" className="text-muted-foreground" />
                    <span className="text-foreground font-data">{application.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="PhoneIcon" size={16} variant="outline" className="text-muted-foreground" />
                    <span className="text-foreground">{application.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="AcademicCapIcon" size={16} variant="outline" className="text-muted-foreground" />
                    <span className="text-foreground">{application.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="BookOpenIcon" size={16} variant="outline" className="text-muted-foreground" />
                    <span className="text-foreground">Level {application.level}</span>
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                  Payment Status
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Application Fee</span>
                    <span className="font-medium text-foreground">GH₵ {application.applicationFee.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      application.paymentStatus === 'completed' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-warning/10 text-warning'
                    }`}>
                      {application.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Position Applied */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                  Position Applied For
                </h3>
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-md">
                  <p className="font-medium text-xl text-primary">{application.position}</p>
                  <p className="text-sm text-muted-foreground mt-1">{application.department}</p>
                </div>
              </div>

              {/* Documents */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                  Submitted Documents
                </h3>
                <div className="space-y-3">
                  {Object.entries(application.documents).map(([key, doc]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-muted/30 rounded-md">
                      <div className="flex items-center gap-3">
                        <Icon 
                          name={doc.uploaded ? 'DocumentCheckIcon' : 'DocumentIcon'} 
                          size={24} 
                          variant="outline" 
                          className={doc.uploaded ? 'text-success' : 'text-muted-foreground'}
                        />
                        <div>
                          <p className="font-medium text-foreground capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {doc.verified ? 'Verified' : doc.uploaded ? 'Pending Verification' : 'Not Uploaded'}
                          </p>
                        </div>
                      </div>
                      {doc.uploaded && (
                        <button 
                          onClick={() => handleViewDocument(key, doc.url || '')}
                          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250"
                        >
                          <Icon name="EyeIcon" size={16} variant="outline" />
                          View
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Manifesto */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                  Candidate Manifesto
                </h3>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {application.manifesto}
                </p>
              </div>

              {/* Verification Notes */}
              {application.verificationNotes && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                    Verification Notes
                  </h3>
                  <p className="text-foreground">{application.verificationNotes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                <Icon name="CheckCircleIcon" size={24} variant="solid" className="text-success" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-xl text-foreground">Approve Application</h3>
                <p className="text-sm text-muted-foreground">Confirm candidate eligibility</p>
              </div>
            </div>
            <p className="text-foreground mb-6">
              Are you sure you want to approve this application? The candidate will be notified and added to the ballot.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-all duration-250"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-2 bg-success text-success-foreground rounded-md hover:bg-success/90 transition-all duration-250 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-success-foreground/30 border-t-success-foreground rounded-full animate-spin" />
                    <span>Approving...</span>
                  </>
                ) : (
                  <>
                    <Icon name="CheckIcon" size={20} variant="outline" />
                    <span>Approve</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center">
                <Icon name="XCircleIcon" size={24} variant="solid" className="text-error" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-xl text-foreground">Reject Application</h3>
                <p className="text-sm text-muted-foreground">Provide reason for rejection</p>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Rejection Reason <span className="text-error">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                placeholder="Explain why this application is being rejected..."
                className="w-full px-4 py-3 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-all duration-250"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-2 bg-error text-error-foreground rounded-md hover:bg-error/90 transition-all duration-250 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-error-foreground/30 border-t-error-foreground rounded-full animate-spin" />
                    <span>Rejecting...</span>
                  </>
                ) : (
                  <>
                    <Icon name="XMarkIcon" size={20} variant="outline" />
                    <span>Reject</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {showDocumentModal && selectedDocument && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="DocumentTextIcon" size={20} variant="outline" className="text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-xl text-foreground capitalize">
                    {selectedDocument.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">Document Preview</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDocumentModal(false);
                  setSelectedDocument(null);
                }}
                className="p-2 hover:bg-muted rounded-md transition-all duration-250"
              >
                <Icon name="XMarkIcon" size={24} variant="outline" className="text-muted-foreground" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="bg-muted/30 rounded-lg p-4 min-h-[500px] flex items-center justify-center">
                <img
                  src={selectedDocument.url}
                  alt={selectedDocument.name}
                  className="max-w-full max-h-full object-contain rounded-md"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="InformationCircleIcon" size={16} variant="outline" />
                <span>Review document carefully before verification</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowDocumentModal(false);
                    setSelectedDocument(null);
                  }}
                  className="px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-all duration-250"
                >
                  Close
                </button>
                <a
                  href={selectedDocument.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250"
                >
                  <Icon name="ArrowTopRightOnSquareIcon" size={16} variant="outline" />
                  Open in New Tab
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetailsInteractive;
