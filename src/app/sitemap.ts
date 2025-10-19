import { createClient } from '@supabase/supabase-js';

// Секреты из .env.local
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function sitemap() {
  // Тянем все отчёты из Supabase
  const { data: reports } = await supabase
    .from('reports')
    .select('query, generated_at')
    .order('generated_at', { ascending: false });

  // Генерируем URL (замени baseUrl на твой домен, когда деплоишь)
  const baseUrl = 'http://localhost:3000';  // Для теста; на Vercel — https://твой-сайт.vercel.app
  const sitemapEntries = reports?.map((report) => ({
    url: `${baseUrl}/report?q=${encodeURIComponent(report.query)}`,
    lastModified: new Date(report.generated_at),
    changeFrequency: 'daily',
    priority: 0.8,
  })) || [];

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...sitemapEntries,
  ];
}