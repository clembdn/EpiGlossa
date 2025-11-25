"use client"

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Question } from '@/types/question'

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const CACHE_DURATION = 60 * 60 * 1000 // 1 heure

const getCacheKey = (questionId: string) => `question_${questionId}`

const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_DURATION
}

const readCache = (key: string): Question | null => {
  if (typeof window === 'undefined') return null
  
  try {
    const cached = sessionStorage.getItem(key)
    if (!cached) return null
    
    const entry: CacheEntry<Question> = JSON.parse(cached)
    
    if (!isCacheValid(entry.timestamp)) {
      sessionStorage.removeItem(key)
      return null
    }
    
    return entry.data
  } catch {
    return null
  }
}

const writeCache = (key: string, data: Question): void => {
  if (typeof window === 'undefined') return
  
  try {
    const entry: CacheEntry<Question> = {
      data,
      timestamp: Date.now()
    }
    sessionStorage.setItem(key, JSON.stringify(entry))
  } catch (error) {
    console.warn('Cache write error:', error)
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useSingleQuestionCache(questionId: string, _category: string) {
  const [question, setQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(true)
  const [fromCache, setFromCache] = useState(false)

  const fetchQuestion = useCallback(async () => {
    try {
      setLoading(true)
      
      const cacheKey = getCacheKey(questionId)
      
      // Essayer de lire depuis le cache
      const cachedData = readCache(cacheKey)
      if (cachedData) {
        setQuestion(cachedData)
        setFromCache(true)
        setLoading(false)
        return
      }
      
      setFromCache(false)
      
      // Charger depuis Supabase
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('id', questionId)
        .single()

      if (error) {
        console.warn('Error fetching question:', error.message)
        setQuestion(null)
      } else if (data) {
        writeCache(cacheKey, data)
        setQuestion(data)
      }
    } catch (err) {
      console.error('Error:', err)
      setQuestion(null)
    } finally {
      setLoading(false)
    }
  }, [questionId])

  useEffect(() => {
    if (questionId) {
      fetchQuestion()
    }
  }, [questionId, fetchQuestion])

  return {
    question,
    loading,
    fromCache
  }
}

// Hook pour les passages de lecture (reading comprehension)
export function useReadingPassageCache(passageId: string) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [fromCache, setFromCache] = useState(false)

  const fetchPassage = useCallback(async () => {
    try {
      setLoading(true)
      
      const cacheKey = `passage_${passageId}`
      
      // Essayer de lire depuis le cache
      const cached = sessionStorage.getItem(cacheKey)
      if (cached) {
        try {
          const entry: CacheEntry<Question[]> = JSON.parse(cached)
          if (isCacheValid(entry.timestamp)) {
            setQuestions(entry.data)
            setFromCache(true)
            setLoading(false)
            return
          }
        } catch {}
      }
      
      setFromCache(false)
      
      // Charger depuis Supabase
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('passage_id', passageId)
        .order('question_number', { ascending: true })

      if (error) {
        console.warn('Error fetching passage:', error.message)
        setQuestions([])
      } else if (data) {
        const entry: CacheEntry<Question[]> = {
          data,
          timestamp: Date.now()
        }
        sessionStorage.setItem(cacheKey, JSON.stringify(entry))
        setQuestions(data)
      }
    } catch (err) {
      console.error('Error:', err)
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }, [passageId])

  useEffect(() => {
    if (passageId) {
      fetchPassage()
    }
  }, [passageId, fetchPassage])

  return {
    questions,
    loading,
    fromCache
  }
}
