import { supabase } from './supabase'

export interface UserProgress {
  id: string
  user_id: string
  category: string
  question_id: string
  is_correct: boolean
  completed_at: string
  updated_at: string
}

export interface CategoryStats {
  category: string
  total_attempted: number
  correct_count: number
  xp_earned: number
  success_rate: number
}

export interface GlobalStats {
  total_attempted: number
  correct_count: number
  total_xp: number
  global_success_rate: number
  categories_attempted: number
}

/**
 * Enregistre ou met à jour une réponse utilisateur
 * @param category - La catégorie (ex: 'audio_with_images')
 * @param questionId - L'ID unique de la question
 * @param isCorrect - Si la réponse est correcte
 */
export async function saveUserAnswer(
  category: string,
  questionId: string,
  isCorrect: boolean
): Promise<{ success: boolean; error?: string; xpGained?: number }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Vérifier si cette question a déjà été répondue correctement
    const { data: existing } = await supabase
      .from('user_progress')
      .select('is_correct')
      .eq('user_id', user.id)
      .eq('category', category)
      .eq('question_id', questionId)
      .maybeSingle()

    // Si déjà correcte, ne rien faire (pas de XP supplémentaire)
    if (existing && existing.is_correct) {
      return { success: true, xpGained: 0 }
    }

    // Sinon, enregistrer/mettre à jour
    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: user.id,
        category,
        question_id: questionId,
        is_correct: isCorrect,
        completed_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,category,question_id'
      })

    if (error) {
      return { success: false, error: error.message }
    }

    // XP gagné uniquement si la réponse est correcte et nouvelle
    const xpGained = isCorrect ? 50 : 0

    return { success: true, xpGained }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
    return { success: false, error: errorMessage }
  }
}

/**
 * Récupère la progression d'un utilisateur pour une catégorie
 * @param category - La catégorie
 */
export async function getUserProgressForCategory(
  category: string
): Promise<{ success: boolean; data?: UserProgress[]; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('category', category)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as UserProgress[] }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
    return { success: false, error: errorMessage }
  }
}

/**
 * Récupère les statistiques d'une catégorie
 * @param category - La catégorie
 */
export async function getCategoryStats(
  category: string
): Promise<{ success: boolean; stats?: CategoryStats; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const { data, error } = await supabase
      .from('user_category_stats')
      .select('*')
      .eq('user_id', user.id)
      .eq('category', category)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      return { success: false, error: error.message }
    }

    if (!data) {
      return { 
        success: true, 
        stats: {
          category,
          total_attempted: 0,
          correct_count: 0,
          xp_earned: 0,
          success_rate: 0
        }
      }
    }

    return { success: true, stats: data as CategoryStats }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
    return { success: false, error: errorMessage }
  }
}

/**
 * Récupère les statistiques globales de l'utilisateur
 */
export async function getGlobalStats(): Promise<{ 
  success: boolean; 
  stats?: GlobalStats; 
  error?: string 
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const { data, error } = await supabase
      .from('user_global_stats')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      return { success: false, error: error.message }
    }

    if (!data) {
      return { 
        success: true, 
        stats: {
          total_attempted: 0,
          correct_count: 0,
          total_xp: 0,
          global_success_rate: 0,
          categories_attempted: 0
        }
      }
    }

    return { success: true, stats: data as GlobalStats }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
    return { success: false, error: errorMessage }
  }
}

/**
 * Vérifie si une question a été répondue correctement
 * @param category - La catégorie
 * @param questionId - L'ID de la question
 */
export async function isQuestionCompleted(
  category: string,
  questionId: string
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return false

    const { data } = await supabase
      .from('user_progress')
      .select('is_correct')
      .eq('user_id', user.id)
      .eq('category', category)
      .eq('question_id', questionId)
      .maybeSingle()

    return data?.is_correct ?? false
  } catch {
    return false
  }
}

/**
 * Récupère toutes les questions complétées d'une catégorie
 * @param category - La catégorie
 */
export async function getCompletedQuestions(
  category: string
): Promise<string[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return []

    const { data } = await supabase
      .from('user_progress')
      .select('question_id')
      .eq('user_id', user.id)
      .eq('category', category)
      .eq('is_correct', true)

    return data?.map(item => item.question_id) ?? []
  } catch {
    return []
  }
}
