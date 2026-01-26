'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import ElectionStatusIndicator from '@/components/common/ElectionStatusIndicator';
import NotificationCenter from '@/components/common/NotificationCenter';
import CandidateApplicationCard from './CandidateApplicationCard';
import ElectionMonitoringCard from './ElectionMonitoringCard';
import SystemAlertCard from './SystemAlertCard';
import FeeStructureManager from './FeeStructureManager';
import QuickStatsGrid from './QuickStatsGrid';
import CommissionActivityLog from './CommissionActivityLog';
import Icon from '@/components/ui/AppIcon';

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

    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'approval',
        title: 'New Candidate Application',
        message: 'Kwame Mensah has submitted application for SRC President position',
        timestamp: '2026-01-22T18:30:00',
        isRead: false,
        actionUrl: '/electoral-commission-panel',
      },
      {
        id: '2',
        type: 'system',
        title: 'Election Deadline Approaching',
        message: 'Student Council 2026 voting ends in 6 hours',
        timestamp: '2026-01-22T17:00:00',
        isRead: false,
      },
      {
        id: '3',
        type: 'election',
        title: 'High Voter Turnout',
        message: 'Current turnout at 78% for ongoing election',
        timestamp: '2026-01-22T15:45:00',
        isRead: true,
      },
    ];

    const mockApplications: CandidateApplication[] = [
      {
        id: '1',
        candidateName: 'Kwame Mensah',
        studentId: 'UTAS2024001',
        email: 'kwame.mensah@cktutas.edu.gh',
        position: 'SRC President',
        department: 'Computer Science',
        avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
        submittedAt: '2026-01-22T14:30:00',
        documents: {
          idCard: true,
          transcript: true,
          manifesto: true,
        },
        eligibilityStatus: 'pending',
        paymentStatus: 'completed',
        applicationFee: 50.0,
      },
      {
        id: '2',
        candidateName: 'Ama Osei',
        studentId: 'UTAS2024002',
        email: 'ama.osei@cktutas.edu.gh',
        position: 'Vice President',
        department: 'Business Administration',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
        submittedAt: '2026-01-22T13:15:00',
        documents: {
          idCard: true,
          transcript: true,
          manifesto: false,
        },
        eligibilityStatus: 'pending',
        paymentStatus: 'completed',
        applicationFee: 40.0,
      },
      {
        id: '3',
        candidateName: 'Kofi Asante',
        studentId: 'UTAS2024003',
        email: 'kofi.asante@cktutas.edu.gh',
        position: 'General Secretary',
        department: 'Engineering',
        avatar: 'https://images.pixabay.com/photo/2016/11/21/12/42/beard-1845166_1280.jpg',
        submittedAt: '2026-01-22T11:45:00',
        documents: {
          idCard: true,
          transcript: true,
          manifesto: true,
        },
        eligibilityStatus: 'verified',
        paymentStatus: 'completed',
        applicationFee: 35.0,
      },
    ];

    const mockElections: ElectionData[] = [
      {
        id: '1',
        name: 'Student Council 2026',
        status: 'active',
        totalVoters: 5420,
        votedCount: 4228,
        startDate: '2026-01-20T08:00:00',
        endDate: '2026-01-23T18:00:00',
        positions: 8,
        candidates: 24,
        turnoutPercentage: 78.0,
      },
      {
        id: '2',
        name: 'Faculty Representatives',
        status: 'scheduled',
        totalVoters: 3200,
        votedCount: 0,
        startDate: '2026-02-01T08:00:00',
        endDate: '2026-02-05T18:00:00',
        positions: 12,
        candidates: 36,
        turnoutPercentage: 0,
      },
      {
        id: '3',
        name: 'Departmental Elections',
        status: 'completed',
        totalVoters: 2800,
        votedCount: 2156,
        startDate: '2026-01-10T08:00:00',
        endDate: '2026-01-15T18:00:00',
        positions: 15,
        candidates: 42,
        turnoutPercentage: 77.0,
      },
    ];

    const mockSystemAlerts: SystemAlert[] = [
      {
        id: '1',
        type: 'security',
        title: 'Multiple Login Attempts Detected',
        message:
          'Unusual login activity detected from IP 192.168.1.100 - 5 failed attempts in 2 minutes',
        timestamp: '2026-01-22T18:45:00',
        severity: 'high',
        isResolved: false,
      },
      {
        id: '2',
        type: 'system',
        title: 'Database Backup Completed',
        message: 'Scheduled database backup completed successfully at 02:00 AM',
        timestamp: '2026-01-22T02:00:00',
        severity: 'low',
        isResolved: true,
      },
      {
        id: '3',
        type: 'warning',
        title: 'High Server Load',
        message: 'Server CPU usage at 85% - consider scaling resources',
        timestamp: '2026-01-22T17:30:00',
        severity: 'medium',
        isResolved: false,
      },
    ];

    const mockFeeStructures: FeeStructure[] = [
      { id: '1', position: 'SRC President', amount: 50.0, lastUpdated: '2026-01-15T10:00:00' },
      { id: '2', position: 'Vice President', amount: 40.0, lastUpdated: '2026-01-15T10:00:00' },
      { id: '3', position: 'General Secretary', amount: 35.0, lastUpdated: '2026-01-15T10:00:00' },
      {
        id: '4',
        position: 'Financial Secretary',
        amount: 35.0,
        lastUpdated: '2026-01-15T10:00:00',
      },
      {
        id: '5',
        position: 'Organizing Secretary',
        amount: 30.0,
        lastUpdated: '2026-01-15T10:00:00',
      },
      {
        id: '6',
        position: "Women's Commissioner",
        amount: 30.0,
        lastUpdated: '2026-01-15T10:00:00',
      },
    ];

    const mockActivityLogs: ActivityLog[] = [
      {
        id: '1',
        commissionMember: 'Dr. Akosua Boateng',
        memberAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
        action: 'approved candidate application for',
        target: 'Kofi Asante - General Secretary',
        timestamp: '2026-01-22T16:30:00',
        actionType: 'approval',
      },
      {
        id: '2',
        commissionMember: 'Prof. Yaw Owusu',
        memberAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
        action: 'updated fee structure for',
        target: 'SRC President position',
        timestamp: '2026-01-22T14:15:00',
        actionType: 'update',
      },
      {
        id: '3',
        commissionMember: 'Mrs. Abena Adjei',
        memberAvatar: 'https://images.pixabay.com/photo/2017/08/01/08/29/woman-2563491_1280.jpg',
        action: 'created new election',
        target: 'Faculty Representatives 2026',
        timestamp: '2026-01-22T11:00:00',
        actionType: 'creation',
      },
      {
        id: '4',
        commissionMember: 'Dr. Akosua Boateng',
        memberAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
        action: 'rejected candidate application for',
        target: 'Emmanuel Darko - Treasurer',
        timestamp: '2026-01-22T09:45:00',
        actionType: 'rejection',
      },
    ];

    const mockQuickStats: QuickStat[] = [
      {
        label: 'Pending Applications',
        value: 12,
        icon: 'DocumentTextIcon',
        trend: { value: 8, isPositive: true },
        color: 'bg-warning/20 text-warning',
      },
      {
        label: 'Active Elections',
        value: 2,
        icon: 'CheckBadgeIcon',
        trend: { value: 0, isPositive: true },
        color: 'bg-success/20 text-success',
      },
      {
        label: 'Total Candidates',
        value: 68,
        icon: 'UserGroupIcon',
        trend: { value: 15, isPositive: true },
        color: 'bg-primary/20 text-primary',
      },
      {
        label: 'System Alerts',
        value: 3,
        icon: 'ExclamationTriangleIcon',
        trend: { value: 2, isPositive: false },
        color: 'bg-error/20 text-error',
      },
    ];

    setNotifications(mockNotifications);
    setApplications(mockApplications);
    setElections(mockElections);
    setSystemAlerts(mockSystemAlerts);
    setFeeStructures(mockFeeStructures);
    setActivityLogs(mockActivityLogs);
    setQuickStats(mockQuickStats);
  }, []);

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

  const handleUpdateFee = (id: string, newAmount: number) => {
    setFeeStructures((prev) =>
      prev.map((fee) =>
        fee.id === id ? { ...fee, amount: newAmount, lastUpdated: new Date().toISOString() } : fee
      )
    );
    console.log('Updated fee:', id, newAmount);
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
    alert(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report generated successfully!\n\nElection: ${election.name}\nTurnout: ${election.turnoutPercentage}%\nVotes Cast: ${election.votedCount}/${election.totalVoters}`);
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
                    <FeeStructureManager
                      feeStructures={feeStructures}
                      onUpdateFee={handleUpdateFee}
                    />
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
                                { value: 'election', label: 'Election Summary', icon: 'ChartBarIcon' },
                                { value: 'candidate', label: 'Candidate Analysis', icon: 'UserGroupIcon' },
                                { value: 'voter', label: 'Voter Statistics', icon: 'UsersIcon' },
                                { value: 'financial', label: 'Financial Report', icon: 'CurrencyDollarIcon' },
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
                                    className={reportType === type.value ? 'text-primary' : 'text-muted-foreground'}
                                  />
                                  <span className={`text-sm font-medium ${
                                    reportType === type.value ? 'text-primary' : 'text-foreground'
                                  }`}>
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
                              <p className="text-xs text-muted-foreground mt-1">
                                Raw data format
                              </p>
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
                                <div className={`p-2 rounded-md ${
                                  report.format === 'PDF' ? 'bg-error/20 text-error' :
                                  report.format === 'Excel' ? 'bg-success/20 text-success' :
                                  'bg-primary/20 text-primary'
                                }`}>
                                  <Icon
                                    name="DocumentIcon"
                                    size={20}
                                    variant="outline"
                                  />
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
                            <Icon name="DocumentTextIcon" size={24} variant="outline" className="text-primary" />
                            <span className="text-2xl font-heading font-semibold text-foreground">24</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Total Reports Generated</p>
                        </div>

                        <div className="bg-card border border-border rounded-md p-6">
                          <div className="flex items-center justify-between mb-2">
                            <Icon name="ArrowDownTrayIcon" size={24} variant="outline" className="text-success" />
                            <span className="text-2xl font-heading font-semibold text-foreground">156</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Downloads This Month</p>
                        </div>

                        <div className="bg-card border border-border rounded-md p-6">
                          <div className="flex items-center justify-between mb-2">
                            <Icon name="ClockIcon" size={24} variant="outline" className="text-warning" />
                            <span className="text-2xl font-heading font-semibold text-foreground">2h</span>
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
