"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const check = async () => {
      // allow auth routes
      const path = window.location.pathname
      if (path.startsWith('/auth')) {
        setChecking(false)
        return
      }

      try {
        const { data } = await supabase.auth.getUser()
        const user = data?.user ?? null
        if (!user) {
          // redirect to login
          router.replace('/auth/login')
          return
        }
      } catch (err) {
        // if any error, redirect to login
        router.replace('/auth/login')
        return
      } finally {
        setChecking(false)
      }
    }

    check()
  }, [router])

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Vérification de l'authentification...</p>
      </div>
    )
  }

  return <>{children}</>
}
