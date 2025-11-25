"use client"

import { useState, useEffect } from 'react'
import { 
  getCategoryStats, 
  getGlobalStats, 
  getCompletedQuestions,
  saveUserAnswer,
  type CategoryStats,
  type GlobalStats
} from '@/lib/progress'

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

  const loadStats = async () => {
    setLoading(true)
    const result = await getGlobalStats()

    if (result.success && result.stats) {
      setStats(result.stats)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadStats()
  }, [])

  return {
    stats,
    loading,
    refresh: loadStats
  }
}
