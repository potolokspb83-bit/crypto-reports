import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';  // Для UUID

// Секреты из .env.local
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key length:', supabaseKey?.length || 'empty');

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Добавь ?q=запрос' }, { status: 400 });
    }

    // Кэш из Supabase
    const { data: cached } = await supabase
      .from('reports')
      .select('*')
      .eq('query', query)
      .single();

    if (cached) {
      return NextResponse.json({ html: cached.html, fromCache: true });
    }

    // Данные из CryptoCompare API
    const response = await fetch('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=BTC&tsyms=USD');
    if (!response.ok) throw new Error('CryptoCompare ошибка');
    const apiData = await response.json();
    const price = apiData.RAW.BTC.USD.PRICE || 0;
    const change = apiData.RAW.BTC.USD.CHANGEPCT24HOUR || 0;

    // Шаг 1: Получаем Access token (Basic + ключ без дополнительного base64)
    const rqUID = crypto.randomUUID();
    const tokenResponse = await fetch('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'RqUID': rqUID,
        'Authorization': `Basic ${process.env.GIGACHAT_API_KEY}`,  // Basic + готовый ключ
      },
      body: 'scope=GIGACHAT_API_PERS',
    });
    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text();
      console.log('Token error:', tokenError);
      throw new Error(`Ошибка токена: ${tokenResponse.status} - ${tokenError}`);
    }
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    console.log('Access token received:', accessToken ? 'Yes' : 'No');

    // Шаг 2: Анализ от GigaChat
    const aiPrompt = `Анализируй цену биткоина: ${price} USD, изменение 24ч: ${change}%. Дай краткий уникальный прогноз на неделю в 100 словах.`;
    const aiResponse = await fetch('https://gigachat.devices.sberbank.ru/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',  // Добавили для JSON
      },
      body: JSON.stringify({
        model: 'GigaChat-2-Pro',  // Точное имя из docs 2025 (Pro версия)
        messages: [{ role: 'user', content: aiPrompt }],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });
    console.log('GigaChat status:', aiResponse.status);
    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.log('GigaChat error body:', errorText);
      throw new Error(`GigaChat статус ${aiResponse.status}: ${errorText}`);
    }
    const aiData = await aiResponse.json();
    const analysis = aiData.choices[0]?.message?.content || 'Анализ недоступен';

  const html = `
  <body style="background: black; color: white; font-family: Arial, sans-serif; margin: 0; padding: 20px;">
    <h1>${query}</h1>
    <p>Текущая цена: $${price.toLocaleString()} USD</p>
    <p>Изменение за 24ч: ${change > 0 ? '+' : ''}${change.toFixed(2)}%</p>
    <div style="border: 1px solid #ccc; padding: 10px; background: #333; color: white;">
      <h2 style="color: white;">AI-Прогноз от GigaChat:</h2>
      <p>${analysis}</p>
    </div>
    <p>Обновлено: ${new Date().toLocaleString('ru-RU')}</p>
    <!-- График цены (чёрный фон) -->
    <canvas id="priceChart" width="400" height="200" style="max-width: 100%; border: 1px solid #ccc; margin: 10px 0; background: black;"></canvas>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
      const ctx = document.getElementById('priceChart').getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['10.10', '11.10', '12.10', '13.10', '14.10', '15.10', '16.10'],
          datasets: [{
            label: 'Цена BTC (USD)',
            data: [112000, 111500, 110800, 110200, 110600, 110900, ${price}],
            borderColor: '#FF9900',
            backgroundColor: 'rgba(255, 153, 0, 0.2)',
            fill: true
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { labels: { color: '#fff' } }  // Светлая легенда
          },
          scales: {
            y: {
              beginAtZero: false,
              title: { display: true, text: 'Цена (USD)', color: '#fff' },
              ticks: { color: '#fff' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' }  // Светлые сетки
            },
            x: {
              title: { display: true, text: 'Дата', color: '#fff' },
              ticks: { color: '#fff' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' }
            }
          },
          backgroundColor: 'black'  // Чёрный фон графика
        }
      });
    </script>
    <p>Источник: CryptoCompare API</p>
  </body>
`;

    // Сохрани в Supabase
    await supabase.from('reports').upsert({
      query,
      html,
      generated_at: new Date().toISOString()
    });

    return NextResponse.json({ html, success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Ошибка: ' + (error as Error).message }, { status: 500 });
  }
}