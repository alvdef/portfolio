'use client';

import { useEffect, useState } from 'react';

type NowPlaying = {
  playing: boolean;
  artist?: string;
  title?: string;
  lastPlayed?: boolean;
};

export default function SpotifyNowPlaying() {
  const [state, setState] = useState<NowPlaying>({ playing: false });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const response = await fetch('/api/spotify-now-playing');
        if (!response.ok) return;
        const data = (await response.json()) as NowPlaying;
        if (!cancelled) setState(data);
      } catch {
        if (!cancelled) setState({ playing: false });
      }
    }

    run();
    const timer = window.setInterval(run, 15_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const playing = state.playing && state.artist && state.title;
  const lastPlayed = !playing && state.lastPlayed && state.artist && state.title;

  if (!playing && !lastPlayed) return null;

  return (
    <div className="mono-widget spotify-now-playing" aria-label="Spotify now playing">
      {playing ? (
        <><span className="spotify-dot">•</span> {state.artist} - {state.title}</>
      ) : (
        <>· last: {state.artist} - {state.title}</>
      )}
    </div>
  );
}
