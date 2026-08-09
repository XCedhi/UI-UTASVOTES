'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import ElectionStatusIndicator from '@/components/common/ElectionStatusIndicator';
import NotificationCenter from '@/components/common/NotificationCenter';
import CandidateApplicationCard from '@/app/electoral-commission-panel/components/CandidateApplicationCard';
import ElectionMonitoringCard from '@/app/electoral-commission-panel/components/ElectionMonitoringCard';
import SystemAlertCard from '@/app/electoral-commission-panel/components/SystemAlertCard';
import DatabaseFeeManager from './DatabaseFeeManager';
import QuickStatsGrid from '@/app/electoral-commission-panel/components/QuickStatsGrid';
import CommissionActivityLog from '@/app/electoral-commission-panel/components/CommissionActivityLog';
import Icon from '@/components/ui/AppIcon';
import { supabase } from '@/lib/supabase';
import { useAdminProfile } from '@/hooks/useAdminProfile';

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

const ElectionManagementInteractive = () => {
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
  const [recentReports, setRecentReports] = useState<Array<{
    id: string;
    name: string;
    type: string;
    date: string;
    size: string;
    downloadUrl?: string;
  }>>([]);
  const { userName, userAvatar, notificationCount, isLoading: profileLoading } = useAdminProfile();

  useEffect(() => {
    setIsHydrated(true);
    fetchElectionManagementData();
  }, []);

  const fetchElectionManagementData = async () => {
    try {
      // Fetch notifications
      const { data: notificationsData } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (notificationsData) {
        setNotifications(notificationsData.map((n: any) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          timestamp: n.created_at,
          isRead: n.is_read,
          actionUrl: n.action_url,
        })));
      }

      // Fetch candidate applications (pending ones first)
      const { data: candidatesData } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false });

      if (candidatesData) {
        setApplications(candidatesData.map((c: any) => ({
          id: c.id,
          candidateName: c.name || c.full_name || 'Unknown',
          studentId: c.student_id || 'N/A',
          email: c.email || 'N/A',
          position: c.position || 'N/A',
          department: c.department || 'N/A',
          avatar: c.avatar || c.photo_url || 'https://via.placeholder.com/150',
          submittedAt: c.submitted_at || c.created_at,
          documents: {
            idCard: !!(c.student_id_doc_url || c.student_id_document_url),
            transcript: !!c.transcript_url,
            manifesto: !!(c.manifesto || c.manifesto_url || c.manifesto_doc_url),
          },
          eligibilityStatus: c.status === 'pending' ? 'pending' : c.status === 'approved' ? 'verified' : 'rejected',
          paymentStatus: c.transaction_id ? 'completed' : 'pending',
          applicationFee: c.application_fee || 0,
        })));
      }

      // Fetch elections and auto-update their status
      const { data: electionsData } = await supabase
        .from('elections')
        .select('*')
        .order('created_at', { ascending: false });

      if (electionsData) {
        const now = new Date();
        
        // Update status for each election based on dates
        const updatedElections = await Promise.all(
          electionsData.map(async (e: any) => {
            const votingStart = new Date(e.voting_start || e.start_date);
            const votingEnd = new Date(e.voting_end || e.end_date);
            
            let correctStatus = e.status;
            
            // Determine correct status based on dates
            if (now < votingStart) {
              correctStatus = 'upcoming';
            } else if (now >= votingStart && now <= votingEnd) {
              correctStatus = 'active';
            } else if (now > votingEnd) {
              correctStatus = 'completed';
            }
            
            // Update in database if status is different
            if (correctStatus !== e.status) {
              console.log(`📅 Auto-updating election "${e.name}" status from "${e.status}" to "${correctStatus}"`);
              await supabase
                .from('elections')
                .update({ status: correctStatus, updated_at: new Date().toISOString() })
                .eq('id', e.id);
              
              return { ...e, status: correctStatus };
            }
            
            return e;
          })
        );

        // Fetch positions and candidates counts for each election
        const electionsWithCounts = await Promise.all(
          updatedElections.map(async (e: any) => {
            // Count positions for this election
            const { count: positionsCount } = await supabase
              .from('positions')
              .select('*', { count: 'exact', head: true })
              .eq('election_id', e.id);

            // Count candidates for this election
            const { count: candidatesCount } = await supabase
              .from('candidates')
              .select('*', { count: 'exact', head: true })
              .eq('election_id', e.id);

            // Count total voters (all students)
            const { count: totalVotersCount } = await supabase
              .from('user_profiles')
              .select('*', { count: 'exact', head: true })
              .eq('role', 'student');

            // Count votes cast for this election
            const { count: votedCount } = await supabase
              .from('votes')
              .select('*', { count: 'exact', head: true })
              .eq('election_id', e.id);

            const uniqueVoters = votedCount || 0;
            const totalVoters = totalVotersCount || 0;
            const turnout = totalVoters > 0 ? ((uniqueVoters / totalVoters) * 100).toFixed(1) : 0;

            return {
              id: e.id,
              name: e.name || e.title,
              status: e.status,
              totalVoters: totalVoters,
              votedCount: uniqueVoters,
              startDate: e.voting_start || e.start_date,
              endDate: e.voting_end || e.end_date,
              positions: positionsCount || 0,
              candidates: candidatesCount || 0,
              turnoutPercentage: parseFloat(turnout.toString()),
            };
          })
        );

        setElections(electionsWithCounts);
      }

      // Fetch system alerts
      const { data: alertsData } = await supabase
        .from('system_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (alertsData) {
        setSystemAlerts(alertsData.map((a: any) => ({
          id: a.id,
          type: a.type,
          title: a.title,
          message: a.message,
          timestamp: a.created_at,
          severity: a.severity,
          isResolved: a.is_resolved,
        })));
      }

      // Fetch fee structures
      const { data: feesData } = await supabase
        .from('fee_structures')
        .select('*')
        .order('position');

      if (feesData) {
        setFeeStructures(feesData.map((f: any) => ({
          id: f.id,
          position: f.position,
          amount: f.amount,
          lastUpdated: f.updated_at,
        })));
      }

      // Fetch activity logs
      const { data: logsData } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (logsData) {
        setActivityLogs(logsData.map((l: any) => ({
          id: l.id,
          commissionMember: l.user_name,
          memberAvatar: l.user_avatar || 'https://via.placeholder.com/150',
          action: l.action,
          target: l.target || '',
          timestamp: l.created_at,
          actionType: l.action_type,
        })));
      }

      // Calculate quick stats
      const { count: totalApplications } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true });

      const { count: pendingApplications } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: activeElections } = await supabase
        .from('elections')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: totalCandidates } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      const { count: unreadAlerts } = await supabase
        .from('system_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('is_resolved', false);

      setQuickStats([
        {
          label: 'Pending Applications',
          value: pendingApplications || 0,
          icon: 'DocumentTextIcon',
          color: 'bg-warning/20 text-warning',
        },
        {
          label: 'Active Elections',
          value: activeElections || 0,
          icon: 'CheckBadgeIcon',
          color: 'bg-success/20 text-success',
        },
        {
          label: 'Total Candidates',
          value: totalCandidates || 0,
          icon: 'UserGroupIcon',
          color: 'bg-primary/20 text-primary',
        },
        {
          label: 'System Alerts',
          value: unreadAlerts || 0,
          icon: 'ExclamationTriangleIcon',
          color: 'bg-error/20 text-error',
        },
      ]);

      // Load recent reports
      loadRecentReports();
    } catch (error) {
      console.error('Error fetching election management data:', error);
    }
  };

  const loadRecentReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('generated_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        setRecentReports(
          data.map((report: any) => ({
            id: report.id,
            name: report.name,
            type: report.type,
            date: new Date(report.generated_at).toLocaleDateString(),
            size: '2.4 MB', // You can calculate actual size if stored
          }))
        );
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const handleDownloadReport = async (reportId: string) => {
    try {
      // Fetch report details
      const { data: reportData, error } = await supabase
        .from('reports')
        .select('*, elections(*)')
        .eq('id', reportId)
        .single();

      if (error || !reportData) {
        alert('Report not found.');
        return;
      }

      // Fetch election and candidate data
      const { data: candidatesData } = await supabase
        .from('candidates')
        .select('*')
        .eq('election_id', reportData.election_id);

      const election = reportData.elections;

      // Prepare report data
      const reportDataToExport = {
        electionName: election?.name || 'Election Report',
        startDate: election?.start_date || new Date().toISOString(),
        endDate: election?.end_date || new Date().toISOString(),
        totalVoters: election?.total_voters || 0,
        votedCount: election?.voted_count || 0,
        turnoutPercentage: election?.turnout_percentage || 0,
        positions: [],
        candidates: (candidatesData || []).map((c: any) => ({
          name: c.full_name || c.candidate_name || 'Unknown',
          position: c.position || 'Unknown Position',
          votes: c.votes || 0,
          percentage: c.vote_percentage || 0,
        })),
      };

      // Generate and download report
      const { generateElectionReport } = await import('@/lib/excel-utils');
      generateElectionReport(reportDataToExport);
      
      alert('Report downloaded successfully!');
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report. Please try again.');
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Admin Election Management...</p>
        </div>
      </div>
    );
  }

  const handleApproveApplication = async (id: string) => {
    try {
      // Update application status in database
      const { error } = await supabase
        .from('candidates')
        .update({
          eligibilityStatus: 'verified',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error('Error approving application:', error);
        alert('Failed to approve application. Please try again.');
        return;
      }

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, eligibilityStatus: 'verified' as const } : app
        )
      );

      alert('Application approved successfully!');
    } catch (error) {
      console.error('Error approving application:', error);
      alert('Failed to approve application. Please try again.');
    }
  };

  const handleRejectApplication = async (id: string) => {
    try {
      // Update application status in database
      const { error } = await supabase
        .from('candidates')
        .update({
          eligibilityStatus: 'rejected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error('Error rejecting application:', error);
        alert('Failed to reject application. Please try again.');
        return;
      }

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, eligibilityStatus: 'rejected' as const } : app
        )
      );

      alert('Application rejected successfully!');
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Failed to reject application. Please try again.');
    }
  };

  const handleViewApplicationDetails = (id: string) => {
    router.push(`/admin-system-control/election/applications/${id}`);
  };

  const handleViewElectionAnalytics = (id: string) => {
    router.push(`/admin-system-control/election/elections/${id}/analytics`);
  };

  const handleManageElection = (id: string) => {
    router.push(`/admin-system-control/election/elections/${id}/manage`);
  };

  const handleDeleteElection = async (id: string) => {
    try {
      // Delete related positions first
      const { error: positionsError } = await supabase
        .from('positions')
        .delete()
        .eq('election_id', id);

      if (positionsError) {
        console.error('Error deleting positions:', positionsError);
      }

      // Delete related candidates
      const { error: candidatesError } = await supabase
        .from('candidates')
        .delete()
        .eq('election_id', id);

      if (candidatesError) {
        console.error('Error deleting candidates:', candidatesError);
      }

      // Delete the election
      const { error: electionError } = await supabase
        .from('elections')
        .delete()
        .eq('id', id);

      if (electionError) {
        console.error('Error deleting election:', electionError);
        alert('Failed to delete election. Please try again.');
        return;
      }

      console.log('✅ Election deleted successfully');
      alert('Election deleted successfully!');
      
      // Refresh the elections list
      await fetchElectionManagementData();
    } catch (error) {
      console.error('Error deleting election:', error);
      alert('Failed to delete election. Please try again.');
    }
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

  const handleGenerateReport = async () => {
    try {
      // Fetch election data from database
      const { data: electionsData, error: electionsError } = await supabase
        .from('elections')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (electionsError) {
        console.error('Error fetching election data:', electionsError);
        alert('No election data available to generate report.');
        return;
      }

      // Fetch candidates and votes
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('candidates')
        .select('*')
        .eq('election_id', electionsData.id);

      if (candidatesError) {
        console.error('Error fetching candidates:', candidatesError);
      }

      // Prepare report data
      const reportData = {
        electionName: electionsData.name || 'Election Report',
        startDate: electionsData.start_date || new Date().toISOString(),
        endDate: electionsData.end_date || new Date().toISOString(),
        totalVoters: electionsData.total_voters || 0,
        votedCount: electionsData.voted_count || 0,
        turnoutPercentage: electionsData.turnout_percentage || 0,
        positions: [],
        candidates: (candidatesData || []).map((c: any) => ({
          name: c.full_name || c.candidate_name || 'Unknown',
          position: c.position || 'Unknown Position',
          votes: c.votes || 0,
          percentage: c.vote_percentage || 0,
        })),
      };

      // Generate report using excel-utils
      const { generateElectionReport } = await import('@/lib/excel-utils');
      generateElectionReport(reportData);

      // Save report record to database
      const reportRecord = {
        name: `${reportData.electionName} - Comprehensive Report`,
        type: 'comprehensive',
        generated_at: new Date().toISOString(),
        generated_by: 'admin',
        election_id: electionsData.id,
      };

      const { data: savedReport, error: saveError } = await supabase
        .from('reports')
        .insert(reportRecord)
        .select()
        .single();

      if (!saveError && savedReport) {
        // Add to recent reports
        setRecentReports((prev) => [
          {
            id: savedReport.id,
            name: savedReport.name,
            type: savedReport.type,
            date: new Date(savedReport.generated_at).toLocaleDateString(),
            size: '2.4 MB',
          },
          ...prev.slice(0, 4),
        ]);
      }

      alert('Report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    }
  };

  const handleExportData = async () => {
    try {
      // Show export options
      const exportType = prompt(
        'Select export type:\n1. Election Results (CSV)\n2. Voter Statistics (CSV)\n3. Candidate Applications (CSV)\n\nEnter 1, 2, or 3:'
      );

      if (!exportType) return;

      const { exportElectionDataCSV, exportVoterStatistics, exportCandidateApplications } =
        await import('@/lib/excel-utils');

      switch (exportType) {
        case '1': {
          // Export election results
          const { data: electionsData, error } = await supabase
            .from('elections')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (error || !electionsData) {
            alert('No election data available.');
            return;
          }

          const { data: candidatesData } = await supabase
            .from('candidates')
            .select('*')
            .eq('election_id', electionsData.id);

          const reportData = {
            electionName: electionsData.name || 'Election',
            startDate: electionsData.start_date || new Date().toISOString(),
            endDate: electionsData.end_date || new Date().toISOString(),
            totalVoters: electionsData.total_voters || 0,
            votedCount: electionsData.voted_count || 0,
            turnoutPercentage: electionsData.turnout_percentage || 0,
            positions: [],
            candidates: (candidatesData || []).map((c: any) => ({
              name: c.full_name || c.candidate_name || 'Unknown',
              position: c.position || 'Unknown',
              votes: c.votes || 0,
              percentage: c.vote_percentage || 0,
            })),
          };

          exportElectionDataCSV(reportData);
          alert('Election results exported successfully!');
          break;
        }

        case '2': {
          // Export voter statistics
          const { data: electionsData, error } = await supabase
            .from('elections')
            .select('*')
            .order('created_at', { ascending: false });

          if (error || !electionsData) {
            alert('No election data available.');
            return;
          }

          const stats = electionsData.map((e: any) => ({
            name: e.name || 'Unknown Election',
            totalVoters: e.total_voters || 0,
            votedCount: e.voted_count || 0,
            turnoutPercentage: e.turnout_percentage || 0,
            startDate: e.start_date || new Date().toISOString(),
            endDate: e.end_date || new Date().toISOString(),
          }));

          exportVoterStatistics(stats);
          alert('Voter statistics exported successfully!');
          break;
        }

        case '3': {
          // Export candidate applications
          const { data: applicationsData, error } = await supabase
            .from('candidates')
            .select('*')
            .order('created_at', { ascending: false });

          if (error || !applicationsData) {
            alert('No application data available.');
            return;
          }

          const apps = applicationsData.map((a: any) => ({
            candidateName: a.full_name || a.candidate_name || 'Unknown',
            studentId: a.student_id || 'N/A',
            email: a.email || 'N/A',
            position: a.position || 'Unknown',
            department: a.department || 'Unknown',
            eligibilityStatus: a.eligibility_status || 'pending',
            paymentStatus: a.payment_status || 'pending',
            submittedAt: a.created_at || new Date().toISOString(),
          }));

          exportCandidateApplications(apps);
          alert('Candidate applications exported successfully!');
          break;
        }

        default:
          alert('Invalid selection. Please enter 1, 2, or 3.');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const activeElection = elections.find((e) => e.status === 'active');
  const unreadNotificationCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-background">
      <Header
        userRole="admin"
        userName={userName}
        userAvatar={userAvatar}
        notificationCount={notificationCount}
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
                Admin Election Management
              </h1>
              <p className="text-muted-foreground">
                Full administrative control over elections, candidates, and electoral processes
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
                          onClick={() => router.push('/admin-system-control/election/new')}
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
                          onDeleteElection={handleDeleteElection}
                        />
                      ))}
                    </div>
                  )}

                  {activeTab === 'fees' && (
                    <DatabaseFeeManager />
                  )}

                  {activeTab === 'reports' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="font-heading font-semibold text-xl text-foreground">
                          Election Reports
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          onClick={handleGenerateReport}
                          className="flex items-center gap-3 p-6 bg-card border border-border rounded-md hover:shadow-md transition-all duration-250 ease-smooth"
                        >
                          <div className="p-3 bg-primary/20 text-primary rounded-md">
                            <Icon name="DocumentChartBarIcon" size={24} variant="outline" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-foreground">Generate Report</p>
                            <p className="text-sm text-muted-foreground">
                              Create comprehensive election report
                            </p>
                          </div>
                          <Icon
                            name="ChevronRightIcon"
                            size={20}
                            variant="outline"
                            className="text-muted-foreground"
                          />
                        </button>

                        <button
                          onClick={handleExportData}
                          className="flex items-center gap-3 p-6 bg-card border border-border rounded-md hover:shadow-md transition-all duration-250 ease-smooth"
                        >
                          <div className="p-3 bg-success/20 text-success rounded-md">
                            <Icon name="ArrowDownTrayIcon" size={24} variant="outline" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-foreground">Export Data</p>
                            <p className="text-sm text-muted-foreground">
                              Download election data as Excel
                            </p>
                          </div>
                          <Icon
                            name="ChevronRightIcon"
                            size={20}
                            variant="outline"
                            className="text-muted-foreground"
                          />
                        </button>
                      </div>

                      <div className="bg-muted rounded-md p-6">
                        <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                          Recent Reports
                        </h3>
                        {recentReports.length > 0 ? (
                          <div className="space-y-3">
                            {recentReports.map((report) => (
                              <div
                                key={report.id}
                                className="flex items-center justify-between p-3 bg-background rounded-md"
                              >
                                <div className="flex items-center gap-3">
                                  <Icon
                                    name="DocumentIcon"
                                    size={20}
                                    variant="outline"
                                    className="text-primary"
                                  />
                                  <div>
                                    <p className="text-sm font-medium text-foreground">
                                      {report.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground font-caption">
                                      {report.date} • {report.size}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDownloadReport(report.id)}
                                  className="p-2 hover:bg-muted rounded-md transition-all duration-250 ease-smooth"
                                  aria-label="Download report"
                                >
                                  <Icon
                                    name="ArrowDownTrayIcon"
                                    size={16}
                                    variant="outline"
                                    className="text-muted-foreground"
                                  />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Icon
                              name="DocumentIcon"
                              size={48}
                              variant="outline"
                              className="mx-auto text-muted-foreground mb-3 opacity-50"
                            />
                            <p className="text-muted-foreground text-sm">
                              No reports generated yet
                            </p>
                            <p className="text-muted-foreground text-xs mt-1">
                              Generate your first report to see it here
                            </p>
                          </div>
                        )}
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

export default ElectionManagementInteractive;
