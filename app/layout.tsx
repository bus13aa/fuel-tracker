import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/app/components/Navbar';

export const metadata: Metadata = {
  title: 'Учёт топлива',
  description: 'Приложение для учёта расхода топлива',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}