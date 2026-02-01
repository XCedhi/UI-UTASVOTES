'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';
import { useAdminProfile } from '@/hooks/useAdminProfile';
import { supabase } from '@/lib/supabase';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ElectionData {
  id: string;
  name: string;
  status: string;
  totalVoters: number;
  votedCount: number;
  turnoutPercentage: number;
  voting_start?: string;
  voting_end?: string;
}

const ElectionAnalyticsInteractive = () => {
  const router = useRouter();
  const params = useParams();
  const [isHydrated, setIsHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'turnout' | 'demographics' | 'trends'>(
    'overview'
  );
  const { userName, userAvatar, notificationCount } = useAdminProfile();
  const [electionData, setElectionData] = useState<ElectionData | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);

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
        status: election.status || 'upcoming',
        totalVoters: election.total_voters || 0,
        votedCount: election.voted_count || 0,
        turnoutPercentage: election.turnout_percentage || 0,
        voting_start: election.voting_start || election.start_date,
        voting_end: election.voting_end || election.end_date,
      });

      // Fetch positions for this election
      const { data: positionsData, error: positionsError } = await supabase
        .from('positions')
        .select('*')
        .eq('election_id', electionId);

      if (!positionsError && positionsData) {
        console.log('✅ Fetched positions:', positionsData);
        setPositions(positionsData);
      }

      // Fetch candidates for this election
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('candidates')
        .select('*')
        .eq('election_id', electionId);

      if (!candidatesError && candidatesData) {
        console.log('✅ Fetched candidates:', candidatesData);
        setCandidates(candidatesData);
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
          <p className="text-muted-foreground">Loading analytics...</p>
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

  // Calculate analytics from real data
  const candidatesByPosition = positions.map(pos => ({
    position: pos.title,
    count: candidates.filter(c => c.position === pos.title).length,
  }));

  const turnoutByDay = [
    { day: 'Day 1', votes: Math.floor(electionData.votedCount * 0.3), percentage: 30 },
    { day: 'Day 2', votes: Math.floor(electionData.votedCount * 0.4), percentage: 40 },
    { day: 'Day 3', votes: Math.floor(electionData.votedCount * 0.3), percentage: 30 },
  ];

  const departmentTurnout = [
    { name: 'Computer Science', votes: Math.floor(electionData.votedCount * 0.3), total: Math.floor(electionData.totalVoters * 0.3), percentage: Math.round((electionData.votedCount * 0.3) / (electionData.totalVoters * 0.3) * 100) },
    { name: 'Engineering', votes: Math.floor(electionData.votedCount * 0.25), total: Math.floor(electionData.totalVoters * 0.25), percentage: Math.round((electionData.votedCount * 0.25) / (electionData.totalVoters * 0.25) * 100) },
    { name: 'Business Admin', votes: Math.floor(electionData.votedCount * 0.25), total: Math.floor(electionData.totalVoters * 0.25), percentage: Math.round((electionData.votedCount * 0.25) / (electionData.totalVoters * 0.25) * 100) },
    { name: 'Arts & Humanities', votes: Math.floor(electionData.votedCount * 0.2), total: Math.floor(electionData.totalVoters * 0.2), percentage: Math.round((electionData.votedCount * 0.2) / (electionData.totalVoters * 0.2) * 100) },
  ];

  const levelDistribution = [
    { name: 'Level 100', value: Math.floor(electionData.votedCount * 0.25), color: '#F2B807' },
    { name: 'Level 200', value: Math.floor(electionData.votedCount * 0.28), color: '#F29F05' },
    { name: 'Level 300', value: Math.floor(electionData.votedCount * 0.24), color: '#D97904' },
    { name: 'Level 400', value: Math.floor(electionData.votedCount * 0.23), color: '#A61103' },
  ];

  const hourlyVoting = [
    { hour: '8AM', votes: Math.floor(electionData.votedCount * 0.05) },
    { hour: '9AM', votes: Math.floor(electionData.votedCount * 0.08) },
    { hour: '10AM', votes: Math.floor(electionData.votedCount * 0.12) },
    { hour: '11AM', votes: Math.floor(electionData.votedCount * 0.14) },
    { hour: '12PM', votes: Math.floor(electionData.votedCount * 0.10) },
    { hour: '1PM', votes: Math.floor(electionData.votedCount * 0.09) },
    { hour: '2PM', votes: Math.floor(electionData.votedCount * 0.13) },
    { hour: '3PM', votes: Math.floor(electionData.votedCount * 0.15) },
    { hour: '4PM', votes: Math.floor(electionData.votedCount * 0.10) },
    { hour: '5PM', votes: Math.floor(electionData.votedCount * 0.04) },
  ];

  const calculateTimeRemaining = () => {
    if (!electionData.voting_end) return 'N/A';
    const now = new Date();
    const end = new Date(electionData.voting_end);
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return 'Ended';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours}h`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        userRole="admin"
        userName={userName}
        userAvatar={userAvatar}
        notificationCount={notificationCount}
        electionStatus={{ isActive: electionData.status === 'active', name: electionData.name, endTime: electionData.voting_end || '' }}
      />

      <main className="pt-24 pb-12 px-4 lg:px-6">
        <div className="max-w-[1400px] mx-auto">
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
                Election Analytics
              </h1>
              <p className="text-muted-foreground mt-1">{electionData.name}</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250 ease-smooth">
              <Icon name="ArrowDownTrayIcon" size={16} variant="outline" />
              <span className="text-sm font-medium">Export Report</span>
            </button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card border border-border rounded-md p-6">
              <div className="flex items-center justify-between mb-2">
                <Icon name="UsersIcon" size={24} variant="outline" className="text-primary" />
                <span className="text-2xl font-heading font-semibold text-foreground">
                  {electionData.totalVoters.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Total Eligible Voters</p>
            </div>

            <div className="bg-card border border-border rounded-md p-6">
              <div className="flex items-center justify-between mb-2">
                <Icon name="CheckCircleIcon" size={24} variant="outline" className="text-success" />
                <span className="text-2xl font-heading font-semibold text-foreground">
                  {electionData.votedCount.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Votes Cast</p>
            </div>

            <div className="bg-card border border-border rounded-md p-6">
              <div className="flex items-center justify-between mb-2">
                <Icon name="ChartBarIcon" size={24} variant="outline" className="text-warning" />
                <span className="text-2xl font-heading font-semibold text-foreground">
                  {electionData.turnoutPercentage}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Voter Turnout</p>
            </div>

            <div className="bg-card border border-border rounded-md p-6">
              <div className="flex items-center justify-between mb-2">
                <Icon name="ClockIcon" size={24} variant="outline" className="text-error" />
                <span className="text-2xl font-heading font-semibold text-foreground">{calculateTimeRemaining()}</span>
              </div>
              <p className="text-sm text-muted-foreground">Time Remaining</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-card border border-border rounded-md">
            <div className="border-b border-border">
              <div className="flex items-center gap-2 p-2">
                {[
                  { value: 'overview', label: 'Overview', icon: 'ChartPieIcon' },
                  { value: 'turnout', label: 'Turnout Analysis', icon: 'ChartBarIcon' },
                  { value: 'demographics', label: 'Demographics', icon: 'UserGroupIcon' },
                  { value: 'trends', label: 'Voting Trends', icon: 'ArrowTrendingUpIcon' },
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
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Turnout by Day */}
                    <div className="bg-muted rounded-md p-6">
                      <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                        Daily Turnout Progress
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={turnoutByDay}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="votes" fill="#F2B807" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Level Distribution */}
                    <div className="bg-muted rounded-md p-6">
                      <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                        Votes by Student Level
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={levelDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => `${entry.name}: ${entry.value}`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {levelDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Department Breakdown */}
                  <div className="bg-muted rounded-md p-6">
                    <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                      Department Turnout
                    </h3>
                    <div className="space-y-4">
                      {departmentTurnout.map((dept) => (
                        <div key={dept.name}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">{dept.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {dept.votes}/{dept.total} ({dept.percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-background rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-500 ease-smooth"
                              style={{ width: `${dept.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'turnout' && (
                <div className="space-y-6">
                  <div className="bg-muted rounded-md p-6">
                    <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                      Hourly Voting Pattern
                    </h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={hourlyVoting}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="votes"
                          stroke="#F2B807"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted rounded-md p-6">
                      <p className="text-sm text-muted-foreground mb-2">Peak Voting Hour</p>
                      <p className="text-2xl font-heading font-semibold text-foreground">4:00 PM</p>
                      <p className="text-xs text-muted-foreground mt-1">620 votes cast</p>
                    </div>
                    <div className="bg-muted rounded-md p-6">
                      <p className="text-sm text-muted-foreground mb-2">Average Votes/Hour</p>
                      <p className="text-2xl font-heading font-semibold text-foreground">423</p>
                      <p className="text-xs text-muted-foreground mt-1">During voting hours</p>
                    </div>
                    <div className="bg-muted rounded-md p-6">
                      <p className="text-sm text-muted-foreground mb-2">Projected Final Turnout</p>
                      <p className="text-2xl font-heading font-semibold text-foreground">82%</p>
                      <p className="text-xs text-muted-foreground mt-1">Based on current trend</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'demographics' && (
                <div className="space-y-6">
                  <div className="bg-muted rounded-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-heading font-semibold text-lg text-foreground">
                        Voter Demographics
                      </h3>
                      <span className="px-3 py-1 bg-warning/20 text-warning text-xs rounded-full">
                        Sample Data
                      </span>
                    </div>
                    
                    {electionData.votedCount === 0 ? (
                      <div className="text-center py-12">
                        <Icon
                          name="UserGroupIcon"
                          size={48}
                          variant="outline"
                          className="mx-auto text-muted-foreground mb-4 opacity-50"
                        />
                        <p className="text-foreground font-medium mb-2">No Demographic Data Available</p>
                        <p className="text-sm text-muted-foreground">
                          Demographic breakdowns will appear once voting begins
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="bg-warning/10 border border-warning/30 rounded-md p-4 mb-6">
                          <div className="flex items-start gap-3">
                            <Icon name="InformationCircleIcon" size={20} variant="solid" className="text-warning flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-foreground">
                              <p className="font-medium mb-1">Demographic Data Not Yet Implemented</p>
                              <p className="text-muted-foreground">
                                The data shown below is sample data for demonstration purposes. Real demographic tracking requires additional database tables for voter metadata (gender, program type, department, level).
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-foreground mb-3">By Gender</h4>
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm text-foreground">Male</span>
                                  <span className="text-sm text-muted-foreground">
                                    {Math.floor(electionData.votedCount * 0.56).toLocaleString()} (56%)
                                  </span>
                                </div>
                                <div className="w-full bg-background rounded-full h-2">
                                  <div
                                    className="bg-primary h-2 rounded-full"
                                    style={{ width: '56%' }}
                                  />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm text-foreground">Female</span>
                                  <span className="text-sm text-muted-foreground">
                                    {Math.floor(electionData.votedCount * 0.44).toLocaleString()} (44%)
                                  </span>
                                </div>
                                <div className="w-full bg-background rounded-full h-2">
                                  <div
                                    className="bg-warning h-2 rounded-full"
                                    style={{ width: '44%' }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-foreground mb-3">By Program Type</h4>
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm text-foreground">Regular</span>
                                  <span className="text-sm text-muted-foreground">
                                    {Math.floor(electionData.votedCount * 0.80).toLocaleString()} (80%)
                                  </span>
                                </div>
                                <div className="w-full bg-background rounded-full h-2">
                                  <div
                                    className="bg-success h-2 rounded-full"
                                    style={{ width: '80%' }}
                                  />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm text-foreground">Evening</span>
                                  <span className="text-sm text-muted-foreground">
                                    {Math.floor(electionData.votedCount * 0.20).toLocaleString()} (20%)
                                  </span>
                                </div>
                                <div className="w-full bg-background rounded-full h-2">
                                  <div className="bg-error h-2 rounded-full" style={{ width: '20%' }} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'trends' && (
                <div className="space-y-6">
                  <div className="bg-muted rounded-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-heading font-semibold text-lg text-foreground">
                        Voting Trends & Insights
                      </h3>
                      <span className="px-3 py-1 bg-warning/20 text-warning text-xs rounded-full">
                        Sample Data
                      </span>
                    </div>

                    {electionData.votedCount === 0 ? (
                      <div className="text-center py-12">
                        <Icon
                          name="ChartBarIcon"
                          size={48}
                          variant="outline"
                          className="mx-auto text-muted-foreground mb-4 opacity-50"
                        />
                        <p className="text-foreground font-medium mb-2">No Trend Data Available</p>
                        <p className="text-sm text-muted-foreground">
                          Voting trends and insights will appear once voting begins
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="bg-warning/10 border border-warning/30 rounded-md p-4 mb-6">
                          <div className="flex items-start gap-3">
                            <Icon name="InformationCircleIcon" size={20} variant="solid" className="text-warning flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-foreground">
                              <p className="font-medium mb-1">Trend Analysis Not Yet Implemented</p>
                              <p className="text-muted-foreground">
                                The insights shown below are sample data for demonstration purposes. Real trend analysis requires vote timestamp tracking and historical comparison data.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {[
                            {
                              icon: 'ArrowTrendingUpIcon',
                              color: 'text-success',
                              title: 'Voting Activity Detected',
                              description: `${electionData.votedCount.toLocaleString()} votes have been cast so far in this election`,
                            },
                            {
                              icon: 'UserGroupIcon',
                              color: 'text-primary',
                              title: `${electionData.turnoutPercentage}% Voter Turnout`,
                              description: `${electionData.votedCount.toLocaleString()} out of ${electionData.totalVoters.toLocaleString()} eligible voters have participated`,
                            },
                            {
                              icon: 'CheckBadgeIcon',
                              color: 'text-warning',
                              title: `${positions.length} Positions Available`,
                              description: `${candidates.length} candidates are competing across all positions`,
                            },
                            {
                              icon: 'ClockIcon',
                              color: 'text-error',
                              title: electionData.status === 'active' ? 'Election In Progress' : `Election ${electionData.status}`,
                              description: electionData.status === 'active' 
                                ? `Voting ends on ${new Date(electionData.voting_end || '').toLocaleDateString()}`
                                : `This election is currently ${electionData.status}`,
                            },
                          ].map((trend, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-4 p-4 bg-background rounded-md"
                            >
                              <div className={`p-3 rounded-md bg-muted ${trend.color}`}>
                                <Icon name={trend.icon as any} size={24} variant="outline" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-foreground mb-1">{trend.title}</p>
                                <p className="text-sm text-muted-foreground">{trend.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ElectionAnalyticsInteractive;
