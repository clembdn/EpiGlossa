import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const PUBLIC_FILE = /(\.|\/)(_next|favicon|public)\/.*$/

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

/**
 * Récupère le rôle d'un utilisateur depuis Supabase
 */
async function getUserRole(userId: string, token: string): Promise<'admin' | 'student'> {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      console.error('Error fetching user role:', error)
      return 'student' // Par défaut
    }

    return data.role as 'admin' | 'student'
  } catch (err) {
    console.error('Exception fetching user role:', err)
    return 'student'
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow next internals, public files, API routes and auth pages
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/public') ||
    pathname.startsWith('/favicon') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next()
  }

  // Check for our session cookie set by the client after login
  const token = req.cookies.get('epig_token')?.value

  if (!token) {
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verify token server-side using Supabase
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })

    const { data, error } = await supabase.auth.getUser()

    if (error || !data?.user) {
      // Token invalid or expired - redirect to login
      const loginUrl = new URL('/auth/login', req.url)
      loginUrl.searchParams.set('from', pathname)
      const response = NextResponse.redirect(loginUrl)
      // Clear the invalid cookie
      response.cookies.set('epig_token', '', { maxAge: 0, path: '/' })
      return response
    }

    // Check if accessing admin routes
    if (pathname.startsWith('/admin')) {
      const userRole = await getUserRole(data.user.id, token)
      
      if (userRole !== 'admin') {
        // Not an admin - redirect to home with error message
        const homeUrl = new URL('/', req.url)
        homeUrl.searchParams.set('error', 'unauthorized')
        return NextResponse.redirect(homeUrl)
      }
    }

    // Token is valid and authorized, allow access
    return NextResponse.next()
  } catch (err) {
    console.error('Error verifying token in middleware:', err)
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
}
