import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabaseClient';

async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  console.log('[getCurrentUser] userId from cookie:', userId);
  if (!userId) return null;
  const numericUserId = Number(userId);
  const { data, error } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', numericUserId)
    .single();
  if (error) {
    console.error('[getCurrentUser] Supabase error:', error);
    return null;
  }
  console.log('[getCurrentUser] user from DB:', data);
  return data;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  console.log('[POST] user =', user);
  if (!user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log('[POST] Received body:', body);

    const { date, car_id, liters } = body;
    if (!date || !car_id || liters === undefined) {
      console.log('[POST] Missing fields');
      return NextResponse.json(
        { error: 'Не указаны дата, автомобиль или количество литров' },
        { status: 400 }
      );
    }

    const insertData = {
      date,
      car_id: Number(car_id),
      liters: Number(liters),
      user_id: Number(user.id)
    };
    console.log('[POST] Insert data:', insertData);

    const { data, error } = await supabase
      .from('fuel_readings')
      .insert([insertData])
      .select();

    if (error) {
      console.error('[POST] Supabase insert error:', error);
      throw error;
    }

    console.log('[POST] Insert success:', data);
    return NextResponse.json({ success: true, id: data[0].id });
  } catch (error) {
    console.error('[POST] Catch error:', error);
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
        car:cars (name),
        user:users (username)
      `)
      .order('date', { ascending: true });

    if (fromDate) query = query.gte('date', fromDate);
    if (toDate) query = query.lte('date', toDate);
    if (car_id) query = query.eq('car_id', Number(car_id));

    if (user.role !== 'admin') {
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query;
    if (error) throw error;

    const formatted = (data as any[]).map((item) => ({
      id: item.id,
      date: item.date,
      car: item.car?.name || 'Неизвестно',
      liters: item.liters,
      user: item.user?.username || 'Неизвестно',
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('[GET] error:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Не указан id' }, { status: 400 });
    }

    if (user.role !== 'admin') {
      const { data: reading, error: fetchError } = await supabase
        .from('fuel_readings')
        .select('user_id')
        .eq('id', id)
        .single();
      if (fetchError || !reading || reading.user_id !== user.id) {
        return NextResponse.json({ error: 'Нет прав на удаление' }, { status: 403 });
      }
    }

    const { error } = await supabase.from('fuel_readings').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE] error:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}