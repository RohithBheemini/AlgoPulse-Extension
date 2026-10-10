'use client';

import React, { useState } from 'react';
import { HeatmapDay, StreakStats } from '@/lib/types';
import { Flame, Trophy, Calendar, Sparkles } from 'lucide-react';

interface HeatmapProps {
  heatmap: HeatmapDay[];
  streaks: StreakStats;
}

const LEVEL_COLORS: Record<number, string> = {
  0: 'bg-[#161b22] border-[#30363d]/60',
  1: 'bg-[#0e4429] border-[#238636]/40 hover:border-[#39d353]',
  2: 'bg-[#006d32] border-[#26a641]/50 hover:border-[#39d353]',
  3: 'bg-[#26a641] border-[#39d353]/70 hover:border-white shadow-sm shadow-[#26a641]/30',
  4: 'bg-[#39d353] border-white shadow-md shadow-[#39d353]/50'
};

export const SubmissionHeatmap: React.FC<HeatmapProps> = ({ heatmap, streaks }) => {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Group into columns of 7 days (weeks)
  const weeks: HeatmapDay[][] = [];
  let currentWeek: HeatmapDay[] = [];

  heatmap.forEach((day, index) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || index === heatmap.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const handleMouseEnter = (day: HeatmapDay, event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredDay(day);
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 8
    });
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
    setTooltipPos(null);
  };

  return (
    <div className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d] space-y-5">
      {/* Header with Streak Counters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#30363d]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#f0f6fc]">Submission Activity Heatmap</span>
            <span className="px-2 py-0.5 rounded-full bg-[#34A853]/15 text-[#34A853] border border-[#34A853]/30 text-[10px] font-semibold">
              Last 16 Weeks
            </span>
          </div>
          <p className="text-xs text-[#8b949e]">
            Daily problem solving consistency across LeetCode, GeeksforGeeks, and HackerRank
          </p>
        </div>

        {/* Streaks Pills */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0d1117] border border-[#30363d]">
            <Flame className="w-4 h-4 text-[#EA4335] fill-[#EA4335]" />
            <div className="text-xs">
              <span className="text-[#8b949e]">Current: </span>
              <span className="font-bold text-[#f0f6fc]">{streaks.currentStreak} Days</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0d1117] border border-[#30363d]">
            <Trophy className="w-4 h-4 text-[#FBBC05] fill-[#FBBC05]" />
            <div className="text-xs">
              <span className="text-[#8b949e]">Longest: </span>
              <span className="font-bold text-[#f0f6fc]">{streaks.longestStreak} Days</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0d1117] border border-[#30363d]">
            <Calendar className="w-4 h-4 text-[#4285F4]" />
            <div className="text-xs">
              <span className="text-[#8b949e]">Total Active: </span>
              <span className="font-bold text-[#f0f6fc]">{streaks.totalActiveDays} Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* The Heatmap Grid */}
      <div className="relative overflow-x-auto pb-2">
        <div className="flex gap-1.5 min-w-[700px]">
          {/* Day of Week Labels */}
          <div className="flex flex-col justify-between text-[10px] text-[#8b949e] pr-2 pt-1 font-mono">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
            <span>Sun</span>
          </div>

          {/* Week Columns */}
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5">
              {week.map((day) => (
                <div
                  key={day.date}
                  onMouseEnter={(e) => handleMouseEnter(day, e)}
                  onMouseLeave={handleMouseLeave}
                  className={`w-3.5 h-3.5 rounded-[3px] border heatmap-cell cursor-pointer transition ${
                    LEVEL_COLORS[day.level] || LEVEL_COLORS[0]
                  }`}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between pt-4 text-xs text-[#8b949e]">
          <span className="text-[11px]">Hover over any cell to see solved problems</span>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span>Less</span>
            <div className="w-3 h-3 rounded-[2px] bg-[#161b22] border border-[#30363d]" />
            <div className="w-3 h-3 rounded-[2px] bg-[#0e4429] border border-[#238636]" />
            <div className="w-3 h-3 rounded-[2px] bg-[#006d32] border border-[#26a641]" />
            <div className="w-3 h-3 rounded-[2px] bg-[#26a641] border border-[#39d353]" />
            <div className="w-3 h-3 rounded-[2px] bg-[#39d353] border border-white" />
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredDay && tooltipPos && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white text-xs shadow-xl space-y-1 backdrop-blur-md max-w-xs"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        >
          <div className="font-semibold text-[#f0f6fc] flex items-center justify-between gap-3">
            <span>{hoveredDay.date}</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded bg-[#21262d] text-[#34A853]">
              {hoveredDay.count} {hoveredDay.count === 1 ? 'submission' : 'submissions'}
            </span>
          </div>
          {hoveredDay.problems.length > 0 ? (
            <div className="text-[11px] text-[#8b949e] border-t border-[#30363d]/60 pt-1">
              <span className="text-[#c9d1d9] font-medium">Problems: </span>
              {hoveredDay.problems.join(', ')}
            </div>
          ) : (
            <div className="text-[11px] text-[#6e7681]">No submissions on this date</div>
          )}
        </div>
      )}
    </div>
  );
};
