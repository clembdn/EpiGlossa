import { LessonProgress } from '@/types/lesson';
import { supabase } from './supabase';

const PROGRESS_KEY = 'epiglossa_lesson_progress';
const LESSON_KEY_SEPARATOR = '::';

const buildLessonKey = (category: string, lessonId: number) => `${category}${LESSON_KEY_SEPARATOR}${lessonId}`;

const clampXp = (value: number) => Math.max(0, value || 0);

const applyLessonXpDeltaToGlobalStats = async (userId: string, deltaXp: number) => {
  if (deltaXp <= 0) return;

  try {
    const { data, error } = await supabase
      .from('user_global_stats')
      .select('user_id,total_attempted,correct_count,total_xp,global_success_rate,categories_attempted')
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error reading global stats for XP sync:', error);
      return;
    }

    const currentTotal = clampXp(data?.total_xp);
    const newTotal = clampXp(currentTotal + deltaXp);

    const baseStats = {
      user_id: userId,
      total_attempted: data?.total_attempted ?? 0,
      correct_count: data?.correct_count ?? 0,
      global_success_rate: data?.global_success_rate ?? 0,
      categories_attempted: data?.categories_attempted ?? 0,
    };

    const statsPayload = {
      ...baseStats,
      total_xp: newTotal,
    };

    const { error: upsertError } = await supabase
      .from('user_global_stats')
      .upsert(statsPayload, { onConflict: 'user_id' });

    if (upsertError) {
      console.error('Error updating global stats with lesson XP:', upsertError);
    }
  } catch (err) {
    console.error('Unexpected global XP sync error:', err);
  }
};

type ProgressChangeListener = () => void;
const progressListeners = new Set<ProgressChangeListener>();
let storageListenerInitialized = false;

const notifyProgressListeners = () => {
  progressListeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.error('Lesson progress listener error:', err);
    }
  });
};

const ensureStorageListener = () => {
  if (typeof window === 'undefined' || storageListenerInitialized) return;

  window.addEventListener('storage', (event) => {
    if (event.key === PROGRESS_KEY) {
      notifyProgressListeners();
    }
  });

  storageListenerInitialized = true;
};

