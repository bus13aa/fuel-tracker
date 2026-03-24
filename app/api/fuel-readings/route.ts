import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const { date, car, liters } = await request.json();

    if (!date || !car || liters === undefined) {
      return NextResponse.json(
        { error: 'Не указаны дата, автомобиль или количество литров' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('fuel_readings')
      .insert([{ date, car, liters }])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, id: data[0].id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');
    const car = searchParams.get('car');
    const carsOnly = searchParams.get('cars') === 'true';

    if (carsOnly) {
      // Получаем список уникальных автомобилей
      const { data, error } = await supabase
        .from('fuel_readings')
        .select('car')
        .order('car');

      if (error) throw error;
      const uniqueCars = [...new Map(data.map(item => [item.car, item.car])).values()];
      return NextResponse.json({ cars: uniqueCars });
    }

    // Основной запрос на получение записей
    let query = supabase.from('fuel_readings').select('*');

    if (fromDate) query = query.gte('date', fromDate);
    if (toDate) query = query.lte('date', toDate);
    if (car) query = query.eq('car', car);

    query = query.order('date', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}