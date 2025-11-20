"use client"

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export type UserRole = 'admin' | 'student'

export function useUserRole() {
  const [role, setRole] = useState<UserRole>('student')
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function fetchRole() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setRole('student')
          setIsAdmin(false)
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single()

        if (error || !data) {
          setRole('student')
          setIsAdmin(false)
        } else {
          const userRole = data.role as UserRole
          setRole(userRole)
          setIsAdmin(userRole === 'admin')
        }
      } catch (err) {
        console.error('Error fetching user role:', err)
        setRole('student')
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    fetchRole()
  }, [])

  return { role, isAdmin, loading }
}
