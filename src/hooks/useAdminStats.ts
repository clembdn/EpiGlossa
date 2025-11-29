'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface UserStats {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  total_xp: number;
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
  // Données comparatives (période précédente)
  previousPeriod: {
    activeUsersWeek: number;
    totalQuestionsAnswered: number;
    globalSuccessRate: number;
    registrationsWeek: number;
  };
  // Deep dive data
  categoryDeepDive: CategoryDeepDive[];
  lessonDeepDive: LessonDeepDive[];
  toeicDeepDive: ToeicDeepDive | null;
}

const categoryInfo: Record<string, { name: string; emoji: string }> = {
  'audio_with_images': { name: 'Audio avec Images', emoji: '🎧' },
  'qa': { name: 'Questions & Réponses', emoji: '❓' },
  'short_conversation': { name: 'Conversations Courtes', emoji: '💬' },
  'short_talks': { name: 'Exposés Courts', emoji: '📻' },
  'incomplete_sentences': { name: 'Phrases Incomplètes', emoji: '✍️' },
  'text_completion': { name: 'Complétion de Texte', emoji: '📝' },
  'reading_comprehension': { name: 'Compréhension Écrite', emoji: '📖' },
};

// Fonction pour récupérer tous les user_ids uniques depuis plusieurs tables
async function getAllUniqueUserIds(): Promise<Set<string>> {
  const userIds = new Set<string>();

  // Récupérer depuis user_streaks (créé à la première connexion)
  const { data: streakUsers } = await supabase
    .from('user_streaks')
    .select('user_id, created_at');
  streakUsers?.forEach(u => userIds.add(u.user_id));

  // Récupérer depuis user_progress (utilisateurs ayant répondu à des questions)
  const { data: progressUsers } = await supabase
    .from('user_progress')
    .select('user_id');
  progressUsers?.forEach(u => userIds.add(u.user_id));

  // Récupérer depuis user_category_stats
  const { data: statsUsers } = await supabase
    .from('user_category_stats')
    .select('user_id');
  statsUsers?.forEach(u => userIds.add(u.user_id));

  // Récupérer depuis user_roles (pour les admins)
  const { data: roleUsers } = await supabase
    .from('user_roles')
    .select('user_id');
  roleUsers?.forEach(u => userIds.add(u.user_id));

  // Récupérer depuis toeic_blanc_results
  const { data: toeicUsers } = await supabase
    .from('toeic_blanc_results')
    .select('user_id');
  toeicUsers?.forEach(u => userIds.add(u.user_id));

  return userIds;
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
      // Période précédente = hier
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
      periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      previousPeriodStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString();
      previousPeriodEnd = periodStart;
      daysInPeriod = 30;
      break;
  }
  
  return { now, todayStart, periodStart, previousPeriodStart, previousPeriodEnd, daysInPeriod };
}

