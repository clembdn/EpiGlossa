import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('epig_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })

    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id)
      .single()

    if (roleError || !roleData) {
      return NextResponse.json({ role: 'student' }, { status: 200 })
    }

    return NextResponse.json({ role: roleData.role }, { status: 200 })
  } catch (err: any) {
    console.error('Error in role API:', err)
    return NextResponse.json({ error: err?.message ?? 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('epig_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })

    // Vérifier que l'utilisateur actuel est admin
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    const { data: currentUserRole, error: currentRoleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id)
      .single()

    if (currentRoleError || currentUserRole?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé - admin uniquement' }, { status: 403 })
    }

    // Récupérer les données de la requête
    const body = await req.json()
    const { userId, role } = body

    if (!userId || !role || !['admin', 'student'].includes(role)) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }

    // Mettre à jour le rôle
    const { error: updateError } = await supabase
      .from('user_roles')
      .upsert({ user_id: userId, role }, { onConflict: 'user_id' })

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Rôle mis à jour' }, { status: 200 })
  } catch (err: any) {
    console.error('Error updating role:', err)
    return NextResponse.json({ error: err?.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
