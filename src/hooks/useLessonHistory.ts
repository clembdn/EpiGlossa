'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Import des données de leçons pour récupérer les métadonnées
import { grammarLessons } from '@/data/grammar-lessons';
import { vocabularyLessons } from '@/data/vocabulary-lessons';
import { conjugationLessons } from '@/data/conjugation-lessons';
import { comprehensionLessons } from '@/data/comprehension-lessons';

export interface LessonHistoryItem {
  lessonId: number;
  category: string;
  title: string;
  theme: string;
  completed: boolean;
  score: number;
  xpEarned: number;
  totalXp: number;
  progressPercent: number;
  lastAccessedAt: string;
  emoji: string;
  color: string;
}

interface LessonMeta {
  id: number;
  title: string;
  theme: string;
  xp: number;
}

const CATEGORY_INFO: Record<string, { emoji: string; color: string; label: string }> = {
  grammaire: { emoji: '📚', color: 'bg-blue-500', label: 'Grammaire' },
  vocabulaire: { emoji: '📝', color: 'bg-green-500', label: 'Vocabulaire' },
  conjugaison: { emoji: '🔄', color: 'bg-purple-500', label: 'Conjugaison' },
  comprehension: { emoji: '📖', color: 'bg-orange-500', label: 'Compréhension' },
};

function getLessonMeta(category: string, lessonId: number): LessonMeta | null {
  let lessons: LessonMeta[] = [];

  switch (category) {
    case 'grammaire':
      lessons = grammarLessons.map((l) => ({ id: l.id, title: l.title, theme: l.theme, xp: l.xp }));
      break;
    case 'vocabulaire':
      lessons = vocabularyLessons.map((l) => ({ id: l.id, title: l.title, theme: l.theme, xp: l.xp }));
      break;
    case 'conjugaison':
      lessons = conjugationLessons.map((l) => ({ id: l.id, title: l.title, theme: l.theme, xp: l.xp }));
      break;
    case 'comprehension':
      lessons = comprehensionLessons.map((l) => ({ id: l.id, title: l.title, theme: l.theme, xp: l.xp }));
      break;
  }

  return lessons.find((l) => l.id === lessonId) || null;
}

export function useLessonHistory(userId?: string | null, limit: number = 5) {
  const [lessons, setLessons] = useState<LessonHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Récupérer les dernières leçons accessées/complétées
      const { data, error: fetchError } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;

      const historyItems: LessonHistoryItem[] = [];

      for (const row of data || []) {
        const meta = getLessonMeta(row.category, row.lesson_id);
        if (!meta) continue;

        const categoryInfo = CATEGORY_INFO[row.category] || {
          emoji: '📄',
          color: 'bg-gray-500',
          label: row.category,
        };

        const progressPercent = row.completed
          ? 100
          : meta.xp > 0
          ? Math.min(99, Math.round((row.xp_earned / meta.xp) * 100))
          : 0;

        historyItems.push({
          lessonId: row.lesson_id,
          category: row.category,
          title: meta.title,
          theme: meta.theme,
          completed: row.completed,
          score: row.score || 0,
          xpEarned: row.xp_earned || 0,
          totalXp: meta.xp,
          progressPercent,
          lastAccessedAt: row.completed_at || row.updated_at || new Date().toISOString(),
          emoji: categoryInfo.emoji,
          color: categoryInfo.color,
        });
      }

      setLessons(historyItems);
    } catch (err) {
      console.error('Error fetching lesson history:', err);
      setError('Impossible de charger l\'historique des leçons');
    } finally {
      setLoading(false);
    }
  }, [userId, limit]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    lessons,
    loading,
    error,
    refresh: fetchHistory,
  };
}
