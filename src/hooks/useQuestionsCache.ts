"use client"

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Question, ReadingPassage } from '@/types/question'

interface CacheEntry<T> {
  data: T
  timestamp: number
  version: string
}

const CACHE_VERSION = '1.0.0'
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes en millisecondes

// Clés de cache
const getCacheKey = (category: string) => `questions_cache_${category}`

// Fonction pour vérifier si le cache est valide
const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_DURATION
}

// Fonction pour lire le cache
const readCache = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null
  
  try {
    const cached = localStorage.getItem(key)
    if (!cached) return null
    
    const entry: CacheEntry<T> = JSON.parse(cached)
    
    // Vérifier la version et la validité du cache
    if (entry.version !== CACHE_VERSION || !isCacheValid(entry.timestamp)) {
      localStorage.removeItem(key)
      return null
    }
    
    return entry.data
  } catch (error) {
    console.warn('Erreur lecture cache:', error)
    return null
  }
}

// Fonction pour écrire dans le cache
const writeCache = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') return
  
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION
    }
    localStorage.setItem(key, JSON.stringify(entry))
  } catch (error) {
    console.warn('Erreur écriture cache:', error)
  }
}

// Fonction pour effacer le cache d'une catégorie
export const clearCategoryCache = (category: string): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(getCacheKey(category))
}

// Fonction pour effacer tout le cache des questions
export const clearAllQuestionsCache = (): void => {
  if (typeof window === 'undefined') return
  
  const keys = Object.keys(localStorage)
  keys.forEach(key => {
    if (key.startsWith('questions_cache_')) {
      localStorage.removeItem(key)
    }
  })
}

export function useQuestionsCache(category: string) {
  const [questions, setQuestions] = useState<Question[] | ReadingPassage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fromCache, setFromCache] = useState(false)

  const fetchQuestions = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setLoading(true)
      setError(null)
      
      const cacheKey = getCacheKey(category)
      
      // Essayer de lire depuis le cache si on ne force pas le refresh
      if (!forceRefresh) {
        const cachedData = readCache<Question[] | ReadingPassage[]>(cacheKey)
        if (cachedData && cachedData.length > 0) {
          console.log(`📦 Questions chargées depuis le cache pour ${category}`)
          setQuestions(cachedData)
          setFromCache(true)
          setLoading(false)
          return cachedData
        }
      }
      
      console.log(`🌐 Chargement des questions depuis Supabase pour ${category}`)
      setFromCache(false)
      
      if (category === 'reading_comprehension') {
        // Pour la compréhension écrite : grouper par passage
        const { data, error: fetchError } = await supabase
          .from('questions')
          .select('*')
          .eq('category', category)
          .order('passage_id', { ascending: false })

        if (fetchError) throw fetchError
        const source = data ?? []
        
        if (source.length === 0) {
          setQuestions([])
          setLoading(false)
          return []
        }
        
        // Grouper par passage_id
        const passageMap = new Map<string, ReadingPassage>()
        source.forEach((q) => {
          if (q.passage_id) {
            if (!passageMap.has(q.passage_id)) {
              passageMap.set(q.passage_id, {
                passage_id: q.passage_id,
                image_url: q.image_url,
                questions: [],
              })
            }
            passageMap.get(q.passage_id)!.questions.push(q)
          }
        })
        
        // Convertir en tableau et trier
        const passages = Array.from(passageMap.values()).map(passage => ({
          ...passage,
          questions: passage.questions.sort((a, b) => (a.question_number || 0) - (b.question_number || 0)),
        }))
        
        // Mélanger les passages
        const shuffled = shuffleArray(passages)
        
        // Sauvegarder dans le cache
        writeCache(cacheKey, shuffled)
        setQuestions(shuffled)
        setLoading(false)
        return shuffled
      } else {
        // Pour les autres catégories : questions standard
        const { data, error: fetchError } = await supabase
          .from('questions')
          .select('*')
          .eq('category', category)

        if (fetchError) throw fetchError
        const source = data ?? []
        
        if (source.length === 0) {
          setQuestions([])
          setLoading(false)
          return []
        }

        // Mélanger les questions
        const shuffled = shuffleArray(source)
        
        // Sauvegarder dans le cache
        writeCache(cacheKey, shuffled)
        setQuestions(shuffled)
        setLoading(false)
        return shuffled
      }
    } catch (err) {
      console.error('Erreur chargement questions:', err)
      setError('Impossible de charger les questions')
      setLoading(false)
      return []
    }
  }, [category])

  useEffect(() => {
    if (category) {
      fetchQuestions()
    }
  }, [category, fetchQuestions])

  const refresh = useCallback(() => {
    return fetchQuestions(true)
  }, [fetchQuestions])

  return {
    questions,
    loading,
    error,
    fromCache,
    refresh,
    clearCache: () => clearCategoryCache(category)
  }
}

// Fonction utilitaire pour mélanger un tableau
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
