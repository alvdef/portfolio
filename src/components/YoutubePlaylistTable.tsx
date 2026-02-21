import { useEffect, useMemo, useState } from 'react';

type Row = {
  videoId: string;
  title: string;
  url: string;
  uploadedAt: string;
  views: number;
  note: string;
};

type Payload = {
  ok: boolean;
  error?: string;
  rows?: Row[];
};

export default function YoutubePlaylistTable() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/youtube-playlist');
        const payload = (await response.json()) as Payload;
        if (cancelled) return;

        if (!payload.ok) {
          setRows([]);
          setError(payload.error ?? 'Failed to load playlist data.');
          return;
        }

        setRows(payload.rows ?? []);
      } catch {
        if (!cancelled) {
          setRows([]);
          setError('Failed to load playlist data.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const formatter = useMemo(() => new Intl.NumberFormat('en-US'), []);

  if (loading) {
    return <p className="youtube-loading">Loading playlist...</p>;
  }

  if (error) {
    return <p className="youtube-error">{error}</p>;
  }

  if (rows.length === 0) {
    return <p className="youtube-empty">No videos found for configured playlist.</p>;
  }

  return (
    <div className="youtube-table-wrap">
      <table className="youtube-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Upload date</th>
            <th>Views</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.videoId}>
              <td>
                <a href={row.url} target="_blank" rel="noreferrer">
                  {row.title}
                </a>
              </td>
              <td>{row.uploadedAt}</td>
              <td>{formatter.format(row.views)}</td>
              <td>{row.note || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
