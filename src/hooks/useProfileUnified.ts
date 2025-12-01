'use client';

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Import des données de leçons
import { grammarLessons } from '@/data/grammar-lessons';
import { vocabularyLessons } from '@/data/vocabulary-lessons';
import { conjugationLessons } from '@/data/conjugation-lessons';
import { comprehensionLessons } from '@/data/comprehension-lessons';

// Types
export interface CategoryScore {
  category: string;
  name: string;
  emoji: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface ToeicTest {
  id: string;
  score: number;
  date: string;
  listening_score: number;
  reading_score: number;
}

export interface ActivityDay {
  date: string;
  total: number;
  questions: number;
  lessons: number;
}

export interface ActivitySummary {
  totalActiveDays: number;
  currentStreak: number;
  longestStreak: number;
}

export interface WeeklyProgress {
  xp: number;
  lessons: number;
  questions: number;
}

export interface WeeklyGoal {
  id: string;
  goal_type: 'xp' | 'lessons' | 'questions';
  target_value: number;
  is_active: boolean;
}

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

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  progress?: number;
  target?: number;
}

export interface ProfileAllData {
  categoryScores: CategoryScore[];
  toeicTests: ToeicTest[];
  activityDays: ActivityDay[];
  activitySummary: ActivitySummary;
  weeklyGoals: WeeklyGoal[];
  weeklyProgress: WeeklyProgress;
  lessonHistory: LessonHistoryItem[];
  badges: Badge[];
  unlockedBadgesCount: number;
  totalBadges: number;
}

// Constantes
const CACHE_KEY = 'profile_unified_cache';
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes
const ACTIVITY_DAYS = 84; // 12 semaines

const categoryInfo: Record<string, { name: string; emoji: string }> = {
  'audio_with_images': { name: 'Audio avec Images', emoji: '🎧' },
  'qa': { name: 'Questions & Réponses', emoji: '❓' },
  'short_conversation': { name: 'Conversations Courtes', emoji: '💬' },
  'short_talks': { name: 'Exposés Courts', emoji: '📻' },
  'incomplete_sentences': { name: 'Phrases Incomplètes', emoji: '✍️' },
  'text_completion': { name: 'Complétion de Texte', emoji: '📝' },
  'reading_comprehension': { name: 'Compréhension Écrite', emoji: '📖' },
};

const LESSON_CATEGORY_INFO: Record<string, { emoji: string; color: string; label: string }> = {
  grammaire: { emoji: '📚', color: 'bg-blue-500', label: 'Grammaire' },
  vocabulaire: { emoji: '📝', color: 'bg-green-500', label: 'Vocabulaire' },
  conjugaison: { emoji: '🔄', color: 'bg-purple-500', label: 'Conjugaison' },
  comprehension: { emoji: '📖', color: 'bg-orange-500', label: 'Compréhension' },
};

