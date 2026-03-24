'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        setUserRole(data.user?.role || null);
        setUsername(data.user?.username || null);
      });
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex gap-6">
          <Link href="/" className={`hover:underline ${pathname === '/' ? 'font-bold underline' : ''}`}>
            Ввод расхода
          </Link>
          <Link href="/journal" className={`hover:underline ${pathname === '/journal' ? 'font-bold underline' : ''}`}>
            Журнал
          </Link>
          {userRole === 'admin' && (
            <>
              <Link href="/cars" className={`hover:underline ${pathname === '/cars' ? 'font-bold underline' : ''}`}>
                Автомобили
              </Link>
              <Link href="/users" className={`hover:underline ${pathname === '/users' ? 'font-bold underline' : ''}`}>
                Пользователи
              </Link>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          {username && <span>{username}</span>}
          <button onClick={handleLogout} className="bg-red-600 px-3 py-1 rounded hover:bg-red-700">
            Выход
          </button>
        </div>
      </div>
    </nav>
  );
}