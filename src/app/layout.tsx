import { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Crypto Reports',
  description: 'Самонаполняющийся сайт с отчётами по криптовалютам',
  verification: {
    google: <meta name="google-site-verification" content="6jqfac7yPFEms07QvwfwU9i1889NiqaSqwzjSNwous0" />  // Замени на свой код от Google
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
