'use client';

import { useState } from 'react';
import { TrendingUp, BarChart2, Zap } from 'lucide-react';

interface AgentRun {
  agent_run_id: string;
  status: string;
  queued_at: string;
  skills_called: number | null;
}

interface ActivityTrendsProps {
  agentRuns: AgentRun[];
}

export function ActivityTrends({ agentRuns }: ActivityTrendsProps) {
  const [viewMode, setViewMode] = useState<'runs' | 'skills'>('runs');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Generate data for last 7 days
  const days: { date: Date; label: string; fullDate: string; runs: number; skills: number; successes: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const dayRuns = agentRuns.filter((run) => {
      const runDate = new Date(run.queued_at);
      return runDate >= date && runDate < nextDate;
    });

    const label = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : date.toLocaleDateString('en-US', { weekday: 'short' });
    const fullDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    days.push({
      date,
      label,
      fullDate,
      runs: dayRuns.length,
      skills: dayRuns.reduce((sum, run) => sum + (run.skills_called || 0), 0),
      successes: dayRuns.filter((r) => r.status === 'success').length,
    });
  }

  const maxValue = Math.max(...days.map((d) => (viewMode === 'runs' ? d.runs : d.skills)), 1);

  // Calculate trend (compare last 3 days vs previous 3 days, excluding today)
  const recentRuns = days.slice(4, 6).reduce((sum, d) => sum + d.runs, 0); // Days 4-5
  const previousRuns = days.slice(1, 3).reduce((sum, d) => sum + d.runs, 0); // Days 1-2
  const trend = previousRuns > 0 ? Math.round(((recentRuns - previousRuns) / previousRuns) * 100) : 0;

  return (
    <section
      style={{
        padding: '1.75rem',
        borderRadius: 20,
        background: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.02)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        minHeight: 300,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#0f172a',
              margin: 0,
            }}
          >
            Activity Trends
          </h2>
          <div
            style={{
              padding: '4px 8px',
              borderRadius: 20,
              background: trend >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <TrendingUp size={14} color={trend >= 0 ? '#16a34a' : '#ef4444'} />
            <span style={{ fontSize: 11, fontWeight: 700, color: trend >= 0 ? '#16a34a' : '#ef4444' }}>
              {trend >= 0 ? '+' : ''}{trend}% vs last week
            </span>
          </div>
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 4 }}>
          <button
            onClick={() => setViewMode('runs')}
            style={{
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: viewMode === 'runs' ? 'white' : 'transparent',
              color: viewMode === 'runs' ? '#0f172a' : '#64748b',
              boxShadow: viewMode === 'runs' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <BarChart2 size={14} />
            Tasks
          </button>
          <button
            onClick={() => setViewMode('skills')}
            style={{
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: viewMode === 'skills' ? 'white' : 'transparent',
              color: viewMode === 'skills' ? '#0f172a' : '#64748b',
              boxShadow: viewMode === 'skills' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <Zap size={14} />
            Steps
          </button>
        </div>
      </div>

      {/* Interactive Chart */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        
        {/* Story Overlay / Tooltip Area */}
        <div style={{ height: 40, marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
          {hoveredIndex !== null ? (
            <div
              style={{
                background: '#0f172a',
                color: 'white',
                padding: '8px 16px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                animation: 'fadeIn 0.2s ease-out',
              }}
            >
              <span style={{ color: '#94a3b8' }}>{days[hoveredIndex].fullDate}:</span>
              <span style={{ color: '#fff' }}>
                {viewMode === 'runs' ? `${days[hoveredIndex].runs} tasks` : `${days[hoveredIndex].skills} steps`}
              </span>
              {viewMode === 'runs' && days[hoveredIndex].runs > 0 && (
                 <span style={{ 
                   color: days[hoveredIndex].successes === days[hoveredIndex].runs ? '#4ade80' : '#fbbf24',
                   background: 'rgba(255,255,255,0.1)',
                   padding: '2px 8px',
                   borderRadius: 10,
                   fontSize: 10,
                 }}>
                   {Math.round((days[hoveredIndex].successes / days[hoveredIndex].runs) * 100)}% Success
                 </span>
              )}
            </div>
          ) : (
            <div style={{ 
              fontSize: 12, 
              color: '#94a3b8', 
              fontStyle: 'italic', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6 
            }}>
              <span style={{ width: 4, height: 4, background: '#cbd5e1', borderRadius: '50%' }} />
              Hover over a day to see details
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 180 }}>
          {days.map((day, idx) => {
            const value = viewMode === 'runs' ? day.runs : day.skills;
            const heightPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;
            const isHovered = hoveredIndex === idx;
            const isDimmed = hoveredIndex !== null && !isHovered;

            // Colors based on mode
            const barColor = viewMode === 'runs' 
              ? 'linear-gradient(180deg, #10b981 0%, #059669 100%)' 
              : 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)';
            
            const emptyColor = '#f1f5f9';

            return (
              <div
                key={day.label}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                  opacity: isDimmed ? 0.4 : 1,
                  transition: 'opacity 0.2s',
                  position: 'relative',
                }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', width: '100%' }}>
                  <div
                    style={{
                      width: '100%',
                      height: `${heightPercent}%`,
                      minHeight: value > 0 ? 6 : 0,
                      borderRadius: '8px 8px 0 0',
                      background: value > 0 ? barColor : emptyColor,
                      transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                    }}
                  />
                </div>
                <p
                  style={{
                    fontSize: 11,
                    color: isHovered ? '#0f172a' : '#94a3b8',
                    fontWeight: isHovered ? 700 : 600,
                    textAlign: 'center',
                    transition: 'color 0.2s',
                  }}
                >
                  {day.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
