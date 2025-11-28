'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface ActivityDay {
  date: string; // YYYY-MM-DD
  total: number;
  questions: number;
  lessons: number;
}

export interface ActivitySummary {
  totalActiveDays: number;
  currentStreak: number;
  longestStreak: number;
}

interface UseActivityTimelineResult {
  days: ActivityDay[];
  summary: ActivitySummary;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const TOTAL_DAYS = 84; // 12 semaines

function normalizeDate(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

export function useActivityTimeline(userId?: string | null): UseActivityTimelineResult {
  const [days, setDays] = useState<ActivityDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateBaseDays = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isoDay = (today.getDay() + 5) % 7; // Lundi = 0 ... Dimanche = 6
    const daysUntilSunday = 6 - isoDay;

    const rangeEnd = new Date(today);
    rangeEnd.setDate(rangeEnd.getDate() + daysUntilSunday);

    const start = new Date(rangeEnd);
    start.setDate(start.getDate() - (TOTAL_DAYS - 1));

    const base: ActivityDay[] = [];
    for (let i = 0; i < TOTAL_DAYS; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      base.push({
        date: normalizeDate(day),
        total: 0,
        questions: 0,
        lessons: 0,
      });
    }
    return base;
  }, []);

  const computeSummary = useCallback((items: ActivityDay[]): ActivitySummary => {
    const totalActiveDays = items.filter((d) => d.total > 0).length;

    let currentStreak = 0;
    let longestStreak = 0;
    let streak = 0;

    for (let i = 0; i < items.length; i++) {
      if (items[i].total > 0) {
        streak += 1;
        if (streak > longestStreak) longestStreak = streak;
      } else {
        streak = 0;
      }
    }

    // Calcul du streak courant en partant d'aujourd'hui
    for (let i = items.length - 1; i >= 0; i--) {
      if (items[i].total > 0) currentStreak += 1;
      else break;
    }

    return { totalActiveDays, currentStreak, longestStreak };
  }, []);

  const fetchData = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    const baseDays = generateBaseDays();
    const dayMap = new Map(baseDays.map((d) => [d.date, { ...d }]));
    const startDate = baseDays[0].date;

    try {
      const { data: questionData, error: questionError } = await supabase
        .from('user_progress')
        .select('completed_at')
        .eq('user_id', userId)
        .gte('completed_at', `${startDate}T00:00:00.000Z`);

      if (questionError) throw questionError;

      questionData?.forEach((row) => {
        if (!row.completed_at) return;
        const key = normalizeDate(new Date(row.completed_at));
        const day = dayMap.get(key);
        if (day) {
          day.questions += 1;
          day.total += 1;
        }
      });

      const { data: lessonData, error: lessonError } = await supabase
        .from('lesson_progress')
        .select('completed_at')
        .eq('user_id', userId)
        .eq('completed', true)
        .gte('completed_at', `${startDate}T00:00:00.000Z`);

      if (lessonError) throw lessonError;

      lessonData?.forEach((row) => {
        if (!row.completed_at) return;
        const key = normalizeDate(new Date(row.completed_at));
        const day = dayMap.get(key);
        if (day) {
          day.lessons += 1;
          day.total += 1;
        }
      });

      const ordered = Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date));
      setDays(ordered);
    } catch (err) {
      console.error('Error fetching activity timeline:', err);
      setError("Impossible de charger la timeline d'activité");
      setDays(baseDays);
    } finally {
      setLoading(false);
    }
  }, [generateBaseDays, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const summary = useMemo(() => computeSummary(days), [computeSummary, days]);

  return {
    days,
    summary,
    loading,
    error,
    refresh: fetchData,
  };
}
