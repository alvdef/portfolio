'use client';

import { useEffect, useState } from 'react';

type Row = {
  title: string;
  year: number;
  rating: number;
  watchedDate: string;
  url: string;
};

type Payload = {
  ok: boolean;
  error?: string;
  rows?: Row[];
};

function stars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return '\u2605'.repeat(full) + (half ? '\u00BD' : '');
}

export default function LetterboxdTable({ username }: { username: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/letterboxd?username=${encodeURIComponent(username)}`);
        const payload = (await response.json()) as Payload;
        if (cancelled) return;

        if (!payload.ok) {
          setRows([]);
          setError(payload.error ?? 'Failed to load film data.');
          return;
        }

        setRows(payload.rows ?? []);
      } catch {
        if (!cancelled) {
          setRows([]);
          setError('Failed to load film data.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [username]);

  if (loading) return <p className="youtube-loading">Loading films...</p>;
  if (error) return <p className="youtube-error">{error}</p>;
  if (rows.length === 0) return <p className="youtube-empty">No films found.</p>;

  return (
    <div className="youtube-table-wrap">
      <table className="youtube-table">
        <colgroup>
          <col className="youtube-col-title" />
          <col className="youtube-col-date" />
          <col className="youtube-col-date" />
        </colgroup>
        <thead>
          <tr>
            <th>Film</th>
            <th className="youtube-col-date">Rating</th>
            <th className="youtube-col-date">Date logged</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={`${row.title}-${row.year}-${i}`} className="youtube-row-main">
              <td className="youtube-cell-title">
                <a href={row.url} target="_blank" rel="noreferrer" className="youtube-title-link" title={`${row.title} (${row.year})`}>
                  {row.title} <span className="letterboxd-year">({row.year})</span>
                </a>
              </td>
              <td className="youtube-cell-date">{stars(row.rating)}</td>
              <td className="youtube-cell-date">{row.watchedDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
