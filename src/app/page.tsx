import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// Секреты из .env.local
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function Home() {
  // Тянем 5 популярных отчётов из Supabase
  const { data: popularReports } = await supabase
    .from('reports')
    .select('query, generated_at')
    .order('generated_at', { ascending: false })
    .limit(5);

  return (
    <div className="container">
      <section className="text-center py-16">
        <h1 className="text-4xl font-bold mb-4">Crypto Reports</h1>
        <p className="text-xl mb-8">Самонаполняющийся сайт с актуальными отчётами по криптовалютам: цены, AI-прогнозы, графики. Обновляется автоматически!</p>
        <form action="/report" className="max-w-md mx-auto">
          <input
            type="text"
            name="q"
            placeholder="Введите запрос (например, цена биткоина)"
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400"
          />
          <button type="submit" className="mt-2 w-full p-3 bg-orange-500 text-white rounded hover:bg-orange-600">
            Получить отчёт
          </button>
        </form>
      </section>

      <section className="py-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Популярные отчёты</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {popularReports?.map((report) => (
            <Link key={report.query} href={`/report?q=${encodeURIComponent(report.query)}`} className="card">
              <h3 className="font-semibold mb-2">{report.query}</h3>
              <p className="text-sm text-gray-400">Обновлено: {new Date(report.generated_at).toLocaleDateString('ru-RU')}</p>
            </Link>
          )) || (
            <p className="col-span-full text-center text-gray-400">Пока отчётов нет — введите запрос выше!</p>
          )}
        </div>
      </section>

      <section className="py-12 card">
        <h2 className="text-2xl font-bold mb-6">FAQ</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Что это за сайт?</h3>
            <p>Самонаполняющийся ресурс с свежими отчётами по крипте: цены, AI-анализ, графики. Генерируется под ваш запрос.</p>
          </div>
          <div>
            <h3 className="font-semibold">Откуда данные?</h3>
            <p>Цены из CryptoCompare, прогнозы от GigaChat AI, график Chart.js.</p>
          </div>
          <div>
            <h3 className="font-semibold">Как обновляется?</h3>
            <p>Автоматически каждые 24ч или по запросу — свежие данные + уникальный анализ.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

