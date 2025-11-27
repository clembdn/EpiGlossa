import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Créer un client admin avec la service role key pour accéder à auth.users
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET() {
  try {
    // Récupérer tous les utilisateurs depuis auth.users
    const { data: authUsers, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error('Error fetching auth users:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Mapper les données utilisateur
    const users = authUsers.users.map(user => ({
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name || null,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at
    }));

    return NextResponse.json({ users });
  } catch (err) {
    console.error('Error in admin users API:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
