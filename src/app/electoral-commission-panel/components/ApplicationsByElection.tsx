'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';
import CandidateApplicationCard from './CandidateApplicationCard';

interface CandidateApplicationDocStatus {
  idCard: boolean;
  transcript: boolean;
  manifesto: boolean;
}

interface CandidateApplicationLike {
  id: string;
  candidateName: string;
  studentId: string;
  email: string;
  position: string;
  electionId?: string;
  electionName?: string;
  department: string;
  avatar: string;
  submittedAt: string;
  documents: CandidateApplicationDocStatus;
  eligibilityStatus: 'pending' | 'verified' | 'rejected';
  paymentStatus: 'pending' | 'completed';
  applicationFee: number;
}

interface ElectionLike {
  id: string;
  name: string;
  status?: string;
}

interface ApplicationsByElectionProps {
  applications: CandidateApplicationLike[];
  elections?: ElectionLike[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onViewDetails: (id: string) => void;
}

const getElectionStatusStyle = (status?: string) => {
  switch (status) {
    case 'active':
      return 'bg-success/10 text-success';
    case 'scheduled':
    case 'upcoming':
      return 'bg-warning/10 text-warning';
    case 'completed':
      return 'bg-muted text-muted-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const ApplicationsByElection = ({
  applications,
  elections = [],
  onApprove,
  onReject,
  onViewDetails,
}: ApplicationsByElectionProps) => {
  const electionLookup = new Map<string, ElectionLike>();
  elections.forEach((e) => electionLookup.set(String(e.id), e));

  const pendingTotal = applications.filter((a) => a.eligibilityStatus === 'pending').length;

  // Group applications under their respective elections
  const groupMap = new Map<string, CandidateApplicationLike[]>();
  applications.forEach((app) => {
    const key = app.electionId ? String(app.electionId) : 'unassigned';
    const list = groupMap.get(key) || [];
    list.push(app);
    groupMap.set(key, list);
  });

  const groups = Array.from(groupMap.entries())
    .map(([electionId, apps]) => {
      const election = electionLookup.get(electionId);
      return {
        electionId,
        electionName: election?.name || apps[0]?.electionName || 'Unassigned Election',
        electionStatus: election?.status,
        applications: apps,
      };
    })
    .sort((a, b) => a.electionName.localeCompare(b.electionName));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-heading font-semibold text-xl text-foreground">
          Applications by Election
        </h2>
        <span className="px-3 py-1 bg-warning text-warning-foreground rounded-full text-sm font-caption">
          {pendingTotal} Pending
        </span>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12">
          <Icon
            name="CheckCircleIcon"
            size={48}
            variant="outline"
            className="mx-auto text-success mb-4"
          />
          <p className="text-muted-foreground">No applications submitted yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => {
            const pending = group.applications.filter((a) => a.eligibilityStatus === 'pending');
            const approved = group.applications.filter((a) => a.eligibilityStatus === 'verified');
            const rejected = group.applications.filter((a) => a.eligibilityStatus === 'rejected');

            return (
              <div
                key={group.electionId}
                className="border border-border rounded-md overflow-hidden"
              >
                {/* Election group header */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-muted border-b border-border">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-md flex-shrink-0">
                      <Icon name="CheckBadgeIcon" size={20} variant="outline" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-heading font-semibold text-lg text-foreground truncate">
                        {group.electionName}
                      </h3>
                      <p className="text-xs text-muted-foreground font-caption">
                        {group.applications.length} application
                        {group.applications.length === 1 ? '' : 's'}
                        {pending.length > 0 && (
                          <>
                            {' '}
                            •{' '}
                            <span className="text-warning font-caption">
                              {pending.length} pending
                            </span>
                          </>
                        )}
                        {approved.length > 0 && (
                          <>
                            {' '}
                            •{' '}
                            <span className="text-success font-caption">
                              {approved.length} approved
                            </span>
                          </>
                        )}
                        {rejected.length > 0 && (
                          <>
                            {' '}
                            &bull;{' '}
                            <span className="text-error font-caption">
                              {rejected.length} rejected
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {group.electionStatus && (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-caption capitalize flex-shrink-0 ${getElectionStatusStyle(
                        group.electionStatus
                      )}`}
                    >
                      {group.electionStatus}
                    </span>
                  )}
                </div>

                <div className="p-5 space-y-4">
                  {pending.length > 0 && (
                    <>
                      <h4 className="font-heading font-semibold text-sm text-foreground flex items-center gap-2">
                        <Icon
                          name="ClockIcon"
                          size={16}
                          variant="outline"
                          className="text-warning"
                        />
                        Pending ({pending.length})
                      </h4>
                      {pending.map((application) => (
                        <CandidateApplicationCard
                          key={application.id}
                          application={application}
                          onApprove={onApprove}
                          onReject={onReject}
                          onViewDetails={onViewDetails}
                        />
                      ))}
                    </>
                  )}

                  {approved.length > 0 && (
                    <>
                      <h4 className="font-heading font-semibold text-sm text-foreground flex items-center gap-2 pt-2">
                        <Icon
                          name="CheckCircleIcon"
                          size={16}
                          variant="outline"
                          className="text-success"
                        />
                        Approved ({approved.length})
                      </h4>
                      {approved.map((application) => (
                        <CandidateApplicationCard
                          key={application.id}
                          application={application}
                          onApprove={onApprove}
                          onReject={onReject}
                          onViewDetails={onViewDetails}
                        />
                      ))}
                    </>
                  )}

                  {rejected.length > 0 && (
                    <>
                      <h4 className="font-heading font-semibold text-sm text-foreground flex items-center gap-2 pt-2">
                        <Icon
                          name="XCircleIcon"
                          size={16}
                          variant="outline"
                          className="text-error"
                        />
                        Rejected ({rejected.length})
                      </h4>
                      {rejected.map((application) => (
                        <CandidateApplicationCard
                          key={application.id}
                          application={application}
                          onApprove={onApprove}
                          onReject={onReject}
                          onViewDetails={onViewDetails}
                        />
                      ))}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ApplicationsByElection;
