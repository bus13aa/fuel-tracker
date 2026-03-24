'use client';

import { useState, useEffect } from 'react';

interface Car {
  id: number;
  name: string;
}

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [message, setMessage] = useState('');

  // Загрузка списка автомобилей
  const loadCars = async () => {
    const res = await fetch('/api/fuel-readings?cars=true');
    const data = await res.json();
    setCars(data);
  };

  useEffect(() => {
    loadCars();
  }, []);

  // Добавление
  const addCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const res = await fetch('/api/cars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName }),
    });
    if (res.ok) {
      setNewName('');
      loadCars();
      setMessage('✅ Автомобиль добавлен');
    } else {
      setMessage('❌ Ошибка добавления');
    }
  };

  // Обновление
  const updateCar = async (id: number) => {
    if (!editingName.trim()) return;
    const res = await fetch(`/api/cars?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingName }),
    });
    if (res.ok) {
      setEditingId(null);
      loadCars();
      setMessage('✅ Автомобиль обновлён');
    } else {
      setMessage('❌ Ошибка обновления');
    }
  };

  // Удаление
  const deleteCar = async (id: number) => {
    if (!confirm('Удалить автомобиль? Все связанные записи о расходе будут удалены!')) return;
    const res = await fetch(`/api/cars?id=${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      loadCars();
      setMessage('✅ Автомобиль удалён');
    } else {
      setMessage('❌ Ошибка удаления');
    }
  };

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Управление автомобилями</h1>

      {/* Форма добавления */}
      <form onSubmit={addCar} className="mb-8 flex gap-2">
        <input
          type="text"
          placeholder="Название автомобиля"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 flex-1"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Добавить
        </button>
      </form>

      {/* Список автомобилей */}
      <div className="space-y-2">
        {cars.map((car) => (
          <div key={car.id} className="flex items-center justify-between border p-3 rounded">
            {editingId === car.id ? (
              <>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 flex-1 mr-2"
                />
                <button
                  onClick={() => updateCar(car.id)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 mr-2"
                >
                  Сохранить
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                >
                  Отмена
                </button>
              </>
            ) : (
              <>
                <span>{car.name}</span>
                <div>
                  <button
                    onClick={() => {
                      setEditingId(car.id);
                      setEditingName(car.name);
                    }}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mr-2"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => deleteCar(car.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Удалить
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      {message && <p className="mt-4 text-center">{message}</p>}
    </main>
  );
}