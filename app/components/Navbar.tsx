'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const links = [
    { href: '/', label: 'Ввод расхода' },
    { href: '/report', label: 'Отчёт' },
    { href: '/cars', label: 'Автомобили' },
  ];
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex gap-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`hover:underline ${pathname === link.href ? 'font-bold underline' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}