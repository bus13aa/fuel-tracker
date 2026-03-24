import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  const userId = cookies().get('userId')?.value;
  if (!userId) {
    return NextResponse.json({ user: null });
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('id, username, role')
    .eq('id', userId)
    .single();

  if (error || !user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user });
}