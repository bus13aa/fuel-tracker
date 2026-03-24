import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Не указаны имя пользователя или пароль' }, { status: 400 });
    }

    // Ищем пользователя в таблице users (без хэширования для простоты)
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, role')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Неверное имя пользователя или пароль' }, { status: 401 });
    }

    // Устанавливаем сессию в cookie (просто сохраняем id и роль)
    cookies().set('userId', user.id.toString(), { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });
    cookies().set('userRole', user.role, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });

    return NextResponse.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}