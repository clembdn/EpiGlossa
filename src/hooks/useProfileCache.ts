'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface CategoryScore {
  category: string;
  name: string;
  emoji: string;
  score: number;
  maxScore: number;
  percentage: number;
}

interface ToeicTest {
  id: string;
  score: number;
  date: string;
  listening_score: number;
  reading_score: number;
}

interface ProfileData {
  categoryScores: CategoryScore[];
  toeicTests: ToeicTest[];
  timestamp: number;
}

const CACHE_KEY = 'profile_data_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const categoryInfo: Record<string, { name: string; emoji: string }> = {
  'audio_with_images': { name: 'Audio avec Images', emoji: '🎧' },
  'qa': { name: 'Questions & Réponses', emoji: '❓' },
  'short_conversation': { name: 'Conversations Courtes', emoji: '💬' },
  'short_talks': { name: 'Exposés Courts', emoji: '📻' },
  'incomplete_sentences': { name: 'Phrases Incomplètes', emoji: '✍️' },
  'text_completion': { name: 'Complétion de Texte', emoji: '📝' },
  'reading_comprehension': { name: 'Compréhension Écrite', emoji: '📖' },
};

export function useProfileCache(userId: string | undefined) {
  const [categoryScores, setCategoryScores] = useState<CategoryScore[]>([]);
  const [toeicTests, setToeicTests] = useState<ToeicTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromCache, setFromCache] = useState(false);

  const readCache = (): ProfileData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const data: ProfileData = JSON.parse(cached);
      const now = Date.now();

      if (now - data.timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return data;
    } catch {
      return null;
    }
  };

  const writeCache = (data: ProfileData) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Error writing cache:', err);
    }
  };

  const loadData = useCallback(async (useCache = true) => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Essayer de lire le cache d'abord
    if (useCache) {
      const cached = readCache();
      if (cached) {
        setCategoryScores(cached.categoryScores);
        setToeicTests(cached.toeicTests);
        setFromCache(true);
        setLoading(false);
        return;
      }
    }

    setFromCache(false);
    setLoading(true);

    try {
      // Charger toutes les données en parallèle
      const [categoryData, toeicData] = await Promise.all([
        loadCategoryScores(userId),
        loadToeicTests(userId)
      ]);

      setCategoryScores(categoryData);
      setToeicTests(toeicData);

      // Mettre en cache
      writeCache({
        categoryScores: categoryData,
        toeicTests: toeicData,
        timestamp: Date.now()
      });
    } catch (err) {
      console.error('Error loading profile data:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const loadCategoryScores = async (uid: string): Promise<CategoryScore[]> => {
    // Requête unique pour obtenir toutes les stats et tous les counts en parallèle
    const [statsResult, countsResults] = await Promise.all([
      // Toutes les stats utilisateur
      supabase
        .from('user_category_stats')
        .select('*')
        .eq('user_id', uid),
      
      // Tous les counts de questions en parallèle
      Promise.all(
        Object.keys(categoryInfo).map(async (category) => {
          const { count } = await supabase
            .from('questions')
            .select('*', { count: 'exact', head: true })
            .eq('category', category);
          return { category, count: count || 0 };
        })
      )
    ]);

    const statsMap = new Map(
      (statsResult.data || []).map((stat: any) => [stat.category, stat])
    );

    const countsMap = new Map(
      countsResults.map(({ category, count }: any) => [category, count])
    );

    const scores: CategoryScore[] = Object.entries(categoryInfo).map(([category, info]) => {
      const stats = statsMap.get(category);
      const totalCount = countsMap.get(category) || 0;
      const maxScore = (totalCount as number) * 50;
      const currentScore = (stats as any)?.xp_earned || 0;
      const percentage = maxScore > 0 ? (currentScore / maxScore) * 100 : 0;

      return {
        category,
        name: info.name,
        emoji: info.emoji,
        score: currentScore,
        maxScore,
        percentage: Math.min(percentage, 100)
      };
    });

    return scores;
  };

  const loadToeicTests = async (uid: string): Promise<ToeicTest[]> => {
    const { data, error } = await supabase
      .from('toeic_blanc_results')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error || !data) return [];

    return data.map((test: any) => ({
      id: test.id,
      score: test.total_score,
      date: test.created_at,
      listening_score: test.listening_score,
      reading_score: test.reading_score
    }));
  };

  const refresh = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    loadData(false);
  }, [loadData]);

  const clearCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    setCategoryScores([]);
    setToeicTests([]);
    setFromCache(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    categoryScores,
    toeicTests,
    loading,
    fromCache,
    refresh,
    clearCache
  };
}
