'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/common/Header';
import ResultsHeader from './ResultsHeader';
import PositionResults from './PositionResults';
import ResultsChart from './ResultsChart';
import DepartmentBreakdown from './DepartmentBreakdown';
import ElectionTimeline from './ElectionTimeline';
import ExportActions from './ExportActions';
import VoterStatistics from './VoterStatistics';

interface Candidate {
  rank: number;
  name: string;
  position: string;
  department: string;
  votes: number;
  percentage: number;
  image: string;
  alt: string;
  isWinner: boolean;
}

interface Position {
  id: string;
  title: string;
  category: string;
  totalVotes: number;
  candidates: Candidate[];
}

interface DepartmentData {
  name: string;
  totalVotes: number;
  eligibleVoters: number;
  turnout: number;
}

interface TimelineEvent {
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface StatisticItem {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const ResultsInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const mockPositions: Position[] = [
    {
      id: 'pres-2026',
      title: 'Student Union President',
      category: 'University-Wide',
      totalVotes: 4850,
      candidates: [
        {
          rank: 1,
          name: 'Kwame Mensah',
          position: 'Student Union President',
          department: 'Computer Science',
          votes: 2145,
          percentage: 44.23,
          image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
          alt: 'Young African man in blue blazer smiling confidently at camera in modern office setting',
          isWinner: true,
        },
        {
          rank: 2,
          name: 'Ama Osei',
          position: 'Student Union President',
          department: 'Business Administration',
          votes: 1876,
          percentage: 38.68,
          image: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
          alt: 'Professional African woman in white blazer with natural hair smiling warmly in office environment',
          isWinner: false,
        },
        {
          rank: 3,
          name: 'Kofi Asante',
          position: 'Student Union President',
          department: 'Engineering',
          votes: 829,
          percentage: 17.09,
          image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
          alt: 'Young African man in casual shirt with glasses looking thoughtful in library setting',
          isWinner: false,
        },
      ],
    },
    {
      id: 'vp-2026',
      title: 'Vice President',
      category: 'University-Wide',
      totalVotes: 4720,
      candidates: [
        {
          rank: 1,
          name: 'Abena Boateng',
          position: 'Vice President',
          department: 'Law',
          votes: 2234,
          percentage: 47.33,
          image: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg',
          alt: 'Confident African woman in professional attire with braided hair in modern office',
          isWinner: true,
        },
        {
          rank: 2,
          name: 'Yaw Owusu',
          position: 'Vice President',
          department: 'Medicine',
          votes: 1654,
          percentage: 35.04,
          image: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg',
          alt: 'Young African man in white medical coat with stethoscope in hospital corridor',
          isWinner: false,
        },
        {
          rank: 3,
          name: 'Efua Adjei',
          position: 'Vice President',
          department: 'Arts',
          votes: 832,
          percentage: 17.63,
          image: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg',
          alt: 'Creative African woman with colorful headwrap smiling in art studio with paintings',
          isWinner: false,
        },
      ],
    },
    {
      id: 'sec-cs-2026',
      title: 'Secretary',
      category: 'Computer Science Department',
      totalVotes: 856,
      candidates: [
        {
          rank: 1,
          name: 'Akosua Frimpong',
          position: 'Secretary',
          department: 'Computer Science',
          votes: 478,
          percentage: 55.84,
          image: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg',
          alt: 'Young African woman in business casual attire working on laptop in modern workspace',
          isWinner: true,
        },
        {
          rank: 2,
          name: 'Kwabena Darko',
          position: 'Secretary',
          department: 'Computer Science',
          votes: 378,
          percentage: 44.16,
          image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg',
          alt: 'African man in casual tech startup attire with laptop in collaborative workspace',
          isWinner: false,
        },
      ],
    },
  ];

  const mockDepartments: DepartmentData[] = [
    {
      name: 'Computer Science',
      totalVotes: 1245,
      eligibleVoters: 1450,
      turnout: 85.86,
    },
    {
      name: 'Business Administration',
      totalVotes: 987,
      eligibleVoters: 1200,
      turnout: 82.25,
    },
    {
      name: 'Engineering',
      totalVotes: 856,
      eligibleVoters: 1100,
      turnout: 77.82,
    },
    {
      name: 'Medicine',
      totalVotes: 734,
      eligibleVoters: 950,
      turnout: 77.26,
    },
    {
      name: 'Law',
      totalVotes: 623,
      eligibleVoters: 850,
      turnout: 73.29,
    },
    {
      name: 'Arts',
      totalVotes: 405,
      eligibleVoters: 600,
      turnout: 67.5,
    },
  ];

  const mockTimeline: TimelineEvent[] = [
    {
      title: 'Nomination Period Opened',
      description: 'Candidate registration and application submission began',
      timestamp: '15/12/2025',
      icon: 'DocumentTextIcon',
      status: 'completed',
    },
    {
      title: 'Candidate Verification',
      description: 'Electoral Commission reviewed and approved candidate applications',
      timestamp: '28/12/2025',
      icon: 'ShieldCheckIcon',
      status: 'completed',
    },
    {
      title: 'Campaign Period',
      description: 'Candidates conducted campaigns and shared manifestos',
      timestamp: '05/01/2026',
      icon: 'MegaphoneIcon',
      status: 'completed',
    },
    {
      title: 'Voting Day',
      description: 'Students cast their votes through the digital platform',
      timestamp: '20/01/2026',
      icon: 'CheckBadgeIcon',
      status: 'completed',
    },
    {
      title: 'Results Announced',
      description: 'Official election results published and certified',
      timestamp: '22/01/2026',
      icon: 'TrophyIcon',
      status: 'current',
    },
  ];

  const mockStatistics: StatisticItem[] = [
    {
      label: 'Average Turnout',
      value: '77.33%',
      icon: 'ChartBarIcon',
      color: 'bg-primary',
      trend: {
        value: 5.2,
        isPositive: true,
      },
    },
    {
      label: 'Peak Voting Hour',
      value: '2:00 PM',
      icon: 'ClockIcon',
      color: 'bg-accent',
    },
    {
      label: 'Mobile Votes',
      value: '68%',
      icon: 'DevicePhoneMobileIcon',
      color: 'bg-success',
      trend: {
        value: 12.5,
        isPositive: true,
      },
    },
    {
      label: 'Desktop Votes',
      value: '32%',
      icon: 'ComputerDesktopIcon',
      color: 'bg-secondary',
    },
  ];

  const chartData = mockPositions[0].candidates.map((candidate) => ({
    name: candidate.name.split(' ')[0],
    votes: candidate.votes,
    percentage: candidate.percentage,
  }));

  const handleGenerateCertificate = () => {
    if (!isHydrated) return;
    console.log('Generating certified results...');
    alert('Certified results generated successfully! PDF will be downloaded shortly.');
  };

  const handleExportExcel = () => {
    if (!isHydrated) return;
    console.log('Exporting to Excel...');
    alert('Excel file exported successfully!');
  };

  const handleExportPDF = () => {
    if (!isHydrated) return;
    console.log('Exporting to PDF...');
    alert('PDF file exported successfully!');
  };

  const handleEmailResults = () => {
    if (!isHydrated) return;
    console.log('Emailing results...');
    alert('Results have been emailed to all stakeholders successfully!');
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-20 bg-card border-b border-border" />
        <div className="animate-pulse p-6">
          <div className="h-32 bg-muted rounded-md mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-96 bg-muted rounded-md" />
              <div className="h-64 bg-muted rounded-md" />
            </div>
            <div className="space-y-6">
              <div className="h-64 bg-muted rounded-md" />
              <div className="h-64 bg-muted rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        userRole="student"
        userName="Kwame Mensah"
        userAvatar="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg"
        notificationCount={3}
        electionStatus={{
          isActive: false,
          name: 'Student Council 2026',
          endTime: '2026-01-20T23:59:59',
        }}
      />

      <main className="pt-24 pb-12 px-4 lg:px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <ResultsHeader
            electionName="Student Council Elections 2026"
            electionDate="20th January 2026"
            totalVotes={4850}
            totalEligibleVoters={6150}
            status="completed"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <PositionResults positions={mockPositions} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResultsChart
                  data={chartData}
                  chartType="bar"
                  title="Vote Distribution - President"
                />
                <ResultsChart data={chartData} chartType="pie" title="Vote Share - President" />
              </div>

              <DepartmentBreakdown departments={mockDepartments} />
            </div>

            <div className="space-y-6">
              <ExportActions
                electionName="Student Council Elections 2026"
                onGenerateCertificate={handleGenerateCertificate}
                onExportExcel={handleExportExcel}
                onExportPDF={handleExportPDF}
                onEmailResults={handleEmailResults}
              />

              <VoterStatistics statistics={mockStatistics} />

              <ElectionTimeline events={mockTimeline} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResultsInteractive;
