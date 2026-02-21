'use client';

import { Fragment, useEffect, useState } from 'react';

type Row = {
  videoId: string;
  title: string;
  url: string;
  uploadedAt: string;
  views: number;
  channelTitle: string;
  channelUrl: string;
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
        <colgroup>
          <col className="youtube-col-title" />
          <col className="youtube-col-date" />
          <col className="youtube-col-channel" />
        </colgroup>
        <thead>
          <tr>
            <th>Name</th>
            <th className="youtube-col-date">Upload date</th>
            <th>Channel</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <Fragment key={row.videoId}>
              <tr className="youtube-row-main">
                <td className="youtube-cell-title">
                  <a href={row.url} target="_blank" rel="noreferrer" className="youtube-title-link" title={row.title}>
                    {row.title}
                  </a>
                </td>
                <td className="youtube-cell-date" title={row.uploadedAt}>{row.uploadedAt}</td>
                <td className="youtube-cell-channel">
                  <a href={row.channelUrl} target="_blank" rel="noreferrer" className="youtube-channel-link">
                    {row.channelTitle}
                  </a>
                </td>
              </tr>
              <tr className="youtube-row-notes">
                <td colSpan={3} className="youtube-notes-cell">
                  <em>{row.note?.trim() ? row.note : '---'}</em>
                </td>
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
