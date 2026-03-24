'use client';

import { useState, useEffect } from 'react';

interface FuelReading {
  id: number;
  date: string;
  car: string;
  liters: number;
}

interface Car {
  id: number;
  name: string;
}

export default function ReportPage() {
  const [readings, setReadings] = useState<FuelReading[]>([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [carFilter, setCarFilter] = useState<number | ''>('');
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);

  // Загружаем список автомобилей для фильтра
  useEffect(() => {
    fetch('/api/fuel-readings?cars=true')
      .then(res => res.json())
      .then(data => setCars(data))
      .catch(console.error);
  }, []);

  const fetchReport = async () => {
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

  useEffect(() => {
    fetchReport();
  }, []);

  const totalLiters = readings.reduce((sum, r) => sum + r.liters, 0);

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Отчёт по расходу топлива</h1>

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
            {cars.map((car) => (
              <option key={car.id} value={car.id}>{car.name}</option>
            ))}
          </select>
        </div>
        <div>
          <button
            onClick={fetchReport}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
          >
            Применить фильтр
          </button>
        </div>
      </div>

      {loading && <p>Загрузка...</p>}
      {!loading && readings.length === 0 && <p>Нет записей за выбранный период.</p>}

      {readings.length > 0 && (
        <>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Дата</th>
                <th className="border border-gray-300 px-4 py-2">Автомобиль</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Литры</th>
               </tr>
            </thead>
            <tbody>
              {readings.map((r) => (
                <tr key={r.id}>
                  <td className="border border-gray-300 px-4 py-2">{r.date}</td>
                  <td className="border border-gray-300 px-4 py-2">{r.car}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">{r.liters}</td>
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