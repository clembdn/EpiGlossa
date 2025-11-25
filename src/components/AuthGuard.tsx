"use client"

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const check = async () => {
      // allow auth routes
      const path = pathname || window.location.pathname
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
      } catch {
        // if any error, redirect to login
        router.replace('/auth/login')
        return
      } finally {
        setChecking(false)
      }
    }

    check()
  }, [router, pathname])

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Vérification de l&apos;authentification...</p>
      </div>
    )
  }

  return <>{children}</>
}
