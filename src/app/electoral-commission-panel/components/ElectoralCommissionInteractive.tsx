'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import ElectionStatusIndicator from '@/components/common/ElectionStatusIndicator';
import NotificationCenter from '@/components/common/NotificationCenter';
import CandidateApplicationCard from './CandidateApplicationCard';
import ElectionMonitoringCard from './ElectionMonitoringCard';
import SystemAlertCard from './SystemAlertCard';
import ElectionBasedFeeManager from '../election-management/components/ElectionBasedFeeManager';
import QuickStatsGrid from './QuickStatsGrid';
import CommissionActivityLog from './CommissionActivityLog';
import Icon from '@/components/ui/AppIcon';
import { supabase } from '@/lib/supabase';

interface Notification {
  id: string;
  type: 'election' | 'deadline' | 'result' | 'approval' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

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

interface ElectionData {
  id: string;
  name: string;
  status: 'active' | 'scheduled' | 'completed';
  totalVoters: number;
  votedCount: number;
  startDate: string;
  endDate: string;
  positions: number;
  candidates: number;
  turnoutPercentage: number;
}

interface SystemAlert {
  id: string;
  type: 'security' | 'system' | 'fraud' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  isResolved: boolean;
}

interface FeeStructure {
  id: string;
  position: string;
  amount: number;
  lastUpdated: string;
}

interface ActivityLog {
  id: string;
  commissionMember: string;
  memberAvatar: string;
  action: string;
  target: string;
  timestamp: string;
  actionType: 'approval' | 'rejection' | 'update' | 'creation' | 'deletion';
}

interface QuickStat {
  label: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: string;
}

const ElectoralCommissionInteractive = () => {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<'applications' | 'elections' | 'fees' | 'reports'>(
    'applications'
  );
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [elections, setElections] = useState<ElectionData[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [quickStats, setQuickStats] = useState<QuickStat[]>([]);
  const [reportType, setReportType] = useState<'election' | 'candidate' | 'voter' | 'financial'>(
    'election'
  );
  const [selectedElectionForReport, setSelectedElectionForReport] = useState<string>('');

  useEffect(() => {
    setIsHydrated(true);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('🔍 Starting fetchDashboardData...');
      
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session check:', session ? 'Authenticated' : 'Not authenticated');
      console.log('User ID:', session?.user?.id);
      console.log('User email:', session?.user?.email);
      
      if (!session) {
        console.error('❌ No active session - user not authenticated');
        alert('Authentication error: Please log out and log back in');
        return;
      }
      
      // Fetch elections from database
      const { data: electionsData, error: electionsError } = await supabase
        .from('elections')
        .select('*')
        .order('created_at', { ascending: false });

      if (electionsError) {
        console.error('Error fetching elections:', electionsError.message || electionsError);
      } else if (electionsData) {
        // Transform database elections to match component interface
        const transformedElections: ElectionData[] = electionsData.map((election) => ({
          id: election.id.toString(),
          name: election.name || election.title || 'Unnamed Election',
          status: election.status as 'active' | 'scheduled' | 'completed',
          totalVoters: 0, // TODO: Calculate from user_profiles where role='student'
          votedCount: 0, // TODO: Calculate from votes table
          startDate: election.voting_start || election.start_date || new Date().toISOString(),
          endDate: election.voting_end || election.end_date || new Date().toISOString(),
          positions: 0, // Will be calculated below
          candidates: 0, // Will be calculated below
          turnoutPercentage: 0,
        }));

        // Fetch positions count for each election
        for (const election of transformedElections) {
          const { data: positionsData } = await supabase
            .from('positions')
            .select('id')
            .eq('election_id', election.id);
          
          election.positions = positionsData?.length || 0;

          // Fetch candidates count for each election
          const { data: candidatesData } = await supabase
            .from('candidates')
            .select('id')
            .eq('election_id', election.id);
          
          election.candidates = candidatesData?.length || 0;
        }

        // Get total student count for voter stats
        const { data: studentsData } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('role', 'student');
        
        const totalStudents = studentsData?.length || 0;

        // Update elections with voter counts
        transformedElections.forEach(election => {
          election.totalVoters = totalStudents;
          // Calculate turnout if we have votes
          if (election.totalVoters > 0) {
            election.turnoutPercentage = Math.round((election.votedCount / election.totalVoters) * 100);
          }
        });

        setElections(transformedElections);
      }

      // Fetch candidates/applications from database
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (candidatesError) {
        console.error('Error fetching candidates:', candidatesError);
        console.error('Full error details:', JSON.stringify(candidatesError, null, 2));
        alert(`Error loading applications: ${candidatesError.message}`);
      } else if (candidatesData) {
        console.log('✅ Fetched candidates data:', candidatesData);
        console.log('✅ Number of applications found:', candidatesData.length);
        console.log('✅ First candidate:', candidatesData[0]);
        
        if (candidatesData.length === 0) {
          console.warn('⚠️ No candidates found in database');
        }
        
        // Transform database candidates to match component interface
        const transformedApplications: CandidateApplication[] = candidatesData.map((candidate) => {
          console.log('Transforming candidate:', candidate.name || candidate.full_name);
          return {
            id: candidate.id.toString(),
            candidateName: candidate.name || candidate.full_name || 'Unknown',
            studentId: candidate.student_id || 'N/A',
            email: candidate.email || 'N/A',
            position: candidate.position || 'N/A',
            department: candidate.department || 'N/A',
            avatar: candidate.avatar || candidate.photo_url || 'https://via.placeholder.com/150',
            submittedAt: candidate.submitted_at || candidate.created_at,
            documents: {
              idCard: !!candidate.student_id_doc_url,
              transcript: !!candidate.transcript_url,
              manifesto: !!(candidate.manifesto || candidate.manifesto_url || candidate.manifesto_doc_url),
            },
            eligibilityStatus: candidate.status === 'pending' ? 'pending' : candidate.status === 'approved' ? 'verified' : 'rejected',
            paymentStatus: candidate.transaction_id ? 'completed' : 'pending',
            applicationFee: candidate.application_fee || 0,
          };
        });

        console.log('✅ Transformed applications:', transformedApplications);
        console.log('✅ Setting applications state with', transformedApplications.length, 'items');
        setApplications(transformedApplications);
      }

      // Fetch notifications from database
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (notificationsError) {
        console.error('Error fetching notifications:', notificationsError);
      } else if (notificationsData) {
        const transformedNotifications: Notification[] = notificationsData.map((notif) => ({
          id: notif.id.toString(),
          type: (notif.type || 'system') as 'election' | 'deadline' | 'result' | 'approval' | 'system',
          title: notif.title || 'Notification',
          message: notif.message || '',
          timestamp: notif.created_at || new Date().toISOString(),
          isRead: notif.is_read || false,
          actionUrl: notif.action_url,
        }));

        setNotifications(transformedNotifications);
      }

      // Calculate quick stats from real data
      const pendingApplicationsCount = candidatesData?.filter(c => c.status === 'pending').length || 0;
      const activeElectionsCount = electionsData?.filter(e => e.status === 'active').length || 0;
      const totalCandidatesCount = candidatesData?.length || 0;
      
      // Fetch system alerts count
      const { data: alertsData } = await supabase
        .from('system_alerts')
        .select('id')
        .eq('is_resolved', false);
      
      const systemAlertsCount = alertsData?.length || 0;

      const calculatedStats: QuickStat[] = [
        {
          label: 'Pending Applications',
          value: pendingApplicationsCount,
          icon: 'DocumentTextIcon',
          trend: { value: 0, isPositive: true },
          color: 'bg-warning/20 text-warning',
        },
        {
          label: 'Active Elections',
          value: activeElectionsCount,
          icon: 'CheckBadgeIcon',
          trend: { value: 0, isPositive: true },
          color: 'bg-success/20 text-success',
        },
        {
          label: 'Total Candidates',
          value: totalCandidatesCount,
          icon: 'UserGroupIcon',
          trend: { value: 0, isPositive: true },
          color: 'bg-primary/20 text-primary',
        },
        {
          label: 'System Alerts',
          value: systemAlertsCount,
          icon: 'ExclamationTriangleIcon',
          trend: { value: 0, isPositive: false },
          color: 'bg-error/20 text-error',
        },
      ];

      setQuickStats(calculatedStats);

      // Fetch system alerts
      const { data: systemAlertsData, error: alertsError } = await supabase
        .from('system_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!alertsError && systemAlertsData) {
        const transformedAlerts: SystemAlert[] = systemAlertsData.map((alert) => ({
          id: alert.id.toString(),
          type: (alert.type || 'system') as 'security' | 'system' | 'fraud' | 'warning' | 'info',
          title: alert.title || 'System Alert',
          message: alert.message || '',
          timestamp: alert.created_at || new Date().toISOString(),
          severity: (alert.severity || 'low') as 'critical' | 'high' | 'medium' | 'low',
          isResolved: alert.is_resolved || false,
        }));

        setSystemAlerts(transformedAlerts);
      }

      // Mock data for activity logs and fee structures (these can be added to database later)
      const mockActivityLogs: ActivityLog[] = [
        {
          id: '1',
          commissionMember: 'Electoral Commission',
          memberAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
          action: 'reviewed candidate applications',
          target: 'Recent submissions',
          timestamp: new Date().toISOString(),
          actionType: 'approval',
        },
      ];

      const mockFeeStructures: FeeStructure[] = [
        { id: '1', position: 'SRC President', amount: 50.0, lastUpdated: '2026-01-15T10:00:00' },
        { id: '2', position: 'Vice President', amount: 40.0, lastUpdated: '2026-01-15T10:00:00' },
        { id: '3', position: 'General Secretary', amount: 35.0, lastUpdated: '2026-01-15T10:00:00' },
      ];

      setActivityLogs(mockActivityLogs);
      setFeeStructures(mockFeeStructures);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Electoral Commission Panel...</p>
        </div>
      </div>
    );
  }

  const handleApproveApplication = (id: string) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, eligibilityStatus: 'verified' as const } : app))
    );
    console.log('Approved application:', id);
  };

  const handleRejectApplication = (id: string) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, eligibilityStatus: 'rejected' as const } : app))
    );
    console.log('Rejected application:', id);
  };

  const handleViewApplicationDetails = (id: string) => {
    router.push(`/electoral-commission-panel/applications/${id}`);
  };

  const handleViewElectionAnalytics = (id: string) => {
    router.push(`/electoral-commission-panel/elections/${id}/analytics`);
  };

  const handleManageElection = (id: string) => {
    router.push(`/electoral-commission-panel/elections/${id}/manage`);
  };

  const handleCreateElection = () => {
    router.push('/electoral-commission-panel/elections/create');
  };

  const handleUpdateFee = async (id: string, newAmount: number, newPosition?: string) => {
    try {
      // Update in database
      const { error } = await supabase
        .from('fee_structures')
        .update({
          amount: newAmount,
          position: newPosition,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating fee:', error);
        alert('Failed to update fee. Please try again.');
        return;
      }

      // Update local state
      setFeeStructures((prev) =>
        prev.map((fee) =>
          fee.id === id
            ? {
                ...fee,
                amount: newAmount,
                position: newPosition || fee.position,
                lastUpdated: new Date().toISOString(),
              }
            : fee
        )
      );
      alert('Fee updated successfully!');
    } catch (error) {
      console.error('Error updating fee:', error);
      alert('Failed to update fee. Please try again.');
    }
  };

  const handleAddFee = async (position: string, amount: number) => {
    try {
      // Insert into database
      const { data, error } = await supabase
        .from('fee_structures')
        .insert({
          position,
          amount,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding fee:', error);
        alert('Failed to add position. Please try again.');
        return;
      }

      // Add to local state
      setFeeStructures((prev) => [
        ...prev,
        {
          id: data.id,
          position,
          amount,
          lastUpdated: new Date().toISOString(),
        },
      ]);
      alert('Position added successfully!');
    } catch (error) {
      console.error('Error adding fee:', error);
      alert('Failed to add position. Please try again.');
    }
  };

  const handleDeleteFee = async (id: string) => {
    if (!confirm('Are you sure you want to delete this position?')) {
      return;
    }

    try {
      // Delete from database
      const { error } = await supabase.from('fee_structures').delete().eq('id', id);

      if (error) {
        console.error('Error deleting fee:', error);
        alert('Failed to delete position. Please try again.');
        return;
      }

      // Remove from local state
      setFeeStructures((prev) => prev.filter((fee) => fee.id !== id));
      alert('Position deleted successfully!');
    } catch (error) {
      console.error('Error deleting fee:', error);
      alert('Failed to delete position. Please try again.');
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const handleGenerateReport = () => {
    if (!selectedElectionForReport) {
      alert('Please select an election to generate report');
      return;
    }

    const election = elections.find((e) => e.id === selectedElectionForReport);
    if (!election) return;

    console.log(`Generating ${reportType} report for ${election.name}...`);

    // Simulate report generation
    const reportData = {
      election: election.name,
      type: reportType,
      generatedAt: new Date().toISOString(),
      totalVoters: election.totalVoters,
      votedCount: election.votedCount,
      turnout: election.turnoutPercentage,
    };

    // In production, this would trigger actual report generation
    alert(
      `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report generated successfully!\n\nElection: ${election.name}\nTurnout: ${election.turnoutPercentage}%\nVotes Cast: ${election.votedCount}/${election.totalVoters}`
    );
  };

  const handleExportData = (format: 'pdf' | 'csv' | 'excel') => {
    if (!selectedElectionForReport) {
      alert('Please select an election to export data');
      return;
    }

    const election = elections.find((e) => e.id === selectedElectionForReport);
    if (!election) return;

    console.log(`Exporting ${election.name} data as ${format.toUpperCase()}...`);
    alert(`Data exported successfully as ${format.toUpperCase()}!`);
  };

  const activeElection = elections.find((e) => e.status === 'active');
  const unreadNotificationCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-background">
      <Header
        userRole="commission"
        userName="Dr. Akosua Boateng"
        userAvatar="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg"
        notificationCount={unreadNotificationCount}
        electionStatus={
          activeElection
            ? {
                isActive: true,
                name: activeElection.name,
                endTime: activeElection.endDate,
              }
            : { isActive: false, name: 'No Active Election' }
        }
      />

      <main className="pt-24 pb-12 px-4 lg:px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-heading font-semibold text-foreground mb-2">
                Electoral Commission Panel
              </h1>
              <p className="text-muted-foreground">
                Comprehensive election management and oversight dashboard
              </p>
            </div>

            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="lg:hidden p-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250 ease-smooth"
              aria-label="Toggle notifications"
            >
              <Icon name="BellIcon" size={20} variant="outline" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-error-foreground text-xs rounded-full flex items-center justify-center">
                  {unreadNotificationCount}
                </span>
              )}
            </button>
          </div>

          {activeElection && (
            <div className="mb-6">
              <ElectionStatusIndicator
                isActive={true}
                electionName={activeElection.name}
                endTime={activeElection.endDate}
              />
            </div>
          )}

          <QuickStatsGrid stats={quickStats} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card border border-border rounded-md">
                <div className="border-b border-border">
                  <div className="flex items-center gap-2 p-2">
                    <button
                      onClick={() => setActiveTab('applications')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-all duration-250 ease-smooth ${
                        activeTab === 'applications'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon name="DocumentTextIcon" size={18} variant="outline" />
                      <span className="text-sm font-medium">Applications</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('elections')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-all duration-250 ease-smooth ${
                        activeTab === 'elections'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon name="CheckBadgeIcon" size={18} variant="outline" />
                      <span className="text-sm font-medium">Elections</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('fees')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-all duration-250 ease-smooth ${
                        activeTab === 'fees'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon name="CurrencyDollarIcon" size={18} variant="outline" />
                      <span className="text-sm font-medium">Fees</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('reports')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-all duration-250 ease-smooth ${
                        activeTab === 'reports'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon name="DocumentChartBarIcon" size={18} variant="outline" />
                      <span className="text-sm font-medium">Reports</span>
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {activeTab === 'applications' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="font-heading font-semibold text-xl text-foreground">
                          Pending Applications
                        </h2>
                        <span className="px-3 py-1 bg-warning text-warning-foreground rounded-full text-sm font-caption">
                          {applications.filter((a) => a.eligibilityStatus === 'pending').length}{' '}
                          Pending
                        </span>
                      </div>

                      {applications.filter((a) => a.eligibilityStatus === 'pending').length > 0 ? (
                        applications
                          .filter((a) => a.eligibilityStatus === 'pending')
                          .map((application) => (
                            <CandidateApplicationCard
                              key={application.id}
                              application={application}
                              onApprove={handleApproveApplication}
                              onReject={handleRejectApplication}
                              onViewDetails={handleViewApplicationDetails}
                            />
                          ))
                      ) : (
                        <div className="text-center py-12">
                          <Icon
                            name="CheckCircleIcon"
                            size={48}
                            variant="outline"
                            className="mx-auto text-success mb-4"
                          />
                          <p className="text-muted-foreground">No pending applications</p>
                        </div>
                      )}

                      {applications.filter((a) => a.eligibilityStatus === 'verified').length >
                        0 && (
                        <>
                          <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-4">
                            Approved Applications
                          </h3>
                          {applications
                            .filter((a) => a.eligibilityStatus === 'verified')
                            .map((application) => (
                              <CandidateApplicationCard
                                key={application.id}
                                application={application}
                                onApprove={handleApproveApplication}
                                onReject={handleRejectApplication}
                                onViewDetails={handleViewApplicationDetails}
                              />
                            ))}
                        </>
                      )}
                    </div>
                  )}

                  {activeTab === 'elections' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="font-heading font-semibold text-xl text-foreground">
                          Election Monitoring
                        </h2>
                        <button
                          onClick={handleCreateElection}
                          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250 ease-smooth"
                        >
                          <Icon name="PlusIcon" size={16} variant="outline" />
                          <span className="text-sm font-medium">Create Election</span>
                        </button>
                      </div>

                      {elections.map((election) => (
                        <ElectionMonitoringCard
                          key={election.id}
                          election={election}
                          onViewAnalytics={handleViewElectionAnalytics}
                          onManageElection={handleManageElection}
                        />
                      ))}
                    </div>
                  )}

                  {activeTab === 'fees' && (
                    <ElectionBasedFeeManager />
                  )}

                  {activeTab === 'reports' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="font-heading font-semibold text-xl text-foreground">
                          Election Reports & Analytics
                        </h2>
                      </div>

                      {/* Report Generation Section */}
                      <div className="bg-muted rounded-md p-6">
                        <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                          Generate New Report
                        </h3>

                        <div className="space-y-4">
                          {/* Election Selection */}
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              Select Election
                            </label>
                            <select
                              value={selectedElectionForReport}
                              onChange={(e) => setSelectedElectionForReport(e.target.value)}
                              className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="">Choose an election...</option>
                              {elections.map((election) => (
                                <option key={election.id} value={election.id}>
                                  {election.name} ({election.status})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Report Type Selection */}
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              Report Type
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                              {[
                                {
                                  value: 'election',
                                  label: 'Election Summary',
                                  icon: 'ChartBarIcon',
                                },
                                {
                                  value: 'candidate',
                                  label: 'Candidate Analysis',
                                  icon: 'UserGroupIcon',
                                },
                                { value: 'voter', label: 'Voter Statistics', icon: 'UsersIcon' },
                                {
                                  value: 'financial',
                                  label: 'Financial Report',
                                  icon: 'CurrencyDollarIcon',
                                },
                              ].map((type) => (
                                <button
                                  key={type.value}
                                  onClick={() => setReportType(type.value as any)}
                                  className={`flex items-center gap-3 p-4 rounded-md border-2 transition-all duration-250 ease-smooth ${
                                    reportType === type.value
                                      ? 'border-primary bg-primary/10'
                                      : 'border-border bg-background hover:border-primary/50'
                                  }`}
                                >
                                  <Icon
                                    name={type.icon as any}
                                    size={20}
                                    variant="outline"
                                    className={
                                      reportType === type.value
                                        ? 'text-primary'
                                        : 'text-muted-foreground'
                                    }
                                  />
                                  <span
                                    className={`text-sm font-medium ${
                                      reportType === type.value ? 'text-primary' : 'text-foreground'
                                    }`}
                                  >
                                    {type.label}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Generate Button */}
                          <button
                            onClick={handleGenerateReport}
                            disabled={!selectedElectionForReport}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-250 ease-smooth"
                          >
                            <Icon name="DocumentChartBarIcon" size={20} variant="outline" />
                            <span className="font-medium">Generate Report</span>
                          </button>
                        </div>
                      </div>

                      {/* Export Options */}
                      <div className="bg-muted rounded-md p-6">
                        <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                          Export Data
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <button
                            onClick={() => handleExportData('pdf')}
                            disabled={!selectedElectionForReport}
                            className="flex flex-col items-center gap-3 p-6 bg-background border border-border rounded-md hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-250 ease-smooth"
                          >
                            <div className="p-3 bg-error/20 text-error rounded-md">
                              <Icon name="DocumentIcon" size={24} variant="outline" />
                            </div>
                            <div className="text-center">
                              <p className="font-medium text-foreground">Export as PDF</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Certified report format
                              </p>
                            </div>
                          </button>

                          <button
                            onClick={() => handleExportData('csv')}
                            disabled={!selectedElectionForReport}
                            className="flex flex-col items-center gap-3 p-6 bg-background border border-border rounded-md hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-250 ease-smooth"
                          >
                            <div className="p-3 bg-success/20 text-success rounded-md">
                              <Icon name="TableCellsIcon" size={24} variant="outline" />
                            </div>
                            <div className="text-center">
                              <p className="font-medium text-foreground">Export as CSV</p>
                              <p className="text-xs text-muted-foreground mt-1">Raw data format</p>
                            </div>
                          </button>

                          <button
                            onClick={() => handleExportData('excel')}
                            disabled={!selectedElectionForReport}
                            className="flex flex-col items-center gap-3 p-6 bg-background border border-border rounded-md hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-250 ease-smooth"
                          >
                            <div className="p-3 bg-primary/20 text-primary rounded-md">
                              <Icon name="DocumentTextIcon" size={24} variant="outline" />
                            </div>
                            <div className="text-center">
                              <p className="font-medium text-foreground">Export as Excel</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Formatted spreadsheet
                              </p>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Recent Reports */}
                      <div className="bg-muted rounded-md p-6">
                        <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                          Recent Reports
                        </h3>
                        <div className="space-y-3">
                          {[
                            {
                              name: 'Student Council 2026 - Final Report',
                              type: 'Election Summary',
                              date: '2026-01-22',
                              size: '2.4 MB',
                              format: 'PDF',
                            },
                            {
                              name: 'Departmental Elections - Candidate Analysis',
                              type: 'Candidate Analysis',
                              date: '2026-01-15',
                              size: '1.8 MB',
                              format: 'Excel',
                            },
                            {
                              name: 'Q4 2025 - Voter Statistics',
                              type: 'Voter Statistics',
                              date: '2025-12-31',
                              size: '3.1 MB',
                              format: 'PDF',
                            },
                            {
                              name: 'Faculty Representatives - Financial Report',
                              type: 'Financial Report',
                              date: '2025-12-20',
                              size: '1.2 MB',
                              format: 'CSV',
                            },
                          ].map((report, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-4 bg-background rounded-md hover:shadow-sm transition-all duration-250 ease-smooth"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`p-2 rounded-md ${
                                    report.format === 'PDF'
                                      ? 'bg-error/20 text-error'
                                      : report.format === 'Excel'
                                        ? 'bg-success/20 text-success'
                                        : 'bg-primary/20 text-primary'
                                  }`}
                                >
                                  <Icon name="DocumentIcon" size={20} variant="outline" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-foreground">
                                    {report.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground font-caption mt-1">
                                    {report.type} • {report.date} • {report.size}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-muted rounded-md transition-all duration-250 ease-smooth">
                                  <Icon
                                    name="EyeIcon"
                                    size={16}
                                    variant="outline"
                                    className="text-muted-foreground"
                                  />
                                </button>
                                <button className="p-2 hover:bg-muted rounded-md transition-all duration-250 ease-smooth">
                                  <Icon
                                    name="ArrowDownTrayIcon"
                                    size={16}
                                    variant="outline"
                                    className="text-muted-foreground"
                                  />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Report Statistics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-card border border-border rounded-md p-6">
                          <div className="flex items-center justify-between mb-2">
                            <Icon
                              name="DocumentTextIcon"
                              size={24}
                              variant="outline"
                              className="text-primary"
                            />
                            <span className="text-2xl font-heading font-semibold text-foreground">
                              24
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">Total Reports Generated</p>
                        </div>

                        <div className="bg-card border border-border rounded-md p-6">
                          <div className="flex items-center justify-between mb-2">
                            <Icon
                              name="ArrowDownTrayIcon"
                              size={24}
                              variant="outline"
                              className="text-success"
                            />
                            <span className="text-2xl font-heading font-semibold text-foreground">
                              156
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">Downloads This Month</p>
                        </div>

                        <div className="bg-card border border-border rounded-md p-6">
                          <div className="flex items-center justify-between mb-2">
                            <Icon
                              name="ClockIcon"
                              size={24}
                              variant="outline"
                              className="text-warning"
                            />
                            <span className="text-2xl font-heading font-semibold text-foreground">
                              2h
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">Avg. Generation Time</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="hidden lg:block">
                <NotificationCenter
                  notifications={notifications}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllAsRead}
                  onClearAll={handleClearAllNotifications}
                />
              </div>

              <div className="bg-card border border-border rounded-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-semibold text-lg text-foreground">
                    System Alerts
                  </h3>
                  <Icon
                    name="ExclamationTriangleIcon"
                    size={20}
                    variant="outline"
                    className="text-warning"
                  />
                </div>
                <div className="space-y-3">
                  {systemAlerts.map((alert) => (
                    <SystemAlertCard key={alert.id} alert={alert} />
                  ))}
                </div>
              </div>

              <CommissionActivityLog activities={activityLogs} />
            </div>
          </div>
        </div>
      </main>

      {showNotifications && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[1200] lg:hidden">
          <div className="fixed top-24 right-4 left-4 max-w-md mx-auto">
            <NotificationCenter
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              onClearAll={handleClearAllNotifications}
            />
            <button
              onClick={() => setShowNotifications(false)}
              className="mt-4 w-full py-3 bg-card border border-border rounded-md text-foreground hover:bg-muted transition-all duration-250 ease-smooth"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectoralCommissionInteractive;
