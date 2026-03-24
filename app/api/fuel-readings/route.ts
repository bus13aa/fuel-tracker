import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabaseClient';

// Вспомогательная функция для получения текущего пользователя
async function getCurrentUser() {
  const userId = cookies().get('userId')?.value;
  if (!userId) return null;
  const { data } = await supabase.from('users').select('id, role').eq('id', userId).single();
  return data;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  try {
    const { date, car_id, liters } = await request.json();
    if (!date || !car_id || liters === undefined) {
      return NextResponse.json({ error: 'Не указаны дата, автомобиль или количество литров' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('fuel_readings')
      .insert([{ date, car_id, liters, user_id: user.id }])
      .select();

    if (error) throw error;
    return NextResponse.json({ success: true, id: data[0].id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');
    const car_id = searchParams.get('car_id');
    const carsOnly = searchParams.get('cars') === 'true';

    if (carsOnly) {
      const { data, error } = await supabase.from('cars').select('id, name').order('name');
      if (error) throw error;
      return NextResponse.json(data);
    }

    let query = supabase
      .from('fuel_readings')
      .select(`
        id,
        date,
        liters,
        user_id,
        car:cars (name),
        user:users (username)
      `)
      .order('date', { ascending: true });

    // Если не админ, показываем только свои записи
    if (user.role !== 'admin') {
      query = query.eq('user_id', user.id);
    }

    if (fromDate) query = query.gte('date', fromDate);
    if (toDate) query = query.lte('date', toDate);
    if (car_id) query = query.eq('car_id', Number(car_id));

    const { data, error } = await query;
    if (error) throw error;

    const formatted = (data as any[]).map(item => ({
      id: item.id,
      date: item.date,
      car: item.car?.name || 'Неизвестно',
      liters: item.liters,
      user: item.user?.username || 'Неизвестно'
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Не указан id' }, { status: 400 });

    // Если не админ, проверяем, что запись принадлежит ему
    if (user.role !== 'admin') {
      const { data: reading } = await supabase
        .from('fuel_readings')
        .select('user_id')
        .eq('id', id)
        .single();
      if (!reading || reading.user_id !== user.id) {
        return NextResponse.json({ error: 'Нет прав на удаление' }, { status: 403 });
      }
    }

    const { error } = await supabase.from('fuel_readings').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}