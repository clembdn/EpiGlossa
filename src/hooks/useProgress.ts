"use client"

import { useState, useEffect, useCallback } from 'react'
import {
  getCategoryStats,
  getGlobalStats,
  getCompletedQuestions,
  saveUserAnswer,
  type CategoryStats,
  type GlobalStats,
} from '@/lib/progress'
import { lessonProgressService } from '@/lib/lesson-progress'
import { supabase } from '@/lib/supabase'
import { buildMissions, calculateMissionXp } from '@/lib/missions'

export function useCategoryProgress(category: string) {
  const [stats, setStats] = useState<CategoryStats | null>(null)
  const [completedQuestions, setCompletedQuestions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const loadProgress = async () => {
    setLoading(true)
    const [statsResult, completedResult] = await Promise.all([
      getCategoryStats(category),
      getCompletedQuestions(category)
    ])

    if (statsResult.success && statsResult.stats) {
      setStats(statsResult.stats)
    }

    setCompletedQuestions(completedResult)
    setLoading(false)
  }

  useEffect(() => {
    if (category) {
      loadProgress()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category])

  const submitAnswer = async (questionId: string, isCorrect: boolean) => {
    const result = await saveUserAnswer(category, questionId, isCorrect)
    
    if (result.success) {
      // Recharger les stats après avoir sauvegardé
      await loadProgress()
      return { success: true, xpGained: result.xpGained || 0 }
    }
    
    return { success: false, error: result.error }
  }

  const isQuestionCompleted = (questionId: string) => {
    return completedQuestions.includes(questionId)
  }

  return {
    stats,
    completedQuestions,
    loading,
    submitAnswer,
    isQuestionCompleted,
    refresh: loadProgress
  }
}

export function useGlobalProgress() {
  const [stats, setStats] = useState<GlobalStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [lessonXp, setLessonXp] = useState(0)
  const [missionXp, setMissionXp] = useState(0)

  const loadStats = useCallback(async () => {
    setLoading(true)
    const result = await getGlobalStats()

    if (result.success && result.stats) {
      setStats(result.stats)
    }

    setLoading(false)
  }, [])

  const loadLessonXp = useCallback(async () => {
    try {
      const total = await lessonProgressService.getTotalXpFromSupabase()
      setLessonXp(total)
    } catch {
      setLessonXp(lessonProgressService.getTotalXP())
    }
  }, [])

  const loadMissionXp = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setMissionXp(0)
        return
      }

      const [{ data: streakData }, { data: lessonsData }, { data: toeicData }] = await Promise.all([
        supabase.from('user_streaks').select('current_streak').eq('user_id', user.id).maybeSingle(),
        supabase.from('lesson_progress').select('completed, score').eq('user_id', user.id),
        supabase.from('toeic_blanc_results').select('id').eq('user_id', user.id),
      ])

      const lessonsCompleted = lessonsData?.filter((l) => l.completed).length ?? 0
      const perfectLessons = lessonsData?.filter((l) => l.completed && l.score === 100).length ?? 0
      const currentStreak = streakData?.current_streak ?? 0
      const toeicCount = toeicData?.length ?? 0

      const missions = buildMissions({ lessonsCompleted, currentStreak, toeicCount, perfectLessons })
      setMissionXp(calculateMissionXp(missions))
    } catch {
      setMissionXp(0)
    }
  }, [])

  useEffect(() => {
    loadStats()
    loadLessonXp()
    loadMissionXp()
  }, [loadStats, loadLessonXp, loadMissionXp])

  useEffect(() => {
    const unsubscribe = lessonProgressService.subscribeToChanges(() => {
      loadLessonXp()
      loadMissionXp()
    })
    return unsubscribe
  }, [loadLessonXp, loadMissionXp])

  const baseXp = stats?.total_xp ?? 0
  const combinedStats = stats
    ? { ...stats, total_xp: baseXp + lessonXp + missionXp }
    : null

  return {
    stats: combinedStats,
    loading,
    refresh: async () => {
      await Promise.all([loadStats(), loadLessonXp(), loadMissionXp()])
    },
    lessonXp,
    missionXp,
    baseXp,
  }
}
