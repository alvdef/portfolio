import { useEffect, useMemo, useState } from 'react';

type NowPlaying = {
  playing: boolean;
  artist?: string;
  title?: string;
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
    const timer = window.setInterval(run, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const text = useMemo(() => {
    if (!state.playing || !state.artist || !state.title) {
      return 'Silence';
    }
    return `• ${state.artist} - ${state.title}`;
  }, [state]);

  return (
    <div className="mono-widget spotify-now-playing" aria-label="Spotify now playing">{text}</div>
  );
}