// Badge definitions
const BADGE_DEFINITIONS = [
  { id: 'first_lesson', name: 'Premier Pas', description: 'Compléter une leçon', emoji: '🎯', check: (d: BadgeCheckData) => d.lessonsCompleted >= 1, target: 1, getProgress: (d: BadgeCheckData) => d.lessonsCompleted },
  { id: 'five_lessons', name: 'Étudiant Assidu', description: 'Compléter 5 leçons', emoji: '📚', check: (d: BadgeCheckData) => d.lessonsCompleted >= 5, target: 5, getProgress: (d: BadgeCheckData) => d.lessonsCompleted },
  { id: 'ten_lessons', name: 'Maître Apprenti', description: 'Compléter 10 leçons', emoji: '🎓', check: (d: BadgeCheckData) => d.lessonsCompleted >= 10, target: 10, getProgress: (d: BadgeCheckData) => d.lessonsCompleted },
  { id: 'streak_3', name: 'Régularité', description: '3 jours de suite', emoji: '🔥', check: (d: BadgeCheckData) => d.currentStreak >= 3, target: 3, getProgress: (d: BadgeCheckData) => d.currentStreak },
  { id: 'streak_7', name: 'Semaine Parfaite', description: '7 jours de suite', emoji: '⚡', check: (d: BadgeCheckData) => d.currentStreak >= 7, target: 7, getProgress: (d: BadgeCheckData) => d.currentStreak },
  { id: 'streak_30', name: 'Mois d\'Or', description: '30 jours de suite', emoji: '🏆', check: (d: BadgeCheckData) => d.currentStreak >= 30, target: 30, getProgress: (d: BadgeCheckData) => d.currentStreak },
  { id: 'first_toeic', name: 'Challenger', description: 'Passer un TEPITECH blanc', emoji: '📝', check: (d: BadgeCheckData) => d.toeicCount >= 1, target: 1, getProgress: (d: BadgeCheckData) => d.toeicCount },
  { id: 'toeic_500', name: 'Niveau Intermédiaire', description: 'Score TEPITECH ≥ 500', emoji: '📈', check: (d: BadgeCheckData) => d.bestToeicScore >= 500, target: 500, getProgress: (d: BadgeCheckData) => d.bestToeicScore },
  { id: 'toeic_750', name: 'Niveau Avancé', description: 'Score TEPITECH ≥ 750', emoji: '🌟', check: (d: BadgeCheckData) => d.bestToeicScore >= 750, target: 750, getProgress: (d: BadgeCheckData) => d.bestToeicScore },
  { id: 'questions_50', name: 'Curieux', description: 'Répondre à 50 questions', emoji: '❓', check: (d: BadgeCheckData) => d.questionsAnswered >= 50, target: 50, getProgress: (d: BadgeCheckData) => d.questionsAnswered },
  { id: 'questions_200', name: 'Explorateur', description: 'Répondre à 200 questions', emoji: '🔍', check: (d: BadgeCheckData) => d.questionsAnswered >= 200, target: 200, getProgress: (d: BadgeCheckData) => d.questionsAnswered },
  { id: 'perfect_5', name: 'Perfectionniste', description: '5 leçons avec 100%', emoji: '💯', check: (d: BadgeCheckData) => d.perfectLessons >= 5, target: 5, getProgress: (d: BadgeCheckData) => d.perfectLessons },
];

interface BadgeCheckData {
  lessonsCompleted: number;
  currentStreak: number;
  toeicCount: number;
  bestToeicScore: number;
  questionsAnswered: number;
  perfectLessons: number;
}

interface CachedData {
  data: ProfileAllData;
  userId: string;
  timestamp: number;
}

function getCache(userId: string): CachedData | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const data: CachedData = JSON.parse(cached);
    if (data.userId !== userId || Date.now() - data.timestamp > CACHE_DURATION) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCache(userId: string, data: ProfileAllData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, userId, timestamp: Date.now() }));
  } catch (err) {
    console.warn('Cache write failed:', err);
  }
}

