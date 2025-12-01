'use client';

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Types
interface CategoryInfo {
  name: string;
  emoji: string;
}

export interface UserStats {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  total_xp: number;
  training_xp: number;
  lesson_xp: number;
  mission_xp: number;
  questions_answered: number;
  success_rate: number;
  current_streak: number;
  longest_streak: number;
  last_activity: string | null;
  toeic_tests_count: number;
  best_toeic_score: number | null;
}

export interface DailyStats {
  date: string;
  registrations: number;
  activeUsers: number;
}

export interface CategoryDeepDive {
  category: string;
  name: string;
  emoji: string;
  totalAnswered: number;
  correctAnswers: number;
  successRate: number;
  totalXp: number;
  uniqueUsers: number;
}

export interface LessonDeepDive {
  category: string;
  name: string;
  emoji: string;
  totalLessons: number;
  completedCount: number;
  completionRate: number;
  uniqueUsers: number;
}

export interface ToeicDeepDive {
  totalTests: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  uniqueUsers: number;
  scoreDistribution: { range: string; count: number }[];
}

export interface PlatformStats {
  totalUsers: number;
  activeUsersToday: number;
  activeUsersWeek: number;
  activeUsersMonth: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  globalSuccessRate: number;
  totalXpDistributed: number;
  totalToeicTests: number;
  averageToeicScore: number;
  totalQuestions: number;
  questionsPerCategory: { category: string; count: number; name: string; emoji: string }[];
  lessonsPerCategory: { category: string; count: number; name: string; emoji: string }[];
  dailyStats: DailyStats[];
  topStreaks: { user_id: string; email: string; full_name: string | null; current_streak: number }[];
  previousPeriod: {
    activeUsersWeek: number;
    totalQuestionsAnswered: number;
    globalSuccessRate: number;
    registrationsWeek: number;
  };
  categoryDeepDive: CategoryDeepDive[];
  lessonDeepDive: LessonDeepDive[];
  toeicDeepDive: ToeicDeepDive | null;
}

// Constantes
const categoryInfo: Record<string, CategoryInfo> = {
  'audio_with_images': { name: 'Audio avec Images', emoji: '🎧' },
  'qa': { name: 'Questions & Réponses', emoji: '❓' },
  'short_conversation': { name: 'Conversations Courtes', emoji: '💬' },
  'short_talks': { name: 'Exposés Courts', emoji: '📻' },
  'incomplete_sentences': { name: 'Phrases Incomplètes', emoji: '✍️' },
  'text_completion': { name: 'Complétion de Texte', emoji: '📝' },
  'reading_comprehension': { name: 'Compréhension Écrite', emoji: '📖' },
};

// Cache
const CACHE_KEY = 'admin_stats_cache';
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

interface CachedData {
  platformStats: PlatformStats;
  users: UserStats[];
  range: TimeRange;
  timestamp: number;
}

function getCache(range: TimeRange): CachedData | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const data: CachedData = JSON.parse(cached);
    if (data.range !== range || Date.now() - data.timestamp > CACHE_DURATION) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCache(data: CachedData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Cache write failed:', err);
  }
}

export type TimeRange = 'today' | '7d' | '30d';

// Helper pour obtenir les dates selon la plage
function getDateRanges(range: TimeRange) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  
  let periodStart: string;
  let previousPeriodStart: string;
  let previousPeriodEnd: string;
  let daysInPeriod: number;
  
  switch (range) {
    case 'today':
      periodStart = todayStart;
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      previousPeriodStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()).toISOString();
      previousPeriodEnd = todayStart;
      daysInPeriod = 1;
      break;
    case '7d':
      periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      previousPeriodStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
      previousPeriodEnd = periodStart;
      daysInPeriod = 7;
      break;
    case '30d':
    default:
      periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      previousPeriodStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString();
      previousPeriodEnd = periodStart;
      daysInPeriod = 30;
      break;
  }
  
  return { now, todayStart, periodStart, previousPeriodStart, previousPeriodEnd, daysInPeriod };
}

