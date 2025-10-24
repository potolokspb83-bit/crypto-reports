import { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Crypto Reports - Самонаполняющийся сайт с отчётами по крипте',
  description: 'Актуальные цены, прогнозы и анализ криптовалют от AI. Обновляется автоматически.',
  verification: {
    google: '6jqfac7yPFEms07QvwfwU9i1889NiqaSqwzjSNwous0',
    yandex: '49baec880e26d8ff'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen flex flex-col">
        {/* Header с навигацией и поиском */}
        <header className="bg-gray-900 border-b border-gray-600 p-4">
          <div className="container">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold text-orange-400">
                Crypto Reports
              </Link>
              <form action="/report" className="flex-1 max-w-md ml-8">
                <input
                  type="text"
                  name="q"
                  placeholder="Введите запрос (например, цена биткоина)"
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400"
                />
              </form>
              <nav className="space-x-4">
                <Link href="/" className="text-gray-300 hover:text-orange-400">Главная</Link>
                <Link href="/sitemap.xml" className="text-gray-300 hover:text-orange-400">Sitemap</Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Основной контент */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 border-t border-gray-600 p-4 mt-auto">
          <div className="container">
            <p className="text-center text-gray-400">
              © 2025 Crypto Reports. Данные из CryptoCompare и GigaChat. Не финансовый совет.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
