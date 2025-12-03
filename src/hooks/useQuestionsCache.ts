"use client"

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Question, ReadingPassage } from '@/types/question'

interface CacheEntry<T> {
  data: T
  timestamp: number
  version: string
}

const CACHE_VERSION = '2.0.0' // Version mise à jour pour le nouveau format RC
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
        // Pour RC : charger depuis Supabase (format individuel) et grouper par image_url
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
        
        // Grouper les questions par image_url pour créer des ReadingPassage
        const passagesMap = new Map<string, ReadingPassage>();
        
        source.forEach((q: any) => {
          // Utiliser image_url comme clé de regroupement
          // Si pas d'image_url, utiliser passage_id ou id (fallback)
          const key = q.image_url || q.passage_id || q.id;
          
          if (!passagesMap.has(key)) {
            passagesMap.set(key, {
              category: 'reading_comprehension',
              image_url: q.image_url || '',
              questions: {},
              explanation: q.explanation || ''
            });
          }
          
          const passage = passagesMap.get(key)!;
          const qNum = q.question_number || (Object.keys(passage.questions).length + 1);
          
          passage.questions[qNum.toString()] = {
            question_text: q.question_text,
            choices: q.choices
          };
          
          // Mettre à jour l'explication si elle est plus complète (parfois stockée sur la 1ère question)
          if (q.explanation && q.explanation.length > passage.explanation.length) {
            passage.explanation = q.explanation;
          }
        });
        
        const passages = Array.from(passagesMap.values());
        
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