export function useAdminStats(range: TimeRange = '7d') {
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [users, setUsers] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Cache pour les utilisateurs auth (partagé entre les fonctions)
  const [authUsersCache, setAuthUsersCache] = useState<Map<string, { email: string; full_name: string | null; created_at: string }>>(new Map());

  // Charger les utilisateurs auth depuis l'API
  const loadAuthUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const { users: authUsers } = await response.json();
        const map = new Map<string, { email: string; full_name: string | null; created_at: string }>();
        authUsers?.forEach((u: { id: string; email: string; full_name: string | null; created_at: string }) => {
          map.set(u.id, { 
            email: u.email, 
            full_name: u.full_name,
            created_at: u.created_at
          });
        });
        setAuthUsersCache(map);
        return map;
      }
    } catch (apiErr) {
      console.warn('Could not fetch auth users:', apiErr);
    }
    return new Map();
  }, []);

  const loadPlatformStats = useCallback(async (authUsersMap: Map<string, { email: string; full_name: string | null; created_at: string }>) => {
    try {
      // Le nombre total d'utilisateurs = nombre d'utilisateurs dans auth.users (vrais inscrits)
      const totalUsers = authUsersMap.size;

      // Obtenir les dates selon la plage sélectionnée
      const { now, todayStart, periodStart, previousPeriodStart, previousPeriodEnd, daysInPeriod } = getDateRanges(range);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

      // Utilisateurs actifs aujourd'hui
      const { data: activeToday } = await supabase
        .from('user_progress')
        .select('user_id')
        .gte('completed_at', todayStart);
      const activeUsersTodayCount = new Set(activeToday?.map(u => u.user_id) || []).size;

      // Utilisateurs actifs sur la période sélectionnée
      const { data: activePeriod } = await supabase
        .from('user_progress')
        .select('user_id')
        .gte('completed_at', periodStart);
      const activeUsersWeekCount = new Set(activePeriod?.map(u => u.user_id) || []).size;

      // Utilisateurs actifs ce mois (pour référence)
      const { data: activeMonth } = await supabase
        .from('user_progress')
        .select('user_id')
        .gte('completed_at', monthAgo);
      const activeUsersMonthCount = new Set(activeMonth?.map(u => u.user_id) || []).size;

      // Stats de progression sur la période sélectionnée
      const { data: progressStats } = await supabase
        .from('user_progress')
        .select('is_correct')
        .gte('completed_at', periodStart);
      
      const totalQuestionsAnswered = progressStats?.length || 0;
      const totalCorrectAnswers = progressStats?.filter(p => p.is_correct).length || 0;
      const globalSuccessRate = totalQuestionsAnswered > 0 
        ? (totalCorrectAnswers / totalQuestionsAnswered) * 100 
        : 0;

      // Total XP distribué (calculé depuis les stats par catégorie)
      const { data: categoryStats } = await supabase
        .from('user_category_stats')
        .select('xp_earned');
      const totalXpDistributed = categoryStats?.reduce((sum, s) => sum + (s.xp_earned || 0), 0) || 0;

  // Stats TEPITECH
      const { data: toeicResults, count: totalToeicTests } = await supabase
        .from('toeic_blanc_results')
        .select('total_score', { count: 'exact' });
      
      const averageToeicScore = toeicResults && toeicResults.length > 0
        ? toeicResults.reduce((sum, t) => sum + t.total_score, 0) / toeicResults.length
        : 0;

      // Nombre total de questions
      const { count: totalQuestions } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true });

      // Questions par catégorie
      const questionsPerCategory = await Promise.all(
        Object.entries(categoryInfo).map(async ([category, info]) => {
          const { count } = await supabase
            .from('questions')
            .select('*', { count: 'exact', head: true })
            .eq('category', category);
          return { category, count: count || 0, ...info };
        })
      );

      // Leçons par catégorie (données statiques importées)
      // Import dynamique pour éviter les problèmes de SSR
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

      // Inscriptions sur la période sélectionnée
      const { data: recentUsers } = await supabase
        .from('user_streaks')
        .select('user_id, created_at')
        .gte('created_at', periodStart)
        .order('created_at', { ascending: true });

      // Activité quotidienne (pour le graphique combiné)
      const { data: dailyActivity } = await supabase
        .from('user_progress')
        .select('user_id, completed_at')
        .gte('completed_at', periodStart);

      // Construire les stats quotidiennes (inscriptions + utilisateurs actifs)
      const dailyStats: DailyStats[] = [];
      for (let i = daysInPeriod - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        
        // Inscriptions ce jour
        const registrations = recentUsers?.filter(u => 
          u.created_at?.startsWith(dateStr)
        ).length || 0;
        
        // Utilisateurs actifs ce jour (utilisateurs uniques ayant répondu à des questions)
        const activeUsersSet = new Set(
          dailyActivity?.filter(a => 
            a.completed_at?.startsWith(dateStr)
          ).map(a => a.user_id) || []
        );
        const activeUsers = activeUsersSet.size;
        
        dailyStats.push({ date: dateStr, registrations, activeUsers });
      }

      // Top streaks
      const { data: topStreaksData } = await supabase
        .from('user_streaks')
        .select('user_id, current_streak')
        .order('current_streak', { ascending: false })
        .limit(5);

      // Enrichir avec les infos utilisateur
      const topStreaks = await Promise.all(
        (topStreaksData || []).map(async (streak) => {
          // On ne peut pas accéder directement à auth.users depuis le client
          // On va stocker les infos de base
          return {
            user_id: streak.user_id,
            email: 'Utilisateur',
            full_name: null,
            current_streak: streak.current_streak
          };
        })
      );

      // === Données comparatives (période précédente) ===
      // Utilisateurs actifs la période précédente
      const { data: activePrevPeriod } = await supabase
        .from('user_progress')
        .select('user_id')
        .gte('completed_at', previousPeriodStart)
        .lt('completed_at', previousPeriodEnd);
      const prevActiveUsersWeek = new Set(activePrevPeriod?.map(u => u.user_id) || []).size;

      // Questions répondues la période précédente
      const { data: prevProgressStats } = await supabase
        .from('user_progress')
        .select('is_correct')
        .gte('completed_at', previousPeriodStart)
        .lt('completed_at', previousPeriodEnd);
      const prevQuestionsAnswered = prevProgressStats?.length || 0;
      const prevCorrectAnswers = prevProgressStats?.filter(p => p.is_correct).length || 0;
      const prevSuccessRate = prevQuestionsAnswered > 0 
        ? (prevCorrectAnswers / prevQuestionsAnswered) * 100 
        : 0;

      // Inscriptions la période précédente
      const { data: prevRegistrations } = await supabase
        .from('user_streaks')
        .select('user_id')
        .gte('created_at', previousPeriodStart)
        .lt('created_at', previousPeriodEnd);
      const prevRegistrationsWeek = prevRegistrations?.length || 0;

      // Inscriptions cette période (pour comparaison)
      const currentRegistrationsWeek = recentUsers?.length || 0;

      const previousPeriod = {
        activeUsersWeek: prevActiveUsersWeek,
        totalQuestionsAnswered: prevQuestionsAnswered,
        globalSuccessRate: prevSuccessRate,
        registrationsWeek: prevRegistrationsWeek,
      };

      // === Deep Dive: Questions par catégorie (avec taux de succès) ===
      // user_progress contient directement la catégorie
      const { data: categoryProgressData } = await supabase
        .from('user_progress')
        .select('category, user_id, is_correct');

      // Récupérer les XP depuis user_category_stats
      const { data: categoryXpData } = await supabase
        .from('user_category_stats')
        .select('category, xp_earned');

      const categoryXpMap = new Map<string, number>();
      categoryXpData?.forEach(s => {
        const current = categoryXpMap.get(s.category) || 0;
        categoryXpMap.set(s.category, current + (s.xp_earned || 0));
      });

      // Calculer les stats par catégorie de questions
      const categoryStatsMap = new Map<string, { 
        totalAnswered: number; 
        correctAnswers: number; 
        totalXp: number;
        users: Set<string>;
      }>();

      categoryProgressData?.forEach(p => {
        const category = p.category;
        if (!category) return;
        
        // Accepter la catégorie même si elle n'est pas dans categoryInfo
        if (!categoryStatsMap.has(category)) {
          categoryStatsMap.set(category, { 
            totalAnswered: 0, 
            correctAnswers: 0, 
            totalXp: 0,
            users: new Set()
          });
        }
        const stats = categoryStatsMap.get(category)!;
        stats.totalAnswered++;
        if (p.is_correct) stats.correctAnswers++;
        stats.users.add(p.user_id);
      });

      // Ajouter les XP depuis user_category_stats
      categoryXpMap.forEach((xp, category) => {
        if (categoryStatsMap.has(category)) {
          categoryStatsMap.get(category)!.totalXp = xp;
        }
      });

      const categoryDeepDive: CategoryDeepDive[] = Object.entries(categoryInfo)
        .map(([category, info]) => {
          const stats = categoryStatsMap.get(category);
          return {
            category,
            name: info.name,
            emoji: info.emoji,
            totalAnswered: stats?.totalAnswered || 0,
            correctAnswers: stats?.correctAnswers || 0,
            successRate: stats && stats.totalAnswered > 0 
              ? (stats.correctAnswers / stats.totalAnswered) * 100 
              : 0,
            totalXp: stats?.totalXp || 0,
            uniqueUsers: stats?.users.size || 0,
          };
        })
        .sort((a, b) => b.totalAnswered - a.totalAnswered);

      // === Deep Dive: Leçons par catégorie ===
      // Récupérer depuis la table lesson_progress
      const { data: lessonProgressData } = await supabase
        .from('lesson_progress')
        .select('category, lesson_id, user_id, completed, score, xp_earned');

      const lessonCategoryMap: Record<string, { name: string; emoji: string; count: number }> = {
        'grammaire': { name: 'Grammaire', emoji: '📚', count: grammarLessons.length },
        'vocabulaire': { name: 'Vocabulaire', emoji: '📖', count: vocabularyLessons.length },
        'conjugaison': { name: 'Conjugaison', emoji: '✏️', count: conjugationLessons.length },
        'comprehension': { name: 'Compréhension', emoji: '🎧', count: comprehensionLessons.length },
      };

      // Calculer les stats par catégorie de leçons
      const lessonStatsMap = new Map<string, { 
        completedCount: number; 
        users: Set<string>;
        totalXp: number;
      }>();

      lessonProgressData?.forEach(p => {
        const category = p.category;
        if (!category || !lessonCategoryMap[category]) return;
        
        if (!lessonStatsMap.has(category)) {
          lessonStatsMap.set(category, { completedCount: 0, users: new Set(), totalXp: 0 });
        }
        const stats = lessonStatsMap.get(category)!;
        if (p.completed) stats.completedCount++;
        stats.users.add(p.user_id);
        stats.totalXp += p.xp_earned || 0;
      });

      const lessonDeepDive: LessonDeepDive[] = Object.entries(lessonCategoryMap)
        .map(([category, info]) => {
          const stats = lessonStatsMap.get(category);
          const totalPossibleCompletions = info.count * Math.max(stats?.users.size || 0, 1);
          return {
            category,
            name: info.name,
            emoji: info.emoji,
            totalLessons: info.count,
            completedCount: stats?.completedCount || 0,
            completionRate: stats && stats.completedCount > 0 && totalPossibleCompletions > 0
              ? Math.min((stats.completedCount / totalPossibleCompletions) * 100, 100)
              : 0,
            uniqueUsers: stats?.users.size || 0,
          };
        })
        .sort((a, b) => b.completedCount - a.completedCount);

  // === Deep Dive: TEPITECH ===
      let toeicDeepDive: ToeicDeepDive | null = null;
      if (toeicResults && toeicResults.length > 0) {
        const scores = toeicResults.map(t => t.total_score);
        const { data: toeicUsersData } = await supabase
          .from('toeic_blanc_results')
          .select('user_id');
        const uniqueToeicUsers = new Set(toeicUsersData?.map(t => t.user_id) || []).size;

        // Distribution des scores par tranches
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

      setPlatformStats({
        totalUsers,
        activeUsersToday: activeUsersTodayCount,
        activeUsersWeek: activeUsersWeekCount,
        activeUsersMonth: activeUsersMonthCount,
        totalQuestionsAnswered,
        totalCorrectAnswers,
        globalSuccessRate,
        totalXpDistributed,
        totalToeicTests: totalToeicTests || 0,
        averageToeicScore,
        totalQuestions: totalQuestions || 0,
        questionsPerCategory,
        lessonsPerCategory,
        dailyStats,
        topStreaks,
        previousPeriod,
        categoryDeepDive,
        lessonDeepDive,
        toeicDeepDive,
      });

    } catch (err) {
      console.error('Error loading platform stats:', err);
      setError('Erreur lors du chargement des statistiques');
    }
  }, [range]);

  const loadUsers = useCallback(async (authUsersMap: Map<string, { email: string; full_name: string | null; created_at: string }>) => {
    try {
      // Utiliser les IDs de auth.users comme source principale
      const allUserIds = new Set(authUsersMap.keys());
      
      // Ajouter aussi les IDs des tables de l'app (au cas où)
      const appUserIds = await getAllUniqueUserIds();
      appUserIds.forEach(id => allUserIds.add(id));
      
      if (allUserIds.size === 0) {
        setUsers([]);
        return;
      }

      // Récupérer les dates de création depuis user_streaks (première activité)
      const { data: streaksData } = await supabase
        .from('user_streaks')
        .select('user_id, created_at');
      
      const streakCreatedAtMap = new Map<string, string>();
      streaksData?.forEach(s => {
        if (s.created_at) streakCreatedAtMap.set(s.user_id, s.created_at);
      });

      // Pour chaque utilisateur, récupérer ses stats
      const usersWithStats = await Promise.all(
        Array.from(allUserIds).map(async (userId) => {
          // Stats de catégorie
          const { data: categoryStats } = await supabase
            .from('user_category_stats')
            .select('xp_earned, total_attempted, correct_count')
            .eq('user_id', userId);

          const totalXp = categoryStats?.reduce((sum, s) => sum + (s.xp_earned || 0), 0) || 0;
          const questionsAnswered = categoryStats?.reduce((sum, s) => sum + (s.total_attempted || 0), 0) || 0;
          const correctAnswers = categoryStats?.reduce((sum, s) => sum + (s.correct_count || 0), 0) || 0;
          const successRate = questionsAnswered > 0 ? (correctAnswers / questionsAnswered) * 100 : 0;

          // Streak
          const { data: streakData } = await supabase
            .from('user_streaks')
            .select('current_streak, longest_streak, last_activity_date')
            .eq('user_id', userId)
            .single();

    // TEPITECH tests
          const { data: toeicData, count: toeicCount } = await supabase
            .from('toeic_blanc_results')
            .select('total_score', { count: 'exact' })
            .eq('user_id', userId)
            .order('total_score', { ascending: false })
            .limit(1);

          // Dernière activité
          const { data: lastActivity } = await supabase
            .from('user_progress')
            .select('completed_at')
            .eq('user_id', userId)
            .order('completed_at', { ascending: false })
            .limit(1);

          // Récupérer les infos auth si disponibles
          const authInfo = authUsersMap.get(userId);

          return {
            id: userId,
            email: authInfo?.email || `ID: ${userId.slice(0, 8)}...`,
            full_name: authInfo?.full_name || null,
            created_at: authInfo?.created_at || streakCreatedAtMap.get(userId) || new Date().toISOString(),
            total_xp: totalXp,
            questions_answered: questionsAnswered,
            success_rate: successRate,
            current_streak: streakData?.current_streak || 0,
            longest_streak: streakData?.longest_streak || 0,
            last_activity: lastActivity?.[0]?.completed_at || streakData?.last_activity_date || null,
            toeic_tests_count: toeicCount || 0,
            best_toeic_score: toeicData?.[0]?.total_score || null
          };
        })
      );

      // Trier par XP décroissant
      usersWithStats.sort((a, b) => b.total_xp - a.total_xp);
      setUsers(usersWithStats);

    } catch (err) {
      console.error('Error loading users:', err);
      setError('Erreur lors du chargement des utilisateurs');
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Charger d'abord les utilisateurs auth (source unique de vérité)
    const authUsersMap = await loadAuthUsers();
    
    // Puis charger les stats et la liste en parallèle
    await Promise.all([
      loadPlatformStats(authUsersMap),
      loadUsers(authUsersMap)
    ]);
    
    setLoading(false);
  }, [loadAuthUsers, loadPlatformStats, loadUsers]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return {
    platformStats,
    users,
    loading,
    error,
    refresh: loadAll
  };
}
