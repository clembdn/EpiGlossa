'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: 'streak' | 'vocabulary' | 'grammar' | 'toeic' | 'progress' | 'special';
  requirement: number;
  currentProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Mission {
  id: string;
  name: string;
  description: string;
  emoji: string;
  type: 'daily' | 'weekly' | 'challenge';
  requirement: number;
  currentProgress: number;
  completed: boolean;
  xpReward: number;
  expiresAt?: string;
}

interface UseBadgesReturn {
  badges: Badge[];
  missions: Mission[];
  recentUnlocks: Badge[];
  totalBadges: number;
  unlockedCount: number;
  loading: boolean;
}

// Définition des badges disponibles
const BADGE_DEFINITIONS: Omit<Badge, 'currentProgress' | 'unlocked' | 'unlockedAt'>[] = [
  // Badges de streak
  {
    id: 'streak-3',
    name: 'Débutant motivé',
    description: '3 jours consécutifs d\'apprentissage',
    emoji: '🔥',
    category: 'streak',
    requirement: 3,
    rarity: 'common',
  },
  {
    id: 'streak-7',
    name: 'Marathon 7 jours',
    description: 'Une semaine complète sans pause',
    emoji: '⚡',
    category: 'streak',
    requirement: 7,
    rarity: 'rare',
  },
  {
    id: 'streak-14',
    name: 'Persévérant',
    description: '2 semaines de pratique quotidienne',
    emoji: '💪',
    category: 'streak',
    requirement: 14,
    rarity: 'rare',
  },
  {
    id: 'streak-30',
    name: 'Maître de la constance',
    description: 'Un mois entier d\'apprentissage',
    emoji: '🏆',
    category: 'streak',
    requirement: 30,
    rarity: 'epic',
  },
  {
    id: 'streak-100',
    name: 'Légende',
    description: '100 jours consécutifs !',
    emoji: '👑',
    category: 'streak',
    requirement: 100,
    rarity: 'legendary',
  },

  // Badges vocabulaire
  {
    id: 'vocab-10',
    name: 'Premier pas',
    description: '10 questions de vocabulaire réussies',
    emoji: '📚',
    category: 'vocabulary',
    requirement: 10,
    rarity: 'common',
  },
  {
    id: 'vocab-50',
    name: 'Vocabulaire en expansion',
    description: '50 questions de vocabulaire réussies',
    emoji: '📖',
    category: 'vocabulary',
    requirement: 50,
    rarity: 'rare',
  },
  {
    id: 'vocab-200',
    name: 'Maîtrise du vocabulaire',
    description: '200 questions de vocabulaire réussies',
    emoji: '🎓',
    category: 'vocabulary',
    requirement: 200,
    rarity: 'epic',
  },
  {
    id: 'vocab-500',
    name: 'Polyglotte',
    description: '500 questions de vocabulaire réussies',
    emoji: '🌟',
    category: 'vocabulary',
    requirement: 500,
    rarity: 'legendary',
  },

  // Badges grammaire
  {
    id: 'grammar-10',
    name: 'Grammairien débutant',
    description: '10 questions de grammaire réussies',
    emoji: '✏️',
    category: 'grammar',
    requirement: 10,
    rarity: 'common',
  },
  {
    id: 'grammar-50',
    name: 'Règles maîtrisées',
    description: '50 questions de grammaire réussies',
    emoji: '📝',
    category: 'grammar',
    requirement: 50,
    rarity: 'rare',
  },
  {
    id: 'grammar-200',
    name: 'Expert en syntaxe',
    description: '200 questions de grammaire réussies',
    emoji: '🏅',
    category: 'grammar',
    requirement: 200,
    rarity: 'epic',
  },

  // Badges TOEIC
  {
    id: 'toeic-first',
    name: 'Premier TOEIC Blanc',
    description: 'Passe ton premier TOEIC blanc',
    emoji: '🎯',
    category: 'toeic',
    requirement: 1,
    rarity: 'common',
  },
  {
    id: 'toeic-5',
    name: 'Entraînement intensif',
    description: '5 TOEIC blancs complétés',
    emoji: '💼',
    category: 'toeic',
    requirement: 5,
    rarity: 'rare',
  },
  {
    id: 'toeic-score-600',
    name: 'Objectif 600',
    description: 'Atteins 600 points au TOEIC blanc',
    emoji: '🥉',
    category: 'toeic',
    requirement: 600,
    rarity: 'rare',
  },
  {
    id: 'toeic-score-785',
    name: 'Niveau B2',
    description: 'Atteins 785 points au TOEIC blanc',
    emoji: '🥈',
    category: 'toeic',
    requirement: 785,
    rarity: 'epic',
  },
  {
    id: 'toeic-score-945',
    name: 'Excellence TOEIC',
    description: 'Atteins 945+ points au TOEIC blanc',
    emoji: '🥇',
    category: 'toeic',
    requirement: 945,
    rarity: 'legendary',
  },

  // Badges progression
  {
    id: 'xp-100',
    name: 'Collecteur d\'XP',
    description: 'Gagne 100 XP au total',
    emoji: '⭐',
    category: 'progress',
    requirement: 100,
    rarity: 'common',
  },
  {
    id: 'xp-500',
    name: 'Chasseur d\'XP',
    description: 'Gagne 500 XP au total',
    emoji: '💫',
    category: 'progress',
    requirement: 500,
    rarity: 'rare',
  },
  {
    id: 'xp-2000',
    name: 'Maître XP',
    description: 'Gagne 2000 XP au total',
    emoji: '✨',
    category: 'progress',
    requirement: 2000,
    rarity: 'epic',
  },
  {
    id: 'lessons-5',
    name: 'Explorateur',
    description: 'Termine 5 leçons',
    emoji: '🗺️',
    category: 'progress',
    requirement: 5,
    rarity: 'common',
  },
  {
    id: 'lessons-20',
    name: 'Aventurier',
    description: 'Termine 20 leçons',
    emoji: '🧭',
    category: 'progress',
    requirement: 20,
    rarity: 'rare',
  },
  {
    id: 'lessons-50',
    name: 'Conquérant',
    description: 'Termine 50 leçons',
    emoji: '🎖️',
    category: 'progress',
    requirement: 50,
    rarity: 'epic',
  },

  // Badges spéciaux
  {
    id: 'perfect-lesson',
    name: 'Sans faute',
    description: 'Termine une leçon avec 100% de réussite',
    emoji: '💯',
    category: 'special',
    requirement: 1,
    rarity: 'rare',
  },
  {
    id: 'night-owl',
    name: 'Noctambule',
    description: 'Étudie après 23h',
    emoji: '🦉',
    category: 'special',
    requirement: 1,
    rarity: 'rare',
  },
  {
    id: 'early-bird',
    name: 'Lève-tôt',
    description: 'Étudie avant 7h du matin',
    emoji: '🐦',
    category: 'special',
    requirement: 1,
    rarity: 'rare',
  },
];

