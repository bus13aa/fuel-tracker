'use client';

import { useState, useEffect } from 'react';

interface Car {
  id: number;
  name: string;
}

export default function Home() {
  const [date, setDate] = useState('');
  const [carId, setCarId] = useState<number | ''>('');
  const [liters, setLiters] = useState('');
  const [message, setMessage] = useState('');
  const [cars, setCars] = useState<Car[]>([]);

  useEffect(() => {
    // Загружаем список автомобилей
    fetch('/api/fuel-readings?cars=true')
      .then(res => res.json())
      .then(data => setCars(data))
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!carId) {
      setMessage('❌ Выберите автомобиль');
      return;
    }

    const res = await fetch('/api/fuel-readings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, car_id: carId, liters: parseFloat(liters) }),
    });

    if (res.ok) {
      setMessage('✅ Запись сохранена');
      setDate('');
      setCarId('');
      setLiters('');
    } else {
      const data = await res.json();
      setMessage(`❌ Ошибка: ${data.error}`);
    }
  };

  return (
    <main className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Учёт расхода топлива</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium mb-1">Дата</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="car" className="block text-sm font-medium mb-1">Автомобиль</label>
          <select
            id="car"
            value={carId}
            onChange={(e) => setCarId(Number(e.target.value))}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Выберите автомобиль</option>
            {cars.map((car) => (
              <option key={car.id} value={car.id}>{car.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="liters" className="block text-sm font-medium mb-1">Литры</label>
          <input
            type="number"
            step="0.01"
            id="liters"
            value={liters}
            onChange={(e) => setLiters(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        >
          Сохранить
        </button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </main>
  );
}