// Service hybride : Supabase (si connecté) + localStorage (fallback)
export const lessonProgressService = {
  // Récupérer toute la progression depuis localStorage (pour compatibilité)
  getLocalProgress(): LessonProgress[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(PROGRESS_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Récupérer toute la progression - version synchrone pour compatibilité
  getAllProgress(): LessonProgress[] {
    return this.getLocalProgress();
  },

  // Récupérer toute la progression (Supabase si connecté, sinon localStorage)
  async getAllProgressAsync(): Promise<LessonProgress[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('lesson_progress')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Error fetching lesson progress:', error);
          return this.getLocalProgress();
        }
        
        return (data || []).map(p => ({
          lessonId: p.lesson_id,
          category: p.category,
          completed: p.completed,
          score: p.score,
          xpEarned: p.xp_earned,
          completedAt: p.completed_at ? new Date(p.completed_at) : new Date()
        }));
      }
      
      return this.getLocalProgress();
    } catch {
      return this.getLocalProgress();
    }
  },

  // Récupérer la progression d'une leçon spécifique (synchrone)
  getLessonProgress(category: string, lessonId: number): LessonProgress | null {
    const allProgress = this.getLocalProgress();
    return allProgress.find(p => p.category === category && p.lessonId === lessonId) || null;
  },

  // Récupérer la progression d'une leçon spécifique (async avec Supabase)
  async getLessonProgressAsync(category: string, lessonId: number): Promise<LessonProgress | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('lesson_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('category', category)
          .eq('lesson_id', lessonId)
          .maybeSingle();
        
        if (!error && data) {
          return {
            lessonId: data.lesson_id,
            category: data.category,
            completed: data.completed,
            score: data.score,
            xpEarned: data.xp_earned,
            completedAt: data.completed_at ? new Date(data.completed_at) : new Date()
          };
        }
      }
      
      return this.getLessonProgress(category, lessonId);
    } catch {
      return this.getLessonProgress(category, lessonId);
    }
  },

  // Sauvegarder la progression d'une leçon (localStorage + Supabase)
  async saveLessonProgress(progress: LessonProgress): Promise<void> {
    // Toujours sauvegarder en localStorage pour offline
    const allProgress = this.getLocalProgress();
    const existingIndex = allProgress.findIndex(
      p => p.category === progress.category && p.lessonId === progress.lessonId
    );

    const previousProgress = existingIndex >= 0 ? allProgress[existingIndex] : null;
    const previousXp = clampXp(previousProgress?.xpEarned || 0);
    const safeXpEarned = Math.max(previousXp, clampXp(progress.xpEarned));
    const safeScore = Math.max(previousProgress?.score || 0, progress.score || 0);

    const updatedProgress: LessonProgress = {
      ...previousProgress,
      ...progress,
      xpEarned: safeXpEarned,
      score: safeScore,
      completed: Boolean(previousProgress?.completed || progress.completed),
      completedAt: new Date()
    };

    if (existingIndex >= 0) {
      allProgress[existingIndex] = updatedProgress;
    } else {
      allProgress.push(updatedProgress);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress));
    }

    notifyProgressListeners();

    // Sauvegarder aussi sur Supabase si connecté
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from('lesson_progress')
          .upsert({
            user_id: user.id,
            category: progress.category,
            lesson_id: progress.lessonId,
            completed: updatedProgress.completed,
            score: updatedProgress.score,
            xp_earned: updatedProgress.xpEarned,
            completed_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,category,lesson_id'
          });

        if (error) {
          console.error('Error saving lesson progress to Supabase:', error);
        } else {
          const xpDelta = updatedProgress.xpEarned - previousXp;
          await applyLessonXpDeltaToGlobalStats(user.id, xpDelta);
        }
      }
    } catch (err) {
      console.error('Error saving to Supabase:', err);
    }
  },

  // Marquer une leçon comme complétée
  async completeLesson(category: string, lessonId: number, score: number, xpEarned: number): Promise<void> {
    await this.saveLessonProgress({
      lessonId,
      category,
      completed: score === 100,
      score,
      xpEarned,
      completedAt: new Date()
    });
  },

  // Vérifier si une leçon est complétée
  isLessonCompleted(category: string, lessonId: number): boolean {
    const progress = this.getLessonProgress(category, lessonId);
    return progress?.completed || false;
  },

  // Obtenir le score d'une leçon
  getLessonScore(category: string, lessonId: number): number {
    const progress = this.getLessonProgress(category, lessonId);
    return progress?.score || 0;
  },

  // Calculer les XP totaux gagnés
  getTotalXP(): number {
    const allProgress = this.getLocalProgress();
    return allProgress.reduce((total, p) => total + (p.xpEarned || 0), 0);
  },

  async getTotalXpFromSupabase(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return this.getTotalXP();
      }

      const { data, error } = await supabase
        .from('lesson_progress')
        .select('xp_earned')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching lesson XP from Supabase:', error);
        return this.getTotalXP();
      }

      return (data || []).reduce((sum, record) => sum + clampXp(record.xp_earned || 0), 0);
    } catch (err) {
      console.error('Unexpected error while fetching lesson XP from Supabase:', err);
      return this.getTotalXP();
    }
  },

  // Calculer le pourcentage de progression pour une catégorie
  getCategoryProgress(category: string, totalLessons: number): number {
    const allProgress = this.getLocalProgress();
    const completedLessons = allProgress.filter(
      p => p.category === category && p.completed
    ).length;
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  },

  // Calculer la progression totale
  getTotalProgress(categories: { id: string; totalLessons: number }[]): number {
    const allProgress = this.getLocalProgress();
    const totalLessons = categories.reduce((sum, cat) => sum + cat.totalLessons, 0);
    const completedLessons = allProgress.filter(p => p.completed).length;
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  },

  // Réinitialiser toute la progression
  resetAllProgress(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PROGRESS_KEY);
    }

    notifyProgressListeners();
  },

  subscribeToChanges(listener: ProgressChangeListener): () => void {
    ensureStorageListener();
    progressListeners.add(listener);

    return () => {
      progressListeners.delete(listener);
    };
  },

  // Obtenir les statistiques globales
  getStats() {
    const allProgress = this.getLocalProgress();
    const completed = allProgress.filter(p => p.completed);
    
    return {
      totalLessons: allProgress.length,
      completedLessons: completed.length,
      totalXP: this.getTotalXP(),
      averageScore: completed.length > 0 
        ? Math.round(completed.reduce((sum, p) => sum + p.score, 0) / completed.length)
        : 0
    };
  },

  // Synchroniser localStorage vers Supabase
  async syncLocalToSupabase(): Promise<{ success: boolean; synced: number; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return { success: false, synced: 0, error: 'Non connecté' };

      const localProgress = this.getLocalProgress();
      if (localProgress.length === 0) return { success: true, synced: 0 };

      const { data: remoteProgress, error: remoteError } = await supabase
        .from('lesson_progress')
        .select('lesson_id, category, xp_earned')
        .eq('user_id', user.id);

      if (remoteError) {
        return { success: false, synced: 0, error: remoteError.message };
      }

      const remoteXpMap = new Map<string, number>();
      (remoteProgress || []).forEach((record) => {
        remoteXpMap.set(buildLessonKey(record.category, record.lesson_id), clampXp(record.xp_earned));
      });

      let totalDelta = 0;
      const now = new Date();

      const records = localProgress.map(p => {
        const key = buildLessonKey(p.category, p.lessonId);
        const remoteXp = remoteXpMap.get(key) || 0;
        const safeXp = Math.max(remoteXp, clampXp(p.xpEarned));
        totalDelta += safeXp - remoteXp;

        return {
          user_id: user.id,
          category: p.category,
          lesson_id: p.lessonId,
          completed: p.completed,
          score: p.score,
          xp_earned: safeXp,
          completed_at: p.completedAt ? new Date(p.completedAt).toISOString() : now.toISOString(),
        };
      });

      const { error } = await supabase
        .from('lesson_progress')
        .upsert(records, { onConflict: 'user_id,category,lesson_id' });

      if (error) return { success: false, synced: 0, error: error.message };

      if (totalDelta > 0) {
        await applyLessonXpDeltaToGlobalStats(user.id, totalDelta);
      }

      return { success: true, synced: localProgress.length };
    } catch (err) {
      return { success: false, synced: 0, error: err instanceof Error ? err.message : 'Erreur' };
    }
  }
};
