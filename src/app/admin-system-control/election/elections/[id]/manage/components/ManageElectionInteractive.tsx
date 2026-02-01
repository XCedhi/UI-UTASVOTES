'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';
import { useAdminProfile } from '@/hooks/useAdminProfile';
import { supabase } from '@/lib/supabase';

interface Position {
  id: string;
  title: string;
  candidateCount: number;
  status: 'open' | 'closed';
}

interface ElectionData {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'scheduled' | 'completed' | 'paused' | 'upcoming';
  election_type: string;
  department: string | null;
  nomination_start: string;
  nomination_end: string;
  voting_start: string;
  voting_end: string;
  allowLateVoting: boolean;
  requireVerification: boolean;
  anonymousVoting: boolean;
}

const ManageElectionInteractive = () => {
  const router = useRouter();
  const params = useParams();
  const [isHydrated, setIsHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'settings' | 'positions' | 'candidates' | 'control'>(
    'settings'
  );
  const { userName, userAvatar, notificationCount } = useAdminProfile();
  const [electionData, setElectionData] = useState<ElectionData | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    if (params.id) {
      fetchElectionData();
    }
  }, [params.id]);

  const fetchElectionData = async () => {
    try {
      setLoading(true);
      const electionId = params.id as string;

      // Fetch election details
      const { data: election, error: electionError } = await supabase
        .from('elections')
        .select('*')
        .eq('id', electionId)
        .single();

      if (electionError) {
        console.error('Error fetching election:', electionError);
        throw electionError;
      }

      console.log('✅ Fetched election:', election);

      setElectionData({
        id: election.id,
        name: election.name || election.title || 'Election',
        description: election.description || '',
        status: election.status || 'upcoming',
        election_type: election.election_type || election.type || 'university-wide',
        department: election.department,
        nomination_start: election.nomination_start || election.start_date || '',
        nomination_end: election.nomination_end || '',
        voting_start: election.voting_start || election.start_date || '',
        voting_end: election.voting_end || election.end_date || '',
        allowLateVoting: election.allow_late_voting || false,
        requireVerification: election.require_verification !== false,
        anonymousVoting: election.anonymous_voting !== false,
      });

      // Fetch positions for this election
      const { data: positionsData, error: positionsError } = await supabase
        .from('positions')
        .select('*')
        .eq('election_id', electionId);

      if (!positionsError && positionsData) {
        console.log('✅ Fetched positions:', positionsData);
        
        // Fetch candidate counts for each position
        const positionsWithCounts = await Promise.all(
          positionsData.map(async (pos) => {
            const { count } = await supabase
              .from('candidates')
              .select('*', { count: 'exact', head: true })
              .eq('election_id', electionId)
              .eq('position', pos.title);

            return {
              id: pos.id,
              title: pos.title,
              candidateCount: count || 0,
              status: (pos.is_open !== false ? 'open' : 'closed') as 'open' | 'closed',
            };
          })
        );

        setPositions(positionsWithCounts);
      }

    } catch (error) {
      console.error('Error fetching election data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!electionData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="ExclamationTriangleIcon" size={48} variant="outline" className="mx-auto text-error mb-4" />
          <p className="text-foreground font-semibold mb-2">Election Not Found</p>
          <p className="text-muted-foreground mb-4">The election you're looking for doesn't exist.</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleSaveSettings = async () => {
    try {
      const { error } = await supabase
        .from('elections')
        .update({
          name: electionData.name,
          description: electionData.description,
          status: electionData.status,
          nomination_start: electionData.nomination_start,
          nomination_end: electionData.nomination_end,
          voting_start: electionData.voting_start,
          voting_end: electionData.voting_end,
          allow_late_voting: electionData.allowLateVoting,
          require_verification: electionData.requireVerification,
          anonymous_voting: electionData.anonymousVoting,
          updated_at: new Date().toISOString(),
        })
        .eq('id', electionData.id);

      if (error) {
        console.error('Error updating election:', error);
        alert('Failed to update election settings. Please try again.');
        return;
      }

      console.log('✅ Election settings updated successfully');
      alert('Election settings updated successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to update election settings. Please try again.');
    }
  };

  const handlePauseElection = async () => {
    try {
      const { error } = await supabase
        .from('elections')
        .update({ status: 'paused', updated_at: new Date().toISOString() })
        .eq('id', electionData.id);

      if (error) throw error;

      setElectionData({ ...electionData, status: 'paused' });
      setShowPauseModal(false);
      alert('Election paused successfully');
    } catch (error) {
      console.error('Error pausing election:', error);
      alert('Failed to pause election. Please try again.');
    }
  };

  const handleResumeElection = async () => {
    try {
      const { error } = await supabase
        .from('elections')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', electionData.id);

      if (error) throw error;

      setElectionData({ ...electionData, status: 'active' });
      alert('Election resumed successfully');
    } catch (error) {
      console.error('Error resuming election:', error);
      alert('Failed to resume election. Please try again.');
    }
  };

  const handleEndElection = async () => {
    try {
      const { error } = await supabase
        .from('elections')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', electionData.id);

      if (error) throw error;

      setElectionData({ ...electionData, status: 'completed' });
      setShowEndModal(false);
      alert('Election ended successfully');
    } catch (error) {
      console.error('Error ending election:', error);
      alert('Failed to end election. Please try again.');
    }
  };

  const handleTogglePosition = async (id: string) => {
    try {
      const position = positions.find(p => p.id === id);
      if (!position) return;

      const newStatus = position.status === 'open' ? false : true;

      const { error } = await supabase
        .from('positions')
        .update({ is_open: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setPositions(
        positions.map((p) =>
          p.id === id
            ? { ...p, status: p.status === 'open' ? ('closed' as const) : ('open' as const) }
            : p
        )
      );
    } catch (error) {
      console.error('Error toggling position:', error);
      alert('Failed to update position status. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toTimeString().slice(0, 5);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        userRole="admin"
        userName={userName}
        userAvatar={userAvatar}
        notificationCount={notificationCount}
        electionStatus={{
          isActive: electionData.status === 'active',
          name: electionData.name,
          endTime: electionData.voting_end,
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
                        Nomination Start Date
                      </label>
                      <input
                        type="date"
                        value={formatDate(electionData.nomination_start)}
                        onChange={(e) =>
                          setElectionData({ ...electionData, nomination_start: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Nomination End Date
                      </label>
                      <input
                        type="date"
                        value={formatDate(electionData.nomination_end)}
                        onChange={(e) =>
                          setElectionData({ ...electionData, nomination_end: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Voting Start Date
                      </label>
                      <input
                        type="date"
                        value={formatDate(electionData.voting_start)}
                        onChange={(e) =>
                          setElectionData({ ...electionData, voting_start: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Voting End Date
                      </label>
                      <input
                        type="date"
                        value={formatDate(electionData.voting_end)}
                        onChange={(e) =>
                          setElectionData({ ...electionData, voting_end: e.target.value })
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
                        value={formatTime(electionData.voting_start)}
                        onChange={(e) => {
                          const date = new Date(electionData.voting_start);
                          const [hours, minutes] = e.target.value.split(':');
                          date.setHours(parseInt(hours), parseInt(minutes));
                          setElectionData({ ...electionData, voting_start: date.toISOString() });
                        }}
                        className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Voting End Time
                      </label>
                      <input
                        type="time"
                        value={formatTime(electionData.voting_end)}
                        onChange={(e) => {
                          const date = new Date(electionData.voting_end);
                          const [hours, minutes] = e.target.value.split(':');
                          date.setHours(parseInt(hours), parseInt(minutes));
                          setElectionData({ ...electionData, voting_end: date.toISOString() });
                        }}
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
                          <p className="font-medium text-foreground">{position.title}</p>
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
