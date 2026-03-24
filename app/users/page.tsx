'use client';

import { useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  role: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('user');
  const [message, setMessage] = useState('');

  const loadUsers = async () => {
    const res = await fetch('/api/users');
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: newUsername, password: newPassword, role: newRole }),
    });
    if (res.ok) {
      setNewUsername('');
      setNewPassword('');
      setNewRole('user');
      loadUsers();
      setMessage('✅ Пользователь добавлен');
    } else {
      setMessage('❌ Ошибка добавления');
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Удалить пользователя?')) return;
    const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
    if (res.ok) loadUsers();
    else alert('Ошибка удаления');
  };

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Управление пользователями</h1>
      <form onSubmit={addUser} className="mb-8 space-y-4 border p-4 rounded">
        <div>
          <label className="block text-sm font-medium mb-1">Логин</label>
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Пароль</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Роль</label>
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full"
          >
            <option value="user">Пользователь</option>
            <option value="admin">Администратор</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Добавить
        </button>
      </form>

      <div className="space-y-2">
        {users.map((user) => (
          <div key={user.id} className="flex justify-between items-center border p-3 rounded">
            <span>{user.username} ({user.role})</span>
            <button
              onClick={() => deleteUser(user.id)}
              className="text-red-600 hover:text-red-800"
            >
              Удалить
            </button>
          </div>
        ))}
      </div>
      {message && <p className="mt-4 text-center">{message}</p>}
    </main>
  );
}