// Missions calculator (simple version)
function calculateMissionXp(userData: {
  lessonsCompleted: number;
  currentStreak: number;
  toeicCount: number;
  perfectLessons: number;
}): number {
  let xp = 0;
  
  // Première leçon
  if (userData.lessonsCompleted >= 1) xp += 100;
  // 5 leçons
  if (userData.lessonsCompleted >= 5) xp += 250;
  // 10 leçons
  if (userData.lessonsCompleted >= 10) xp += 500;
  // Streak 3 jours
  if (userData.currentStreak >= 3) xp += 150;
  // Streak 7 jours
  if (userData.currentStreak >= 7) xp += 350;
  // Premier TOEIC
  if (userData.toeicCount >= 1) xp += 200;
  // Perfection (5 leçons à 100%)
  if (userData.perfectLessons >= 5) xp += 300;
  
  return xp;
}

export function useAdminStatsOptimized(range: TimeRange = '7d') {
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [users, setUsers] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  const loadAll = useCallback(async (useCache = true) => {
    // Check cache first
    if (useCache) {
      const cached = getCache(range);
      if (cached) {
        setPlatformStats(cached.platformStats);
        setUsers(cached.users);
        setFromCache(true);
        setLoading(false);
        return;
      }
    }
    
    setFromCache(false);
    setLoading(true);
    setError(null);

    try {
      const dates = getDateRanges(range);
      const monthAgo = new Date(dates.now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

      // ===== BATCH 1: Récupérer toutes les données en parallèle =====
      const [
        authUsersResponse,
        allProgressData,
        allCategoryStats,
        allLessonProgress,
        allStreaksData,
        allToeicResults,
        questionsCountResult,
        // Période précédente
        prevProgressData,
        prevRegistrations,
      ] = await Promise.all([
        // Auth users via API
        fetch('/api/admin/users').then(r => r.ok ? r.json() : { users: [] }),
        
        // Toutes les progressions utilisateur (pas de limite pour avoir tout)
        supabase.from('user_progress').select('user_id, category, is_correct, completed_at'),
        
        // Stats catégorie pour tous les users
        supabase.from('user_category_stats').select('user_id, category, xp_earned, total_attempted, correct_count'),
        
        // Progression des leçons
        supabase.from('lesson_progress').select('user_id, category, completed, score, xp_earned, completed_at'),
        
        // Streaks
        supabase.from('user_streaks').select('user_id, current_streak, longest_streak, last_activity_date, created_at'),
        
        // Résultats TOEIC
        supabase.from('toeic_blanc_results').select('user_id, total_score, created_at'),
        
        // Nombre de questions
        supabase.from('questions').select('category', { count: 'exact' }),
        
        // Progressions période précédente
        supabase.from('user_progress').select('user_id, is_correct')
          .gte('completed_at', dates.previousPeriodStart)
          .lt('completed_at', dates.previousPeriodEnd),
        
        // Inscriptions période précédente  
        supabase.from('user_streaks').select('user_id')
          .gte('created_at', dates.previousPeriodStart)
          .lt('created_at', dates.previousPeriodEnd),
      ]);

      // ===== BATCH 2: Questions par catégorie (en parallèle) =====
      const questionsPerCategoryPromises = Object.entries(categoryInfo).map(async ([category, info]) => {
        const { count } = await supabase
          .from('questions')
          .select('*', { count: 'exact', head: true })
          .eq('category', category);
        return { category, count: count || 0, name: info.name, emoji: info.emoji };
      });
      const questionsPerCategory = await Promise.all(questionsPerCategoryPromises);

      // ===== Construire les maps pour traitement efficace =====
      const authUsersMap = new Map<string, { email: string; full_name: string | null; created_at: string }>();
      (authUsersResponse.users || []).forEach((u: { id: string; email: string; full_name: string | null; created_at: string }) => {
        authUsersMap.set(u.id, { email: u.email, full_name: u.full_name, created_at: u.created_at });
      });

      const progressData = allProgressData.data || [];
      const categoryStats = allCategoryStats.data || [];
      const lessonProgress = allLessonProgress.data || [];
      const streaksData = allStreaksData.data || [];
      const toeicResults = allToeicResults.data || [];

      // Tous les user IDs uniques
      const allUserIds = new Set<string>();
      authUsersMap.forEach((_, id) => allUserIds.add(id));
      progressData.forEach(p => allUserIds.add(p.user_id));
      categoryStats.forEach(s => allUserIds.add(s.user_id));
      streaksData.forEach(s => allUserIds.add(s.user_id));

      // ===== Calculer stats par utilisateur (sans requêtes supplémentaires) =====
      const categoryStatsByUser = new Map<string, { xp: number; attempted: number; correct: number }>();
      categoryStats.forEach(s => {
        const current = categoryStatsByUser.get(s.user_id) || { xp: 0, attempted: 0, correct: 0 };
        current.xp += s.xp_earned || 0;
        current.attempted += s.total_attempted || 0;
        current.correct += s.correct_count || 0;
        categoryStatsByUser.set(s.user_id, current);
      });

      const lessonStatsByUser = new Map<string, { xp: number; completed: number; perfect: number }>();
      lessonProgress.forEach(l => {
        const current = lessonStatsByUser.get(l.user_id) || { xp: 0, completed: 0, perfect: 0 };
        current.xp += l.xp_earned || 0;
        if (l.completed) {
          current.completed += 1;
          if (l.score === 100) current.perfect += 1;
        }
        lessonStatsByUser.set(l.user_id, current);
      });

      const streakByUser = new Map<string, { current: number; longest: number; lastActivity: string | null; createdAt: string | null }>();
      streaksData.forEach(s => {
        streakByUser.set(s.user_id, {
          current: s.current_streak || 0,
          longest: s.longest_streak || 0,
          lastActivity: s.last_activity_date,
          createdAt: s.created_at,
        });
      });

      const toeicByUser = new Map<string, { count: number; bestScore: number }>();
      toeicResults.forEach(t => {
        const current = toeicByUser.get(t.user_id) || { count: 0, bestScore: 0 };
        current.count += 1;
        current.bestScore = Math.max(current.bestScore, t.total_score || 0);
        toeicByUser.set(t.user_id, current);
      });

      const lastActivityByUser = new Map<string, string>();
      progressData.forEach(p => {
        if (p.completed_at) {
          const current = lastActivityByUser.get(p.user_id);
          if (!current || p.completed_at > current) {
            lastActivityByUser.set(p.user_id, p.completed_at);
          }
        }
      });

      // ===== Construire la liste des utilisateurs =====
      const usersWithStats: UserStats[] = Array.from(allUserIds).map(userId => {
        const authInfo = authUsersMap.get(userId);
        const catStats = categoryStatsByUser.get(userId) || { xp: 0, attempted: 0, correct: 0 };
        const lesStats = lessonStatsByUser.get(userId) || { xp: 0, completed: 0, perfect: 0 };
        const streak = streakByUser.get(userId) || { current: 0, longest: 0, lastActivity: null, createdAt: null };
        const toeic = toeicByUser.get(userId) || { count: 0, bestScore: 0 };
        
        const missionXp = calculateMissionXp({
          lessonsCompleted: lesStats.completed,
          currentStreak: streak.current,
          toeicCount: toeic.count,
          perfectLessons: lesStats.perfect,
        });

        const totalXp = catStats.xp + lesStats.xp + missionXp;
        const successRate = catStats.attempted > 0 ? (catStats.correct / catStats.attempted) * 100 : 0;

        return {
          id: userId,
          email: authInfo?.email || `ID: ${userId.slice(0, 8)}...`,
          full_name: authInfo?.full_name || null,
          created_at: authInfo?.created_at || streak.createdAt || new Date().toISOString(),
          total_xp: totalXp,
          training_xp: catStats.xp,
          lesson_xp: lesStats.xp,
          mission_xp: missionXp,
          questions_answered: catStats.attempted,
          success_rate: successRate,
          current_streak: streak.current,
          longest_streak: streak.longest,
          last_activity: lastActivityByUser.get(userId) || streak.lastActivity || null,
          toeic_tests_count: toeic.count,
          best_toeic_score: toeic.bestScore || null,
        };
      });

      // Trier par XP décroissant
      usersWithStats.sort((a, b) => b.total_xp - a.total_xp);

      // ===== Calculer les Platform Stats =====
      
      // Filtrer par période
      const periodProgress = progressData.filter(p => p.completed_at && p.completed_at >= dates.periodStart);
      const todayProgress = progressData.filter(p => p.completed_at && p.completed_at >= dates.todayStart);
      const monthProgress = progressData.filter(p => p.completed_at && p.completed_at >= monthAgo);

      const activeUsersTodaySet = new Set(todayProgress.map(p => p.user_id));
      const activeUsersWeekSet = new Set(periodProgress.map(p => p.user_id));
      const activeUsersMonthSet = new Set(monthProgress.map(p => p.user_id));

      const totalQuestionsAnswered = periodProgress.length;
      const totalCorrectAnswers = periodProgress.filter(p => p.is_correct).length;
      const globalSuccessRate = totalQuestionsAnswered > 0 ? (totalCorrectAnswers / totalQuestionsAnswered) * 100 : 0;

      const totalXpDistributed = categoryStats.reduce((sum, s) => sum + (s.xp_earned || 0), 0);

      // Données de leçons statiques
      const { grammarLessons } = await import('@/data/grammar-lessons');
      const { vocabularyLessons } = await import('@/data/vocabulary-lessons');
      const { conjugationLessons } = await import('@/data/conjugation-lessons');
      const { comprehensionLessons } = await import('@/data/comprehension-lessons');

      const lessonsPerCategory = [
        { category: 'grammar', count: grammarLessons.length, name: 'Grammaire', emoji: '📚' },
        { category: 'vocabulary', count: vocabularyLessons.length, name: 'Vocabulaire', emoji: '📖' },
        { category: 'conjugation', count: conjugationLessons.length, name: 'Conjugaison', emoji: '✏️' },
        { category: 'comprehension', count: comprehensionLessons.length, name: 'Compréhension', emoji: '🎧' },
      ];

      // Daily stats
      const dailyStats: DailyStats[] = [];
      for (let i = dates.daysInPeriod - 1; i >= 0; i--) {
        const date = new Date(dates.now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        
        const registrations = streaksData.filter(s => s.created_at?.startsWith(dateStr)).length;
        const activeUsersSet = new Set(
          periodProgress.filter(p => p.completed_at?.startsWith(dateStr)).map(p => p.user_id)
        );
        
        dailyStats.push({ date: dateStr, registrations, activeUsers: activeUsersSet.size });
      }

      // Top streaks
      const sortedStreaks = [...streaksData].sort((a, b) => (b.current_streak || 0) - (a.current_streak || 0)).slice(0, 5);
      const topStreaks = sortedStreaks.map(s => ({
        user_id: s.user_id,
        email: authUsersMap.get(s.user_id)?.email || 'Utilisateur',
        full_name: authUsersMap.get(s.user_id)?.full_name || null,
        current_streak: s.current_streak || 0,
      }));

      // Previous period
      const prevProgressList = prevProgressData.data || [];
      const prevRegistrationsList = prevRegistrations.data || [];
      const prevActiveUsersWeek = new Set(prevProgressList.map(p => p.user_id)).size;
      const prevQuestionsAnswered = prevProgressList.length;
      const prevCorrectAnswers = prevProgressList.filter(p => p.is_correct).length;
      const prevSuccessRate = prevQuestionsAnswered > 0 ? (prevCorrectAnswers / prevQuestionsAnswered) * 100 : 0;

      const previousPeriod = {
        activeUsersWeek: prevActiveUsersWeek,
        totalQuestionsAnswered: prevQuestionsAnswered,
        globalSuccessRate: prevSuccessRate,
        registrationsWeek: prevRegistrationsList.length,
      };

      // Category Deep Dive
      const categoryStatsMap = new Map<string, { total: number; correct: number; xp: number; users: Set<string> }>();
      progressData.forEach(p => {
        if (!p.category) return;
        if (!categoryStatsMap.has(p.category)) {
          categoryStatsMap.set(p.category, { total: 0, correct: 0, xp: 0, users: new Set() });
        }
        const stats = categoryStatsMap.get(p.category)!;
        stats.total++;
        if (p.is_correct) stats.correct++;
        stats.users.add(p.user_id);
      });

      // Ajouter XP depuis category stats
      categoryStats.forEach(s => {
        if (categoryStatsMap.has(s.category)) {
          categoryStatsMap.get(s.category)!.xp += s.xp_earned || 0;
        }
      });

      const categoryDeepDive: CategoryDeepDive[] = Object.entries(categoryInfo).map(([category, info]) => {
        const stats = categoryStatsMap.get(category);
        return {
          category,
          name: info.name,
          emoji: info.emoji,
          totalAnswered: stats?.total || 0,
          correctAnswers: stats?.correct || 0,
          successRate: stats && stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
          totalXp: stats?.xp || 0,
          uniqueUsers: stats?.users.size || 0,
        };
      }).sort((a, b) => b.totalAnswered - a.totalAnswered);

      // Lesson Deep Dive
      const lessonCategoryMap: Record<string, { name: string; emoji: string; count: number }> = {
        'grammaire': { name: 'Grammaire', emoji: '📚', count: grammarLessons.length },
        'vocabulaire': { name: 'Vocabulaire', emoji: '📖', count: vocabularyLessons.length },
        'conjugaison': { name: 'Conjugaison', emoji: '✏️', count: conjugationLessons.length },
        'comprehension': { name: 'Compréhension', emoji: '🎧', count: comprehensionLessons.length },
      };

      const lessonStatsMap = new Map<string, { completed: number; users: Set<string> }>();
      lessonProgress.forEach(l => {
        if (!l.category || !lessonCategoryMap[l.category]) return;
        if (!lessonStatsMap.has(l.category)) {
          lessonStatsMap.set(l.category, { completed: 0, users: new Set() });
        }
        const stats = lessonStatsMap.get(l.category)!;
        if (l.completed) stats.completed++;
        stats.users.add(l.user_id);
      });

      const lessonDeepDive: LessonDeepDive[] = Object.entries(lessonCategoryMap).map(([category, info]) => {
        const stats = lessonStatsMap.get(category);
        const totalPossible = info.count * Math.max(stats?.users.size || 0, 1);
        return {
          category,
          name: info.name,
          emoji: info.emoji,
          totalLessons: info.count,
          completedCount: stats?.completed || 0,
          completionRate: stats && stats.completed > 0 ? Math.min((stats.completed / totalPossible) * 100, 100) : 0,
          uniqueUsers: stats?.users.size || 0,
        };
      }).sort((a, b) => b.completedCount - a.completedCount);

      // TOEIC Deep Dive
      let toeicDeepDive: ToeicDeepDive | null = null;
      if (toeicResults.length > 0) {
        const scores = toeicResults.map(t => t.total_score);
        const uniqueToeicUsers = new Set(toeicResults.map(t => t.user_id)).size;
        
        const ranges = [
          { range: '0-200', min: 0, max: 200 },
          { range: '201-400', min: 201, max: 400 },
          { range: '401-600', min: 401, max: 600 },
          { range: '601-800', min: 601, max: 800 },
          { range: '801-990', min: 801, max: 990 },
        ];

        const scoreDistribution = ranges.map(r => ({
          range: r.range,
          count: scores.filter(s => s >= r.min && s <= r.max).length,
        }));

        toeicDeepDive = {
          totalTests: toeicResults.length,
          averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
          bestScore: Math.max(...scores),
          worstScore: Math.min(...scores),
          uniqueUsers: uniqueToeicUsers,
          scoreDistribution,
        };
      }

      // Construire le résultat final
      const finalPlatformStats: PlatformStats = {
        totalUsers: authUsersMap.size,
        activeUsersToday: activeUsersTodaySet.size,
        activeUsersWeek: activeUsersWeekSet.size,
        activeUsersMonth: activeUsersMonthSet.size,
        totalQuestionsAnswered,
        totalCorrectAnswers,
        globalSuccessRate,
        totalXpDistributed,
        totalToeicTests: toeicResults.length,
        averageToeicScore: toeicResults.length > 0 
          ? Math.round(toeicResults.reduce((sum, t) => sum + t.total_score, 0) / toeicResults.length) 
          : 0,
        totalQuestions: questionsCountResult.count || 0,
        questionsPerCategory,
        lessonsPerCategory,
        dailyStats,
        topStreaks,
        previousPeriod,
        categoryDeepDive,
        lessonDeepDive,
        toeicDeepDive,
      };

      setPlatformStats(finalPlatformStats);
      setUsers(usersWithStats);

      // Save to cache
      setCache({
        platformStats: finalPlatformStats,
        users: usersWithStats,
        range,
        timestamp: Date.now(),
      });

    } catch (err) {
      console.error('Error loading admin stats:', err);
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  }, [range]);

  const refresh = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    loadAll(false);
  }, [loadAll]);

  useEffect(() => {
    loadAll(true);
  }, [loadAll]);

  return {
    platformStats,
    users,
    loading,
    error,
    fromCache,
    refresh,
  };
}