export function useBadges(userId: string | undefined): UseBadgesReturn {
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalXp: 0,
    vocabCorrect: 0,
    grammarCorrect: 0,
    toeicCount: 0,
    bestToeicScore: 0,
    lessonsCompleted: 0,
    perfectLessons: 0,
    hasNightOwl: false,
    hasEarlyBird: false,
  });
  const [unlockedBadges, setUnlockedBadges] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchStats() {
      setLoading(true);
      try {
        // Récupérer les stats de l'utilisateur
        const [
          { data: streakData },
          { data: progressData },
          { data: toeicData },
          { data: lessonData },
          { data: badgesData },
        ] = await Promise.all([
          // Streak
          supabase
            .from('user_streaks')
            .select('current_streak, longest_streak')
            .eq('user_id', userId)
            .single(),
          // Questions progress
          supabase
            .from('user_question_progress')
            .select('category, correct_count, total_xp')
            .eq('user_id', userId),
          // TOEIC tests
          supabase
            .from('toeic_test_results')
            .select('total_score')
            .eq('user_id', userId),
          // Lessons completed
          supabase
            .from('lesson_progress')
            .select('completed, score')
            .eq('user_id', userId),
          // Badges déjà débloqués
          supabase
            .from('user_badges')
            .select('badge_id, unlocked_at')
            .eq('user_id', userId),
        ]);

        // Calculer les stats
        let vocabCorrect = 0;
        let grammarCorrect = 0;
        let totalXp = 0;

        if (progressData) {
          progressData.forEach((p) => {
            totalXp += p.total_xp || 0;
            if (p.category === 'incomplete_sentences' || p.category === 'text_completion') {
              vocabCorrect += p.correct_count || 0;
            } else if (p.category === 'grammar' || p.category === 'reading_comprehension') {
              grammarCorrect += p.correct_count || 0;
            }
          });
        }

        const toeicCount = toeicData?.length || 0;
        const bestToeicScore = toeicData?.reduce((max, t) => Math.max(max, t.total_score || 0), 0) || 0;

        const lessonsCompleted = lessonData?.filter((l) => l.completed).length || 0;
        const perfectLessons = lessonData?.filter((l) => l.completed && l.score === 100).length || 0;

        // Vérifier heure actuelle pour badges spéciaux
        const currentHour = new Date().getHours();
        const hasNightOwl = currentHour >= 23 || currentHour < 4;
        const hasEarlyBird = currentHour >= 5 && currentHour < 7;

        // Map des badges débloqués
        const unlocked: Record<string, string> = {};
        badgesData?.forEach((b) => {
          unlocked[b.badge_id] = b.unlocked_at;
        });

        setUserStats({
          currentStreak: streakData?.current_streak || 0,
          longestStreak: streakData?.longest_streak || 0,
          totalXp,
          vocabCorrect,
          grammarCorrect,
          toeicCount,
          bestToeicScore,
          lessonsCompleted,
          perfectLessons,
          hasNightOwl,
          hasEarlyBird,
        });
        setUnlockedBadges(unlocked);
      } catch (error) {
        console.error('Error fetching badge stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [userId]);

  // Calculer la progression de chaque badge
  const badges = useMemo<Badge[]>(() => {
    return BADGE_DEFINITIONS.map((def) => {
      let currentProgress = 0;
      let unlocked = false;

      // Calculer la progression selon le type de badge
      switch (def.id) {
        // Streaks
        case 'streak-3':
        case 'streak-7':
        case 'streak-14':
        case 'streak-30':
        case 'streak-100':
          currentProgress = Math.max(userStats.currentStreak, userStats.longestStreak);
          unlocked = currentProgress >= def.requirement;
          break;

        // Vocabulaire
        case 'vocab-10':
        case 'vocab-50':
        case 'vocab-200':
        case 'vocab-500':
          currentProgress = userStats.vocabCorrect;
          unlocked = currentProgress >= def.requirement;
          break;

        // Grammaire
        case 'grammar-10':
        case 'grammar-50':
        case 'grammar-200':
          currentProgress = userStats.grammarCorrect;
          unlocked = currentProgress >= def.requirement;
          break;

        // TOEIC count
        case 'toeic-first':
        case 'toeic-5':
          currentProgress = userStats.toeicCount;
          unlocked = currentProgress >= def.requirement;
          break;

        // TOEIC score
        case 'toeic-score-600':
        case 'toeic-score-785':
        case 'toeic-score-945':
          currentProgress = userStats.bestToeicScore;
          unlocked = currentProgress >= def.requirement;
          break;

        // XP
        case 'xp-100':
        case 'xp-500':
        case 'xp-2000':
          currentProgress = userStats.totalXp;
          unlocked = currentProgress >= def.requirement;
          break;

        // Lessons
        case 'lessons-5':
        case 'lessons-20':
        case 'lessons-50':
          currentProgress = userStats.lessonsCompleted;
          unlocked = currentProgress >= def.requirement;
          break;

        // Spéciaux
        case 'perfect-lesson':
          currentProgress = userStats.perfectLessons;
          unlocked = currentProgress >= def.requirement;
          break;
        case 'night-owl':
          currentProgress = userStats.hasNightOwl ? 1 : 0;
          unlocked = unlockedBadges['night-owl'] !== undefined || userStats.hasNightOwl;
          break;
        case 'early-bird':
          currentProgress = userStats.hasEarlyBird ? 1 : 0;
          unlocked = unlockedBadges['early-bird'] !== undefined || userStats.hasEarlyBird;
          break;
      }

      return {
        ...def,
        currentProgress,
        unlocked,
        unlockedAt: unlockedBadges[def.id],
      };
    });
  }, [userStats, unlockedBadges]);

  // Missions quotidiennes/hebdomadaires
  const missions = useMemo<Mission[]>(() => {
    const today = new Date();
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59);

    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
    endOfWeek.setHours(23, 59, 59);

    return [
      {
        id: 'daily-lesson',
        name: 'Leçon du jour',
        description: 'Termine une leçon aujourd\'hui',
        emoji: '📖',
        type: 'daily',
        requirement: 1,
        currentProgress: userStats.lessonsCompleted > 0 ? 1 : 0, // Simplifié
        completed: userStats.lessonsCompleted > 0,
        xpReward: 20,
        expiresAt: endOfDay.toISOString(),
      },
      {
        id: 'daily-streak',
        name: 'Garde ta flamme',
        description: 'Connecte-toi aujourd\'hui pour maintenir ta série',
        emoji: '🔥',
        type: 'daily',
        requirement: 1,
        currentProgress: userStats.currentStreak > 0 ? 1 : 0,
        completed: userStats.currentStreak > 0,
        xpReward: 10,
        expiresAt: endOfDay.toISOString(),
      },
      {
        id: 'weekly-toeic',
        name: 'TOEIC de la semaine',
        description: 'Fais un TOEIC blanc cette semaine',
        emoji: '🎯',
        type: 'weekly',
        requirement: 1,
        currentProgress: Math.min(userStats.toeicCount, 1),
        completed: userStats.toeicCount > 0,
        xpReward: 50,
        expiresAt: endOfWeek.toISOString(),
      },
      {
        id: 'weekly-lessons',
        name: 'Semaine productive',
        description: 'Termine 5 leçons cette semaine',
        emoji: '📚',
        type: 'weekly',
        requirement: 5,
        currentProgress: Math.min(userStats.lessonsCompleted, 5),
        completed: userStats.lessonsCompleted >= 5,
        xpReward: 75,
        expiresAt: endOfWeek.toISOString(),
      },
      {
        id: 'challenge-perfect',
        name: 'Défi perfection',
        description: 'Obtiens 100% sur une leçon',
        emoji: '💯',
        type: 'challenge',
        requirement: 1,
        currentProgress: Math.min(userStats.perfectLessons, 1),
        completed: userStats.perfectLessons >= 1,
        xpReward: 100,
      },
    ];
  }, [userStats]);

  // Badges récemment débloqués (les 3 derniers)
  const recentUnlocks = useMemo(() => {
    return badges
      .filter((b) => b.unlocked && b.unlockedAt)
      .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
      .slice(0, 3);
  }, [badges]);

  return {
    badges,
    missions,
    recentUnlocks,
    totalBadges: badges.length,
    unlockedCount: badges.filter((b) => b.unlocked).length,
    loading,
  };
}
