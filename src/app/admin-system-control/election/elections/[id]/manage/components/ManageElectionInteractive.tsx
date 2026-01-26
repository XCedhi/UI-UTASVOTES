'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';

interface Position {
  id: string;
  name: string;
  candidateCount: number;
  status: 'open' | 'closed';
}

const ManageElectionInteractive = () => {
  const router = useRouter();
  const params = useParams();
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'positions' | 'candidates' | 'control'>(
    'settings'
  );
  const [electionData, setElectionData] = useState({
    name: 'Student Council 2026',
    status: 'active' as 'active' | 'scheduled' | 'completed' | 'paused',
    startDate: '2026-01-20',
    endDate: '2026-01-23',
    votingStartTime: '08:00',
    votingEndTime: '18:00',
    allowLateVoting: false,
    requireVerification: true,
    anonymousVoting: true,
  });
  const [positions, setPositions] = useState<Position[]>([
    { id: '1', name: 'SRC President', candidateCount: 4, status: 'open' },
    { id: '2', name: 'Vice President', candidateCount: 3, status: 'open' },
    { id: '3', name: 'General Secretary', candidateCount: 5, status: 'open' },
    { id: '4', name: 'Financial Secretary', candidateCount: 2, status: 'open' },
  ]);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSaveSettings = () => {
    console.log('Saving election settings:', electionData);
    alert('Election settings updated successfully!');
  };

  const handlePauseElection = () => {
    setElectionData({ ...electionData, status: 'paused' });
    setShowPauseModal(false);
    alert('Election paused successfully');
  };

  const handleResumeElection = () => {
    setElectionData({ ...electionData, status: 'active' });
    alert('Election resumed successfully');
  };

  const handleEndElection = () => {
    setElectionData({ ...electionData, status: 'completed' });
    setShowEndModal(false);
    alert('Election ended successfully');
  };

  const handleTogglePosition = (id: string) => {
    setPositions(
      positions.map((p) =>
        p.id === id
          ? { ...p, status: p.status === 'open' ? ('closed' as const) : ('open' as const) }
          : p
      )
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        userRole="admin"
        userName="System Administrator"
        userAvatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"
        notificationCount={0}
        electionStatus={{
          isActive: electionData.status === 'active',
          name: electionData.name,
          endTime: '2026-01-23T18:00:00',
        }}
      />

      <main className="pt-24 pb-12 px-4 lg:px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-muted rounded-md transition-all duration-250 ease-smooth"
            >
              <Icon name="ArrowLeftIcon" size={24} variant="outline" className="text-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-heading font-semibold text-foreground">
                Manage Election
              </h1>
              <p className="text-muted-foreground mt-1">{electionData.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  electionData.status === 'active'
                    ? 'bg-success/20 text-success'
                    : electionData.status === 'paused'
                      ? 'bg-warning/20 text-warning'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {electionData.status.charAt(0).toUpperCase() + electionData.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-card border border-border rounded-md">
            <div className="border-b border-border">
              <div className="flex items-center gap-2 p-2">
                {[
                  { value: 'settings', label: 'Settings', icon: 'Cog6ToothIcon' },
                  { value: 'positions', label: 'Positions', icon: 'ListBulletIcon' },
                  { value: 'candidates', label: 'Candidates', icon: 'UserGroupIcon' },
                  { value: 'control', label: 'Control Panel', icon: 'CommandLineIcon' },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value as any)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-all duration-250 ease-smooth ${
                      activeTab === tab.value
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon name={tab.icon as any} size={18} variant="outline" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-heading font-semibold text-foreground">
                    Election Settings
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Election Name
                      </label>
                      <input
                        type="text"
                        value={electionData.name}
                        onChange={(e) => setElectionData({ ...electionData, name: e.target.value })}
                        className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Status
                      </label>
                      <select
                        value={electionData.status}
                        onChange={(e) =>
                          setElectionData({ ...electionData, status: e.target.value as any })
                        }
                        disabled={electionData.status === 'completed'}
                        className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={electionData.startDate}
                        onChange={(e) =>
                          setElectionData({ ...electionData, startDate: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={electionData.endDate}
                        onChange={(e) =>
                          setElectionData({ ...electionData, endDate: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Voting Start Time
                      </label>
                      <input
                        type="time"
                        value={electionData.votingStartTime}
                        onChange={(e) =>
                          setElectionData({ ...electionData, votingStartTime: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Voting End Time
                      </label>
                      <input
                        type="time"
                        value={electionData.votingEndTime}
                        onChange={(e) =>
                          setElectionData({ ...electionData, votingEndTime: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border">
                    <h3 className="font-medium text-foreground">Voting Options</h3>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={electionData.allowLateVoting}
                        onChange={(e) =>
                          setElectionData({ ...electionData, allowLateVoting: e.target.checked })
                        }
                        className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">Allow Late Voting</p>
                        <p className="text-xs text-muted-foreground">
                          Permit voting after official end time
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={electionData.requireVerification}
                        onChange={(e) =>
                          setElectionData({
                            ...electionData,
                            requireVerification: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">Require Verification</p>
                        <p className="text-xs text-muted-foreground">
                          Voters must verify identity before voting
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={electionData.anonymousVoting}
                        onChange={(e) =>
                          setElectionData({ ...electionData, anonymousVoting: e.target.checked })
                        }
                        className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">Anonymous Voting</p>
                        <p className="text-xs text-muted-foreground">
                          Keep voter choices completely anonymous
                        </p>
                      </div>
                    </label>
                  </div>

                  <button
                    onClick={handleSaveSettings}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250 ease-smooth"
                  >
                    <Icon name="CheckCircleIcon" size={20} variant="outline" />
                    <span className="font-medium">Save Settings</span>
                  </button>
                </div>
              )}

              {activeTab === 'positions' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-heading font-semibold text-foreground">
                      Election Positions
                    </h2>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250 ease-smooth">
                      <Icon name="PlusIcon" size={16} variant="outline" />
                      <span className="text-sm font-medium">Add Position</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {positions.map((position) => (
                      <div
                        key={position.id}
                        className="flex items-center justify-between p-4 bg-muted rounded-md"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{position.name}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {position.candidateCount} candidates
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              position.status === 'open'
                                ? 'bg-success/20 text-success'
                                : 'bg-error/20 text-error'
                            }`}
                          >
                            {position.status === 'open' ? 'Open' : 'Closed'}
                          </span>
                          <button
                            onClick={() => handleTogglePosition(position.id)}
                            className="p-2 hover:bg-background rounded-md transition-all duration-250 ease-smooth"
                          >
                            <Icon
                              name={position.status === 'open' ? 'LockClosedIcon' : 'LockOpenIcon'}
                              size={20}
                              variant="outline"
                              className="text-muted-foreground"
                            />
                          </button>
                          <button className="p-2 hover:bg-background rounded-md transition-all duration-250 ease-smooth">
                            <Icon
                              name="PencilIcon"
                              size={20}
                              variant="outline"
                              className="text-muted-foreground"
                            />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'candidates' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-heading font-semibold text-foreground">
                    Candidate Management
                  </h2>
                  <div className="text-center py-12">
                    <Icon
                      name="UserGroupIcon"
                      size={48}
                      variant="outline"
                      className="mx-auto text-muted-foreground mb-4"
                    />
                    <p className="text-muted-foreground">
                      Candidate management interface coming soon
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'control' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-heading font-semibold text-foreground">
                    Election Control Panel
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {electionData.status === 'active' && (
                      <button
                        onClick={() => setShowPauseModal(true)}
                        className="flex items-center gap-3 p-6 bg-warning/10 border-2 border-warning rounded-md hover:bg-warning/20 transition-all duration-250 ease-smooth"
                      >
                        <Icon
                          name="PauseIcon"
                          size={24}
                          variant="outline"
                          className="text-warning"
                        />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-foreground">Pause Election</p>
                          <p className="text-sm text-muted-foreground">Temporarily stop voting</p>
                        </div>
                      </button>
                    )}

                    {electionData.status === 'paused' && (
                      <button
                        onClick={handleResumeElection}
                        className="flex items-center gap-3 p-6 bg-success/10 border-2 border-success rounded-md hover:bg-success/20 transition-all duration-250 ease-smooth"
                      >
                        <Icon
                          name="PlayIcon"
                          size={24}
                          variant="outline"
                          className="text-success"
                        />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-foreground">Resume Election</p>
                          <p className="text-sm text-muted-foreground">Continue voting</p>
                        </div>
                      </button>
                    )}

                    {electionData.status !== 'completed' && (
                      <button
                        onClick={() => setShowEndModal(true)}
                        className="flex items-center gap-3 p-6 bg-error/10 border-2 border-error rounded-md hover:bg-error/20 transition-all duration-250 ease-smooth"
                      >
                        <Icon name="StopIcon" size={24} variant="outline" className="text-error" />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-foreground">End Election</p>
                          <p className="text-sm text-muted-foreground">Permanently close voting</p>
                        </div>
                      </button>
                    )}

                    <button className="flex items-center gap-3 p-6 bg-primary/10 border-2 border-primary rounded-md hover:bg-primary/20 transition-all duration-250 ease-smooth">
                      <Icon
                        name="ArrowPathIcon"
                        size={24}
                        variant="outline"
                        className="text-primary"
                      />
                      <div className="flex-1 text-left">
                        <p className="font-medium text-foreground">Refresh Results</p>
                        <p className="text-sm text-muted-foreground">Update vote counts</p>
                      </div>
                    </button>

                    <button className="flex items-center gap-3 p-6 bg-muted border-2 border-border rounded-md hover:bg-muted/80 transition-all duration-250 ease-smooth">
                      <Icon
                        name="BellAlertIcon"
                        size={24}
                        variant="outline"
                        className="text-foreground"
                      />
                      <div className="flex-1 text-left">
                        <p className="font-medium text-foreground">Send Notification</p>
                        <p className="text-sm text-muted-foreground">Alert all voters</p>
                      </div>
                    </button>

                    <button className="flex items-center gap-3 p-6 bg-muted border-2 border-border rounded-md hover:bg-muted/80 transition-all duration-250 ease-smooth">
                      <Icon
                        name="DocumentChartBarIcon"
                        size={24}
                        variant="outline"
                        className="text-foreground"
                      />
                      <div className="flex-1 text-left">
                        <p className="font-medium text-foreground">Generate Report</p>
                        <p className="text-sm text-muted-foreground">Create election report</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Pause Modal */}
      {showPauseModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[1200] flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-md p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-warning/20 text-warning rounded-md">
                <Icon name="ExclamationTriangleIcon" size={24} variant="outline" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-foreground">
                Pause Election?
              </h3>
            </div>
            <p className="text-muted-foreground mb-6">
              This will temporarily stop all voting. You can resume the election at any time.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPauseModal(false)}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-all duration-250 ease-smooth"
              >
                Cancel
              </button>
              <button
                onClick={handlePauseElection}
                className="flex-1 px-4 py-2 bg-warning text-warning-foreground rounded-md hover:bg-warning/90 transition-all duration-250 ease-smooth"
              >
                Pause Election
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End Modal */}
      {showEndModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[1200] flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-md p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-error/20 text-error rounded-md">
                <Icon name="ExclamationTriangleIcon" size={24} variant="outline" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-foreground">End Election?</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              This will permanently close voting and finalize results. This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowEndModal(false)}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-all duration-250 ease-smooth"
              >
                Cancel
              </button>
              <button
                onClick={handleEndElection}
                className="flex-1 px-4 py-2 bg-error text-error-foreground rounded-md hover:bg-error/90 transition-all duration-250 ease-smooth"
              >
                End Election
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageElectionInteractive;
