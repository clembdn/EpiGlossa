'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { buildMissions, calculateMissionXp } from '@/lib/missions';

export interface LeaderboardUser {
  id: string;
  rank: number;
  displayName: string;
  totalXp: number;
  trainingXp: number;
  lessonXp: number;
  missionXp: number;
  questionsAnswered: number;
  successRate: number;
  currentStreak: number;
  longestStreak: number;
  toeicTestsCount: number;
  bestToeicScore: number | null;
  lessonsCompleted: number;
}

export interface LeaderboardData {
  topUsers: LeaderboardUser[];
  currentUser: LeaderboardUser | null;
  totalUsers: number;
}

async function calculateUserXp(userId: string): Promise<{
  trainingXp: number;
  lessonXp: number;
  missionXp: number;
  questionsAnswered: number;
  correctAnswers: number;
  currentStreak: number;
  longestStreak: number;
  toeicTestsCount: number;
  bestToeicScore: number | null;
  lessonsCompleted: number;
  perfectLessons: number;
}> {
  // Fetch all user data in parallel
  const [
    { data: categoryStats },
    { data: lessonProgress },
    { data: streakData },
    { data: toeicResults },
  ] = await Promise.all([
    supabase.from('user_category_stats').select('xp_earned, correct_count, total_attempted').eq('user_id', userId),
    supabase.from('lesson_progress').select('completed, score, xp_earned').eq('user_id', userId),
    supabase.from('user_streaks').select('current_streak, longest_streak').eq('user_id', userId).maybeSingle(),
    supabase.from('toeic_blanc_results').select('total_score').eq('user_id', userId),
  ]);

  // Calculate training XP
  const trainingXp = categoryStats?.reduce((sum, s) => sum + (s.xp_earned || 0), 0) || 0;
  const questionsAnswered = categoryStats?.reduce((sum, s) => sum + (s.total_attempted || 0), 0) || 0;
  const correctAnswers = categoryStats?.reduce((sum, s) => sum + (s.correct_count || 0), 0) || 0;

  // Calculate lesson XP
  const lessonXp = lessonProgress?.reduce((sum, l) => sum + (l.xp_earned || 0), 0) || 0;
  const lessonsCompleted = lessonProgress?.filter(l => l.completed).length || 0;
  const perfectLessons = lessonProgress?.filter(l => l.completed && l.score === 100).length || 0;

  // Streak data
  const currentStreak = streakData?.current_streak || 0;
  const longestStreak = streakData?.longest_streak || 0;

  // TOEIC data
  const toeicTestsCount = toeicResults?.length || 0;
  const bestToeicScore = toeicResults && toeicResults.length > 0
    ? Math.max(...toeicResults.map(t => t.total_score))
    : null;

  // Calculate mission XP
  const missions = buildMissions({ lessonsCompleted, currentStreak, toeicCount: toeicTestsCount, perfectLessons });
  const missionXp = calculateMissionXp(missions);

  return {
    trainingXp,
    lessonXp,
    missionXp,
    questionsAnswered,
    correctAnswers,
    currentStreak,
    longestStreak,
    toeicTestsCount,
    bestToeicScore,
    lessonsCompleted,
    perfectLessons,
  };
}

export function useLeaderboard(topCount: number = 10) {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user: currentAuthUser } } = await supabase.auth.getUser();

      // Fetch all user auth info from API
      const authResponse = await fetch('/api/admin/users');
      const authUsersMap = new Map<string, { email: string; full_name: string | null }>();
      
      if (authResponse.ok) {
        const { users: authUsers } = await authResponse.json();
        authUsers?.forEach((u: { id: string; email: string; full_name: string | null }) => {
          authUsersMap.set(u.id, { email: u.email, full_name: u.full_name });
        });
      }

      // Get all unique user IDs from various tables
      const userIds = new Set<string>();
      
      const [
        { data: streakUsers },
        { data: progressUsers },
        { data: lessonUsers },
      ] = await Promise.all([
        supabase.from('user_streaks').select('user_id'),
        supabase.from('user_category_stats').select('user_id'),
        supabase.from('lesson_progress').select('user_id'),
      ]);

      streakUsers?.forEach(u => userIds.add(u.user_id));
      progressUsers?.forEach(u => userIds.add(u.user_id));
      lessonUsers?.forEach(u => userIds.add(u.user_id));

      // Calculate XP for each user
      const usersWithXp: LeaderboardUser[] = [];

      for (const userId of userIds) {
        const stats = await calculateUserXp(userId);
        const totalXp = stats.trainingXp + stats.lessonXp + stats.missionXp;
        const authInfo = authUsersMap.get(userId);
        
        // Generate display name (anonymized for privacy)
        let displayName = 'Utilisateur';
        if (authInfo?.full_name) {
          displayName = authInfo.full_name;
        } else if (authInfo?.email) {
          // Show first part of email with anonymization
          const emailPart = authInfo.email.split('@')[0];
          if (emailPart.length > 3) {
            displayName = emailPart.substring(0, 3) + '***';
          } else {
            displayName = emailPart + '***';
          }
        }

        const successRate = stats.questionsAnswered > 0
          ? (stats.correctAnswers / stats.questionsAnswered) * 100
          : 0;

        usersWithXp.push({
          id: userId,
          rank: 0, // Will be set after sorting
          displayName,
          totalXp,
          trainingXp: stats.trainingXp,
          lessonXp: stats.lessonXp,
          missionXp: stats.missionXp,
          questionsAnswered: stats.questionsAnswered,
          successRate,
          currentStreak: stats.currentStreak,
          longestStreak: stats.longestStreak,
          toeicTestsCount: stats.toeicTestsCount,
          bestToeicScore: stats.bestToeicScore,
          lessonsCompleted: stats.lessonsCompleted,
        });
      }

      // Sort by total XP descending
      usersWithXp.sort((a, b) => b.totalXp - a.totalXp);

      // Assign ranks
      usersWithXp.forEach((user, index) => {
        user.rank = index + 1;
      });

      // Get top users
      const topUsers = usersWithXp.slice(0, topCount);

      // Find current user
      let currentUser: LeaderboardUser | null = null;
      if (currentAuthUser) {
        currentUser = usersWithXp.find(u => u.id === currentAuthUser.id) || null;
      }

      setData({
        topUsers,
        currentUser,
        totalUsers: usersWithXp.length,
      });
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      setError('Erreur lors du chargement du classement');
    } finally {
      setLoading(false);
    }
  }, [topCount]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  return {
    data,
    loading,
    error,
    refresh: loadLeaderboard,
  };
}
