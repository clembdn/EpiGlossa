import { LessonProgress } from '@/types/lesson';
import { supabase } from './supabase';

const PROGRESS_KEY = 'epiglossa_lesson_progress';

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

    const updatedProgress = { ...progress, completedAt: new Date() };

    if (existingIndex >= 0) {
      allProgress[existingIndex] = { ...allProgress[existingIndex], ...updatedProgress };
    } else {
      allProgress.push(updatedProgress);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress));
    }

    // Sauvegarder aussi sur Supabase si connecté
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase
          .from('lesson_progress')
          .upsert({
            user_id: user.id,
            category: progress.category,
            lesson_id: progress.lessonId,
            completed: progress.completed,
            score: progress.score,
            xp_earned: progress.xpEarned,
            completed_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,category,lesson_id'
          });
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

      const records = localProgress.map(p => ({
        user_id: user.id,
        category: p.category,
        lesson_id: p.lessonId,
        completed: p.completed,
        score: p.score,
        xp_earned: p.xpEarned,
        completed_at: p.completedAt ? new Date(p.completedAt).toISOString() : new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('lesson_progress')
        .upsert(records, { onConflict: 'user_id,category,lesson_id' });

      if (error) return { success: false, synced: 0, error: error.message };
      return { success: true, synced: localProgress.length };
    } catch (err) {
      return { success: false, synced: 0, error: err instanceof Error ? err.message : 'Erreur' };
    }
  }
};
