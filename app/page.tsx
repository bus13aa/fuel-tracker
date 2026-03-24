'use client';

import { useState } from 'react';

export default function Home() {
  const [date, setDate] = useState('');
  const [car, setCar] = useState('');
  const [liters, setLiters] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const res = await fetch('/api/fuel-readings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, car, liters: parseFloat(liters) }),
    });

    if (res.ok) {
      setMessage('✅ Запись сохранена');
      setDate('');
      setCar('');
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
          <input
            type="text"
            id="car"
            value={car}
            onChange={(e) => setCar(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Например: Toyota Camry"
          />
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