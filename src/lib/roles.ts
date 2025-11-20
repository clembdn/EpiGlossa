import { supabase } from './supabase'

export type UserRole = 'admin' | 'student'

/**
 * Récupère le rôle d'un utilisateur depuis la base de données
 * @param userId - L'ID de l'utilisateur Supabase
 * @returns Le rôle de l'utilisateur ou 'student' par défaut
 */
export async function getUserRole(userId: string): Promise<UserRole> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      console.error('Error fetching user role:', error)
      return 'student' // Par défaut, tous les users sont students
    }

    return data.role as UserRole
  } catch (err) {
    console.error('Exception fetching user role:', err)
    return 'student'
  }
}

/**
 * Vérifie si un utilisateur est admin
 * @param userId - L'ID de l'utilisateur Supabase
 * @returns true si l'utilisateur est admin, false sinon
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId)
  return role === 'admin'
}

/**
 * Définit le rôle d'un utilisateur (à utiliser avec précaution, admin only)
 * @param userId - L'ID de l'utilisateur
 * @param role - Le rôle à assigner
 */
export async function setUserRole(userId: string, role: UserRole): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('user_roles')
      .upsert({ user_id: userId, role }, { onConflict: 'user_id' })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message ?? 'Unknown error' }
  }
}
