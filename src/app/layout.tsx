import { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Crypto Reports',
  description: 'Самонаполняющийся сайт с отчётами по криптовалютам',
  verification: {
    google: '6jqfac7yPFEms07QvwfwU9i1889NiqaSqwzjSNwous0',  // Твой Google код
    yandex: '49baec880e26d8ff'  // Твой Yandex код
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
