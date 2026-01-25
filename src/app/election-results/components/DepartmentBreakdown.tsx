'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface DepartmentData {
  name: string;
  totalVotes: number;
  eligibleVoters: number;
  turnout: number;
}

interface DepartmentBreakdownProps {
  departments: DepartmentData[];
}

const DepartmentBreakdown = ({ departments }: DepartmentBreakdownProps) => {
  const sortedDepartments = [...departments].sort((a, b) => b.turnout - a.turnout);

  return (
    <div className="bg-card border border-border rounded-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="BuildingOffice2Icon" size={24} variant="outline" className="text-primary" />
        <h3 className="text-lg font-heading font-semibold text-foreground">Department Breakdown</h3>
      </div>

      <div className="space-y-3">
        {sortedDepartments.map((dept, index) => (
          <div key={index} className="bg-muted rounded-md p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-foreground">{dept.name}</h4>
              <span className="text-sm font-data font-semibold text-primary">
                {dept.turnout.toFixed(1)}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <p className="text-xs text-muted-foreground font-caption">Votes Cast</p>
                <p className="text-sm font-data font-medium text-foreground">
                  {dept.totalVotes.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-caption">Eligible Voters</p>
                <p className="text-sm font-data font-medium text-foreground">
                  {dept.eligibleVoters.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="w-full bg-background rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 ease-smooth"
                style={{ width: `${dept.turnout}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DepartmentBreakdown;
