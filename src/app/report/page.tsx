import { notFound } from 'next/navigation';

interface Props {
  searchParams: { q: string };
}

export default async function ReportPage({ searchParams }: Props) {
  const { q } = searchParams;
  if (!q) return notFound();

  const res = await fetch(`http://localhost:3000/api/report?q=${encodeURIComponent(q)}`);
  const { html, error } = await res.json();

  if (error) return <p style={{ background: 'black', color: 'white', padding: '20px' }}>Ошибка: {error}</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', background: 'black', color: 'white', fontFamily: 'Arial, sans-serif' }}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}