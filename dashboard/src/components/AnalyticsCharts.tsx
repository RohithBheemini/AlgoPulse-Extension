'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface ChartProps {
  data: Array<{
    date: string;
    score: number;
    problem: string;
  }>;
}

export const ScoreTrendChart: React.FC<ChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-[#8b949e] text-xs">
        No evaluation data yet. Analyze code on LeetCode to populate your score chart.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4285F4" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#4285F4" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
          <XAxis
            dataKey="date"
            stroke="#8b949e"
            fontSize={11}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            stroke="#8b949e"
            fontSize={11}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#161b22',
              borderColor: '#30363d',
              borderRadius: '8px',
              color: '#f0f6fc',
              fontSize: '12px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
            }}
            itemStyle={{ color: '#4285F4' }}
            formatter={(val: any, _name: any, item: any) => [
              `${val} / 100 (${item.payload.problem})`,
              'Score'
            ]}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#4285F4"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#scoreGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
