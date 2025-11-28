import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Supabase service role key missing on server.' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { userId, totalScore, listeningScore, readingScore } = body || {};

    if (!userId || typeof totalScore !== 'number' || typeof listeningScore !== 'number' || typeof readingScore !== 'number') {
      return NextResponse.json(
        { error: 'Invalid payload. Expect userId and numeric scores.' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('toeic_blanc_results')
      .insert({
        user_id: userId,
        total_score: totalScore,
        listening_score: listeningScore,
        reading_score: readingScore,
      });

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Unknown Supabase error.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error in TOEIC results API:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
