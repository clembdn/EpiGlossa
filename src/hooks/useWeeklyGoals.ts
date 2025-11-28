'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type GoalType = 'xp' | 'lessons' | 'questions';

export interface WeeklyGoal {
  id: string;
  goal_type: GoalType;
  target_value: number;
  is_active: boolean;
}

export interface WeeklyProgress {
  xp: number;
  lessons: number;
  questions: number;
}

interface UseWeeklyGoalsReturn {
  goals: WeeklyGoal[];
  progress: WeeklyProgress;
  loading: boolean;
  error: string | null;
  setGoal: (type: GoalType, target: number) => Promise<void>;
  removeGoal: (type: GoalType) => Promise<void>;
  refresh: () => Promise<void>;
}

// Obtenir le début de la semaine (lundi à 00:00:00)
function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Ajuster pour lundi
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function useWeeklyGoals(userId: string | undefined): UseWeeklyGoalsReturn {
  const [goals, setGoals] = useState<WeeklyGoal[]>([]);
  const [progress, setProgress] = useState<WeeklyProgress>({ xp: 0, lessons: 0, questions: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('user_weekly_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (fetchError) throw fetchError;
      setGoals(data || []);
    } catch (err) {
      console.error('Error fetching weekly goals:', err);
      setError('Erreur lors du chargement des objectifs');
    }
  }, [userId]);

  const fetchProgress = useCallback(async () => {
    if (!userId) return;

    const weekStart = getWeekStart();

    try {
      const XP_PER_CORRECT = 50;

      // 1. Progression sur les questions / XP (même requête)
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('id, is_correct')
        .eq('user_id', userId)
        .gte('completed_at', weekStart.toISOString());

      if (progressError) throw progressError;

      const weeklyQuestions = progressData?.length || 0;
      const correctAnswers = progressData?.filter(p => p.is_correct).length || 0;
      const weeklyXp = correctAnswers * XP_PER_CORRECT;

      // 2. Leçons complétées cette semaine
      const { data: lessonsData } = await supabase
        .from('lesson_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('completed', true)
        .gte('completed_at', weekStart.toISOString());

      const weeklyLessons = lessonsData?.length || 0;

      setProgress({
        xp: weeklyXp,
        lessons: weeklyLessons,
        questions: weeklyQuestions,
      });
    } catch (err) {
      console.error('Error fetching weekly progress:', err);
    }
  }, [userId]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchGoals(), fetchProgress()]);
    setLoading(false);
  }, [fetchGoals, fetchProgress]);

  useEffect(() => {
    if (userId) {
      refresh();
    }
  }, [userId, refresh]);

  const setGoal = async (type: GoalType, target: number) => {
    if (!userId) return;

    try {
      // Upsert : créer ou mettre à jour
      const { error: upsertError } = await supabase
        .from('user_weekly_goals')
        .upsert(
          {
            user_id: userId,
            goal_type: type,
            target_value: target,
            is_active: true,
          },
          {
            onConflict: 'user_id,goal_type',
          }
        );

      if (upsertError) throw upsertError;
      await fetchGoals();
    } catch (err) {
      console.error('Error setting goal:', err);
      setError('Erreur lors de la sauvegarde de l\'objectif');
    }
  };

  const removeGoal = async (type: GoalType) => {
    if (!userId) return;

    try {
      const { error: deleteError } = await supabase
        .from('user_weekly_goals')
        .delete()
        .eq('user_id', userId)
        .eq('goal_type', type);

      if (deleteError) throw deleteError;
      await fetchGoals();
    } catch (err) {
      console.error('Error removing goal:', err);
      setError('Erreur lors de la suppression de l\'objectif');
    }
  };

  return {
    goals,
    progress,
    loading,
    error,
    setGoal,
    removeGoal,
    refresh,
  };
}
