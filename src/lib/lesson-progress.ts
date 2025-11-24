import { LessonProgress } from '@/types/lesson';

const PROGRESS_KEY = 'epiglossa_lesson_progress';

export const lessonProgressService = {
  // Récupérer toute la progression
  getAllProgress(): LessonProgress[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(PROGRESS_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Récupérer la progression d'une leçon spécifique
  getLessonProgress(category: string, lessonId: number): LessonProgress | null {
    const allProgress = this.getAllProgress();
    return allProgress.find(
      p => p.category === category && p.lessonId === lessonId
    ) || null;
  },

  // Sauvegarder la progression d'une leçon
  saveLessonProgress(progress: LessonProgress): void {
    const allProgress = this.getAllProgress();
    const existingIndex = allProgress.findIndex(
      p => p.category === progress.category && p.lessonId === progress.lessonId
    );

    if (existingIndex >= 0) {
      allProgress[existingIndex] = {
        ...allProgress[existingIndex],
        ...progress,
        completedAt: new Date()
      };
    } else {
      allProgress.push({
        ...progress,
        completedAt: new Date()
      });
    }

    localStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress));
  },

  // Marquer une leçon comme complétée
  completeLesson(category: string, lessonId: number, score: number, xpEarned: number): void {
    this.saveLessonProgress({
      lessonId,
      category,
      completed: true,
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
    const allProgress = this.getAllProgress();
    return allProgress.reduce((total, p) => total + (p.xpEarned || 0), 0);
  },

  // Calculer le pourcentage de progression pour une catégorie
  getCategoryProgress(category: string, totalLessons: number): number {
    const allProgress = this.getAllProgress();
    const completedLessons = allProgress.filter(
      p => p.category === category && p.completed
    ).length;
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  },

  // Calculer la progression totale
  getTotalProgress(categories: { id: string; totalLessons: number }[]): number {
    const allProgress = this.getAllProgress();
    const totalLessons = categories.reduce((sum, cat) => sum + cat.totalLessons, 0);
    const completedLessons = allProgress.filter(p => p.completed).length;
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  },

  // Réinitialiser toute la progression (pour debug)
  resetAllProgress(): void {
    localStorage.removeItem(PROGRESS_KEY);
  },

  // Obtenir les statistiques globales
  getStats() {
    const allProgress = this.getAllProgress();
    const completed = allProgress.filter(p => p.completed);
    
    return {
      totalLessons: allProgress.length,
      completedLessons: completed.length,
      totalXP: this.getTotalXP(),
      averageScore: completed.length > 0 
        ? Math.round(completed.reduce((sum, p) => sum + p.score, 0) / completed.length)
        : 0
    };
  }
};
