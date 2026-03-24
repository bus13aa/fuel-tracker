import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabaseClient';

async function checkAdmin() {
  const userId = cookies().get('userId')?.value;
  if (!userId) return false;
  const { data } = await supabase.from('users').select('role').eq('id', userId).single();
  return data?.role === 'admin';
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
  }
  const { data, error } = await supabase.from('users').select('id, username, role').order('id');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
  }
  const { username, password, role } = await request.json();
  if (!username || !password) {
    return NextResponse.json({ error: 'Не указаны логин или пароль' }, { status: 400 });
  }
  const { data, error } = await supabase
    .from('users')
    .insert({ username, password, role: role || 'user' })
    .select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data[0]);
}

export async function DELETE(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Не указан id' }, { status: 400 });
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}