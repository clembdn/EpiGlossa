import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client with service role or using anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function GET(request: Request) {
  try {
    // Extract token from Authorization header or cookie
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    // Create a Supabase client and verify the token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })

    const { data, error } = await supabase.auth.getUser()

    if (error || !data?.user) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    // Token is valid
    return NextResponse.json({ 
      authenticated: true, 
      user: { 
        id: data.user.id, 
        email: data.user.email 
      } 
    })
  } catch (err) {
    console.error('Error verifying token:', err)
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}
