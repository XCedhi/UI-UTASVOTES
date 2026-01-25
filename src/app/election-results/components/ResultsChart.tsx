'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface ChartData {
  name: string;
  votes: number;
  percentage: number;
}

interface ResultsChartProps {
  data: ChartData[];
  chartType: 'bar' | 'pie';
  title: string;
}

const COLORS = [
  '#1E3A8A',
  '#F59E0B',
  '#059669',
  '#DC2626',
  '#3B82F6',
  '#FBBF24',
  '#10B981',
  '#EF4444',
];

const ResultsChart = ({ data, chartType, title }: ResultsChartProps) => {
  return (
    <div className="bg-card border border-border rounded-md p-6">
      <h3 className="text-lg font-heading font-semibold text-foreground mb-4">{title}</h3>
      <div className="w-full h-80" aria-label={`${title} Chart`}>
        {chartType === 'bar' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(15, 23, 42, 0.1)" />
              <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 12 }} />
              <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(15, 23, 42, 0.12)',
                  borderRadius: '6px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
              <Bar dataKey="votes" fill="#1E3A8A" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="votes"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(15, 23, 42, 0.12)',
                  borderRadius: '6px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ResultsChart;
