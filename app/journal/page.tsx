'use client';

import { useState, useEffect } from 'react';

interface FuelReading {
  id: number;
  date: string;
  car: string;
  liters: number;
  user: string;
}

export default function JournalPage() {
  const [readings, setReadings] = useState<FuelReading[]>([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [carFilter, setCarFilter] = useState<number | ''>('');
  const [cars, setCars] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => setUserRole(data.user?.role || null));
  }, []);

  const fetchCars = async () => {
    const res = await fetch('/api/fuel-readings?cars=true');
    const data = await res.json();
    setCars(data);
  };

  const fetchReadings = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (fromDate) params.append('from', fromDate);
    if (toDate) params.append('to', toDate);
    if (carFilter) params.append('car_id', String(carFilter));
    const res = await fetch(`/api/fuel-readings?${params.toString()}`);
    const data = await res.json();
    setReadings(data);
    setLoading(false);
  };

  const deleteReading = async (id: number) => {
    if (!confirm('Удалить запись?')) return;
    const res = await fetch(`/api/fuel-readings?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchReadings();
    else alert('Ошибка удаления');
  };

  useEffect(() => {
    fetchCars();
    fetchReadings();
  }, []);

  const totalLiters = readings.reduce((sum, r) => sum + r.liters, 0);

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Журнал операций</h1>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">С даты</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">По дату</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Автомобиль</label>
          <select
            value={carFilter}
            onChange={(e) => setCarFilter(e.target.value ? Number(e.target.value) : '')}
            className="border border-gray-300 rounded px-3 py-2 w-full"
          >
            <option value="">Все</option>
            {cars.map(car => (
              <option key={car.id} value={car.id}>{car.name}</option>
            ))}
          </select>
        </div>
        <div>
          <button
            onClick={fetchReadings}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
          >
            Применить фильтр
          </button>
        </div>
      </div>

      {loading && <p>Загрузка...</p>}
      {!loading && readings.length === 0 && <p>Нет записей.</p>}

      {readings.length > 0 && (
        <>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Дата</th>
                <th className="border border-gray-300 px-4 py-2">Автомобиль</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Литры</th>
                <th className="border border-gray-300 px-4 py-2">Пользователь</th>
                {userRole === 'admin' && <th className="border border-gray-300 px-4 py-2">Действия</th>}
              </tr>
            </thead>
            <tbody>
              {readings.map((r) => (
                <tr key={r.id}>
                  <td className="border border-gray-300 px-4 py-2">{r.date}</td>
                  <td className="border border-gray-300 px-4 py-2">{r.car}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">{r.liters}</td>
                  <td className="border border-gray-300 px-4 py-2">{r.user}</td>
                  {userRole === 'admin' && (
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <button
                        onClick={() => deleteReading(r.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Удалить
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-right font-bold">Общий расход: {totalLiters} л</p>
        </>
      )}
    </main>
  );
}