'use client';

import { ActivityDay, ActivitySummary } from '@/hooks/useActivityTimeline';
import { motion } from 'framer-motion';
import { BookOpen, CalendarDays, Flame, Zap } from 'lucide-react';
import { useMemo } from 'react';

interface ActivityHeatmapProps {
  days: ActivityDay[];
  summary: ActivitySummary;
  loading?: boolean;
  variant?: 'default' | 'compact';
  className?: string;
}

const COLOR_STEPS = ['bg-gray-100', 'bg-emerald-100', 'bg-emerald-200', 'bg-emerald-400', 'bg-emerald-600'];
const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export function ActivityHeatmap({ days, summary, loading, variant = 'default', className }: ActivityHeatmapProps) {
  const { weeks, maxValue, monthLabels } = useMemo(() => {
    const chunked: ActivityDay[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      chunked.push(days.slice(i, i + 7));
    }

    const max = Math.max(1, ...days.map((day) => day.total));

    const labels = chunked.map((week, index) => {
      const firstDay = week[0];
      if (!firstDay) return '';
      const currentMonth = new Date(firstDay.date).getMonth();
      const prevWeek = chunked[index - 1];
      const prevMonth = prevWeek?.[0] ? new Date(prevWeek[0].date).getMonth() : -1;
      if (currentMonth !== prevMonth) {
        return new Date(firstDay.date).toLocaleString('fr-FR', { month: 'short' });
      }
      return '';
    });

    return { weeks: chunked, maxValue: max, monthLabels: labels };
  }, [days]);

  const getColorClass = (value: number) => {
    if (value <= 0) return COLOR_STEPS[0];
    const intensity = Math.min(COLOR_STEPS.length - 1, Math.floor((value / maxValue) * (COLOR_STEPS.length - 1)) + 1);
    return COLOR_STEPS[intensity];
  };

  const squareSize = variant === 'compact' ? 14 : 18;
  const squareStyle = { width: squareSize, height: squareSize };
  const labelStyle = { height: squareSize, lineHeight: `${squareSize}px` };
  const verticalGapClass = variant === 'compact' ? 'gap-[8px]' : 'gap-3';
  const horizontalGapClass = variant === 'compact' ? 'gap-[4px]' : 'gap-2';
  const containerClasses = variant === 'compact'
    ? 'bg-white rounded-2xl p-4 shadow-lg border border-emerald-100'
    : 'bg-white rounded-3xl p-6 shadow-xl border-2 border-emerald-100';

  if (loading) {
    return (
      <div className={`${containerClasses} animate-pulse ${className || ''}`}>
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6" />
        <div className="grid grid-cols-14 gap-1">
          {Array.from({ length: 70 }).map((_, idx) => (
            <div key={idx} className="w-3 h-3 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${containerClasses} ${className || ''}`.trim()}
    >
      <div className={variant === 'compact' ? 'mb-3' : 'mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4'}>
        {variant === 'compact' ? (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span className="font-semibold flex items-center gap-1 text-gray-800">
              <CalendarDays className="w-4 h-4 text-emerald-500" />
              Activité
            </span>
            <span className="text-xs text-gray-400">12 semaines</span>
          </div>
        ) : (
          <>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <CalendarDays className="w-6 h-6 text-emerald-500" />
                Timeline d&apos;activité
              </h2>
              <p className="text-sm text-gray-500">Les 12 dernières semaines d&apos;entraînement</p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>{summary.currentStreak} j streak</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>{summary.totalActiveDays} jours actifs</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                <span>Record : {summary.longestStreak} j</span>
              </div>
            </div>
          </>
        )}
      </div>

      {variant === 'compact' && (
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-500" />
            Série {summary.currentStreak} j
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-yellow-500" />
            {summary.totalActiveDays} jours actifs
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-emerald-500" />
            Record {summary.longestStreak} j
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <div className={`flex flex-col ${verticalGapClass} text-[11px] text-gray-500 font-medium pt-6 items-center`}>
          {WEEKDAYS.map((dayLabel, idx) => (
            <span key={dayLabel + idx} style={labelStyle}>
              {dayLabel}
            </span>
          ))}
        </div>

        <div className="overflow-x-auto">
          <div className="flex items-center mb-2 gap-1 text-[10px] uppercase tracking-wide text-gray-400">
            {monthLabels.map((label, idx) => (
              <span
                key={`label-${idx}`}
                className="text-left"
                style={{ minWidth: squareSize + 4 }}
              >
                {label}
              </span>
            ))}
          </div>
          <div className={`flex ${horizontalGapClass}`}>
            {weeks.map((week, weekIndex) => (
              <div key={`week-${weekIndex}`} className={`flex flex-col ${verticalGapClass}`}>
                {week.map((day) => (
                  <div
                    key={day.date}
                    className={`rounded ${getColorClass(day.total)} transition-all duration-150 hover:scale-110 cursor-pointer`}
                    style={squareStyle}
                    title={`${new Date(day.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'short',
                    })} • ${day.total} activité${day.total > 1 ? 's' : ''}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`flex items-center gap-2 mt-4 text-[11px] ${variant === 'compact' ? 'text-gray-400' : 'text-gray-500'}`}>
        <span>Moins</span>
        <div className="flex items-center gap-1">
          {COLOR_STEPS.map((cls, idx) => (
            <div key={`legend-${idx}`} className={`w-5 h-3 rounded ${cls}`} />
          ))}
        </div>
        <span>Plus</span>
      </div>
    </motion.div>
  );
}
