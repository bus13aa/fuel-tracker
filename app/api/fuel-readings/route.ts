import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// POST – добавление записи
export async function POST(request: Request) {
  try {
    const { date, car_id, liters } = await request.json();

    if (!date || !car_id || liters === undefined) {
      return NextResponse.json(
        { error: 'Не указаны дата, автомобиль или количество литров' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('fuel_readings')
      .insert([{ date, car_id, liters }])
      .select('*');

    if (error) throw error;

    return NextResponse.json({ success: true, id: data[0].id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// GET – получение записей и списка автомобилей
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');
    const car_id = searchParams.get('car_id');
    const carsOnly = searchParams.get('cars') === 'true';

    // Возвращаем список автомобилей для выпадающего списка
    if (carsOnly) {
      const { data, error } = await supabase
        .from('cars')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return NextResponse.json(data);
    }

    // Основной запрос: получаем записи с названием автомобиля
    let query = supabase
      .from('fuel_readings')
      .select(`
        id,
        date,
        liters,
        car:cars (name)
      `)
      .order('date', { ascending: true });

    if (fromDate) query = query.gte('date', fromDate);
    if (toDate) query = query.lte('date', toDate);
    if (car_id) query = query.eq('car_id', Number(car_id));

    const { data, error } = await query;
    if (error) throw error;

    // Преобразуем данные в удобный формат (плоский)
    const formatted = data.map(item => ({
      id: item.id,
      date: item.date,
      car: item.car?.name || 'Неизвестно',
      liters: item.liters
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}