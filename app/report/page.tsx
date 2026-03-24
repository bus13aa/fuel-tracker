'use client';

import { useState, useEffect } from 'react';

interface FuelReading {
  id: number;
  date: string;
  car: string;
  liters: number;
}

export default function ReportPage() {
  const [readings, setReadings] = useState<FuelReading[]>([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [carFilter, setCarFilter] = useState('');
  const [cars, setCars] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (fromDate) params.append('from', fromDate);
    if (toDate) params.append('to', toDate);
    if (carFilter) params.append('car', carFilter);

    const res = await fetch(`/api/fuel-readings?${params.toString()}`);
    const data = await res.json();
    setReadings(data);
    setLoading(false);
  };

  // Загружаем уникальные автомобили для фильтра
  useEffect(() => {
    const fetchCars = async () => {
      const res = await fetch('/api/fuel-readings?cars=true');
      const data = await res.json();
      setCars(data.cars || []);
    };
    fetchCars();
  }, []);

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
            onChange={(e) => setCarFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full"
          >
            <option value="">Все</option>
            {cars.map((car) => (
              <option key={car} value={car}>{car}</option>
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