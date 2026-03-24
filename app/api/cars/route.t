import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// POST – добавить автомобиль
export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Не указано название' }, { status: 400 });
    }
    const { data, error } = await supabase
      .from('cars')
      .insert({ name })
      .select();
    if (error) throw error;
    return NextResponse.json({ success: true, id: data[0].id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// PUT – обновить автомобиль
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const { name } = await request.json();

    if (!id || !name) {
      return NextResponse.json({ error: 'Не указан id или название' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('cars')
      .update({ name })
      .eq('id', id)
      .select();
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// DELETE – удалить автомобиль (и связанные записи в fuel_readings)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Не указан id' }, { status: 400 });
    }

    // Сначала удаляем записи о расходе, связанные с этим автомобилем
    await supabase.from('fuel_readings').delete().eq('car_id', id);
    // Затем удаляем сам автомобиль
    const { error } = await supabase.from('cars').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}