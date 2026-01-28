'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';
import { useAdminProfile } from '@/hooks/useAdminProfile';
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

const ElectionAnalyticsInteractive = () => {
  const router = useRouter();
  const params = useParams();
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'turnout' | 'demographics' | 'trends'>(
    'overview'
  );
  const { userName, userAvatar, notificationCount, isLoading: profileLoading } = useAdminProfile();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Mock data
  const electionData = {
    name: 'Student Council 2026',
    status: 'active',
    totalVoters: 5420,
    votedCount: 4228,
    turnoutPercentage: 78.0,
  };

  const turnoutByDay = [
    { day: 'Day 1', votes: 1200, percentage: 22 },
    { day: 'Day 2', votes: 1800, percentage: 33 },
    { day: 'Day 3', votes: 1228, percentage: 23 },
  ];

  const departmentTurnout = [
    { name: 'Computer Science', votes: 1250, total: 1500, percentage: 83 },
    { name: 'Engineering', votes: 980, total: 1200, percentage: 82 },
    { name: 'Business Admin', votes: 1100, total: 1400, percentage: 79 },
    { name: 'Arts & Humanities', votes: 898, total: 1320, percentage: 68 },
  ];

  const levelDistribution = [
    { name: 'Level 100', value: 1050, color: '#F2B807' },
    { name: 'Level 200', value: 1180, color: '#F29F05' },
    { name: 'Level 300', value: 1020, color: '#D97904' },
    { name: 'Level 400', value: 978, color: '#A61103' },
  ];

  const hourlyVoting = [
    { hour: '8AM', votes: 120 },
    { hour: '9AM', votes: 280 },
    { hour: '10AM', votes: 450 },
    { hour: '11AM', votes: 520 },
    { hour: '12PM', votes: 380 },
    { hour: '1PM', votes: 320 },
    { hour: '2PM', votes: 480 },
    { hour: '3PM', votes: 550 },
    { hour: '4PM', votes: 620 },
    { hour: '5PM', votes: 508 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header
        userRole="admin"
        userName={userName}
        userAvatar={userAvatar}
        notificationCount={notificationCount}
        electionStatus={{ isActive: true, name: electionData.name, endTime: '2026-01-23T18:00:00' }}
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
                <span className="text-2xl font-heading font-semibold text-foreground">6h</span>
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
                    <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                      Voter Demographics
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-foreground mb-3">By Gender</h4>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-foreground">Male</span>
                              <span className="text-sm text-muted-foreground">2,380 (56%)</span>
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
                              <span className="text-sm text-muted-foreground">1,848 (44%)</span>
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
                              <span className="text-sm text-muted-foreground">3,382 (80%)</span>
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
                              <span className="text-sm text-muted-foreground">846 (20%)</span>
                            </div>
                            <div className="w-full bg-background rounded-full h-2">
                              <div className="bg-error h-2 rounded-full" style={{ width: '20%' }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'trends' && (
                <div className="space-y-6">
                  <div className="bg-muted rounded-md p-6">
                    <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                      Voting Trends & Insights
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          icon: 'ArrowTrendingUpIcon',
                          color: 'text-success',
                          title: 'Strong Morning Turnout',
                          description:
                            'Voting activity peaks between 9-11 AM, 15% higher than previous elections',
                        },
                        {
                          icon: 'UserGroupIcon',
                          color: 'text-primary',
                          title: 'High Youth Engagement',
                          description:
                            'Level 100 and 200 students showing 82% turnout, exceeding expectations',
                        },
                        {
                          icon: 'DevicePhoneMobileIcon',
                          color: 'text-warning',
                          title: 'Mobile Voting Dominance',
                          description:
                            '68% of votes cast via mobile devices, up from 52% last year',
                        },
                        {
                          icon: 'ClockIcon',
                          color: 'text-error',
                          title: 'Evening Rush Expected',
                          description:
                            'Historical data suggests 30% of remaining votes will come in final 2 hours',
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