// Helpers
function normalizeDate(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function generateBaseDays(): ActivityDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isoDay = (today.getDay() + 5) % 7;
  const daysUntilSunday = 6 - isoDay;

  const rangeEnd = new Date(today);
  rangeEnd.setDate(rangeEnd.getDate() + daysUntilSunday);

  const start = new Date(rangeEnd);
  start.setDate(start.getDate() - (ACTIVITY_DAYS - 1));

  const base: ActivityDay[] = [];
  for (let i = 0; i < ACTIVITY_DAYS; i++) {
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
}

function computeActivitySummary(items: ActivityDay[]): ActivitySummary {
  const totalActiveDays = items.filter((d) => d.total > 0).length;

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

  let currentStreak = 0;
  for (let i = items.length - 1; i >= 0; i--) {
    if (items[i].total > 0) currentStreak += 1;
    else break;
  }

  return { totalActiveDays, currentStreak, longestStreak };
}

function getLessonMeta(category: string, lessonId: number) {
  let lessons: { id: number; title: string; theme: string; xp: number }[] = [];

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

export function useProfileUnified(userId: string | undefined) {
  const [data, setData] = useState<ProfileAllData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  const loadData = useCallback(async (useCache = true) => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Check cache
    if (useCache) {
      const cached = getCache(userId);
      if (cached) {
        setData(cached.data);
        setFromCache(true);
        setLoading(false);
        return;
      }
    }

    setFromCache(false);
    setLoading(true);
    setError(null);

    try {
      const weekStart = getWeekStart();
      const baseDays = generateBaseDays();
      const startDate = baseDays[0].date;

      // ===== BATCH: Récupérer toutes les données en parallèle =====
      const [
        categoryStatsResult,
        questionCountsResults,
        toeicTestsResult,
        userProgressResult,
        lessonProgressResult,
        streakResult,
        weeklyGoalsResult,
        weekProgressResult,
        weekLessonsResult,
      ] = await Promise.all([
        // Stats catégorie utilisateur
        supabase.from('user_category_stats').select('*').eq('user_id', userId),
        
        // Counts de questions par catégorie (en parallèle)
        Promise.all(
          Object.keys(categoryInfo).map(async (category) => {
            const { count } = await supabase
              .from('questions')
              .select('*', { count: 'exact', head: true })
              .eq('category', category);
            return { category, count: count || 0 };
          })
        ),
        
        // Tests TOEIC
        supabase
          .from('toeic_blanc_results')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10),
        
        // Progression questions (pour activité)
        supabase
          .from('user_progress')
          .select('completed_at')
          .eq('user_id', userId)
          .gte('completed_at', startDate),
        
        // Progression leçons
        supabase
          .from('lesson_progress')
          .select('*')
          .eq('user_id', userId)
          .order('completed_at', { ascending: false }),
        
        // Streak
        supabase
          .from('user_streaks')
          .select('current_streak, longest_streak')
          .eq('user_id', userId)
          .single(),
        
        // Objectifs hebdomadaires
        supabase
          .from('user_weekly_goals')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true),
        
        // Progression cette semaine (questions)
        supabase
          .from('user_progress')
          .select('id, is_correct')
          .eq('user_id', userId)
          .gte('completed_at', weekStart.toISOString()),
        
        // Leçons cette semaine
        supabase
          .from('lesson_progress')
          .select('id')
          .eq('user_id', userId)
          .eq('completed', true)
          .gte('completed_at', weekStart.toISOString()),
      ]);

      // ===== Traiter les données =====
      
      // Category Scores
      const statsMap = new Map(
        (categoryStatsResult.data || []).map((stat: { category: string }) => [stat.category, stat])
      );
      const countsMap = new Map(
        questionCountsResults.map(({ category, count }) => [category, count])
      );

      const categoryScores: CategoryScore[] = Object.entries(categoryInfo).map(([category, info]) => {
        const stats = statsMap.get(category) as { xp_earned?: number } | undefined;
        const totalCount = countsMap.get(category) || 0;
        const maxScore = totalCount * 50;
        const currentScore = stats?.xp_earned || 0;
        const percentage = maxScore > 0 ? (currentScore / maxScore) * 100 : 0;

        return {
          category,
          name: info.name,
          emoji: info.emoji,
          score: currentScore,
          maxScore,
          percentage: Math.min(percentage, 100),
        };
      });

      // TOEIC Tests
      const toeicTests: ToeicTest[] = (toeicTestsResult.data || []).map((test: { 
        id: string; 
        total_score: number; 
        created_at: string; 
        listening_score: number; 
        reading_score: number;
      }) => ({
        id: test.id,
        score: test.total_score,
        date: test.created_at,
        listening_score: test.listening_score,
        reading_score: test.reading_score,
      }));

      // Activity Days
      const dayMap = new Map(baseDays.map((d) => [d.date, { ...d }]));
      
      (userProgressResult.data || []).forEach((p: { completed_at: string }) => {
        const dateKey = p.completed_at?.split('T')[0];
        if (dateKey && dayMap.has(dateKey)) {
          const entry = dayMap.get(dateKey)!;
          entry.questions += 1;
          entry.total += 1;
        }
      });

      (lessonProgressResult.data || []).forEach((l: { completed_at: string; completed: boolean }) => {
        if (l.completed && l.completed_at) {
          const dateKey = l.completed_at.split('T')[0];
          if (dayMap.has(dateKey)) {
            const entry = dayMap.get(dateKey)!;
            entry.lessons += 1;
            entry.total += 1;
          }
        }
      });

      const activityDays = Array.from(dayMap.values());
      const activitySummary = computeActivitySummary(activityDays);

      // Weekly Goals & Progress
      const weeklyGoals: WeeklyGoal[] = (weeklyGoalsResult.data || []).map((g: {
        id: string;
        goal_type: 'xp' | 'lessons' | 'questions';
        target_value: number;
        is_active: boolean;
      }) => ({
        id: g.id,
        goal_type: g.goal_type,
        target_value: g.target_value,
        is_active: g.is_active,
      }));

      const XP_PER_CORRECT = 50;
      const weekProgressData = weekProgressResult.data || [];
      const correctAnswers = weekProgressData.filter((p: { is_correct: boolean }) => p.is_correct).length;
      
      const weeklyProgress: WeeklyProgress = {
        xp: correctAnswers * XP_PER_CORRECT,
        lessons: (weekLessonsResult.data || []).length,
        questions: weekProgressData.length,
      };

      // Lesson History (limit 5)
      const lessonHistory: LessonHistoryItem[] = [];
      const allLessons = lessonProgressResult.data || [];
      
      for (const row of allLessons.slice(0, 5)) {
        const meta = getLessonMeta(row.category, row.lesson_id);
        if (!meta) continue;

        const categoryInfoLesson = LESSON_CATEGORY_INFO[row.category] || {
          emoji: '📄',
          color: 'bg-gray-500',
          label: row.category,
        };

        lessonHistory.push({
          lessonId: row.lesson_id,
          category: row.category,
          title: meta.title,
          theme: meta.theme,
          completed: row.completed,
          score: row.score || 0,
          xpEarned: row.xp_earned || 0,
          totalXp: meta.xp,
          progressPercent: row.completed ? 100 : Math.round((row.score || 0)),
          lastAccessedAt: row.completed_at,
          emoji: categoryInfoLesson.emoji,
          color: categoryInfoLesson.color,
        });
      }

      // Badges
      const streakData = streakResult.data;
      const lessonsCompleted = allLessons.filter((l: { completed: boolean }) => l.completed).length;
      const perfectLessons = allLessons.filter((l: { completed: boolean; score: number }) => l.completed && l.score === 100).length;
      const questionsAnswered = categoryScores.reduce((sum, c) => sum + Math.floor(c.score / 50), 0);
      const bestToeicScore = toeicTests.length > 0 ? Math.max(...toeicTests.map(t => t.score)) : 0;

      const badgeCheckData: BadgeCheckData = {
        lessonsCompleted,
        currentStreak: streakData?.current_streak || 0,
        toeicCount: toeicTests.length,
        bestToeicScore,
        questionsAnswered,
        perfectLessons,
      };

      const badges: Badge[] = BADGE_DEFINITIONS.map((def) => ({
        id: def.id,
        name: def.name,
        description: def.description,
        emoji: def.emoji,
        unlocked: def.check(badgeCheckData),
        progress: def.getProgress(badgeCheckData),
        target: def.target,
      }));

      const unlockedBadgesCount = badges.filter((b) => b.unlocked).length;

      // Construire le résultat final
      const result: ProfileAllData = {
        categoryScores,
        toeicTests,
        activityDays,
        activitySummary,
        weeklyGoals,
        weeklyProgress,
        lessonHistory,
        badges,
        unlockedBadgesCount,
        totalBadges: badges.length,
      };

      setData(result);
      setCache(userId, result);

    } catch (err) {
      console.error('Error loading profile data:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const refresh = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    loadData(false);
  }, [loadData]);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Goal management functions
  const setGoal = useCallback(async (type: 'xp' | 'lessons' | 'questions', target: number) => {
    if (!userId) return;

    try {
      await supabase
        .from('user_weekly_goals')
        .upsert({
          user_id: userId,
          goal_type: type,
          target_value: target,
          is_active: true,
        }, { onConflict: 'user_id,goal_type' });
      
      refresh();
    } catch (err) {
      console.error('Error setting goal:', err);
    }
  }, [userId, refresh]);

  const removeGoal = useCallback(async (type: 'xp' | 'lessons' | 'questions') => {
    if (!userId) return;

    try {
      await supabase
        .from('user_weekly_goals')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('goal_type', type);
      
      refresh();
    } catch (err) {
      console.error('Error removing goal:', err);
    }
  }, [userId, refresh]);

  return {
    data,
    loading,
    error,
    fromCache,
    refresh,
    setGoal,
    removeGoal,
  };
}
