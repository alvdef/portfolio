import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

type YoutubeConfig = {
  playlistId: string;
  notesByVideoId: Map<string, string>;
};

export type YoutubeVideoRow = {
  videoId: string;
  title: string;
  url: string;
  uploadedAt: string;
  views: number;
  note: string;
};

function parseFrontmatter(input: string) {
  if (!input.startsWith('---\n')) {
    return { frontmatter: new Map<string, string>(), body: input };
  }

  const end = input.indexOf('\n---\n', 4);
  if (end === -1) {
    return { frontmatter: new Map<string, string>(), body: input };
  }

  const block = input.slice(4, end).trim();
  const body = input.slice(end + 5);
  const entries = new Map<string, string>();

  for (const raw of block.split('\n')) {
    const sep = raw.indexOf(':');
    if (sep === -1) continue;
    const key = raw.slice(0, sep).trim();
    const value = raw
      .slice(sep + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '');
    if (key) entries.set(key, value);
  }

  return { frontmatter: entries, body };
}

function extractPlaylistId(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    const fromList = url.searchParams.get('list');
    if (fromList) return fromList;
  } catch {
    // If it's already a raw id, fall through.
  }

  if (/^[A-Za-z0-9_-]{10,}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

function extractVideoId(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.replace(/^\//, '').split('/')[0];
      return id || null;
    }

    const fromV = url.searchParams.get('v');
    if (fromV) return fromV;

    const parts = url.pathname.split('/').filter(Boolean);
    if (parts[0] === 'shorts' || parts[0] === 'live' || parts[0] === 'embed') {
      return parts[1] ?? null;
    }
  } catch {
    if (/^[A-Za-z0-9_-]{8,}$/.test(trimmed)) {
      return trimmed;
    }
  }

  return null;
}

export function parseYoutubeConfig(markdown: string): YoutubeConfig {
  const { frontmatter, body } = parseFrontmatter(markdown);
  const playlist = frontmatter.get('playlist');
  const playlistId = playlist ? extractPlaylistId(playlist) : null;

  if (!playlistId) {
    throw new Error('Missing or invalid playlist in vault/about_me/.youtube.md frontmatter.');
  }

  const notesByVideoId = new Map<string, string>();

  for (const rawLine of body.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const [videoValue, ...noteParts] = line.split('|');
    if (!videoValue) continue;

    const videoId = extractVideoId(videoValue);
    if (!videoId) continue;

    const note = noteParts.join('|').trim();
    notesByVideoId.set(videoId, note);
  }

  return { playlistId, notesByVideoId };
}

function chunk<T>(items: T[], size: number) {
  const out: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    out.push(items.slice(index, index + size));
  }
  return out;
}

async function fetchPlaylistItems(apiKey: string, playlistId: string) {
  const items: Array<{ videoId: string; position: number }> = [];
  let pageToken: string | null = null;

  do {
    const endpoint = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    endpoint.searchParams.set('part', 'snippet,contentDetails');
    endpoint.searchParams.set('maxResults', '50');
    endpoint.searchParams.set('playlistId', playlistId);
    endpoint.searchParams.set('key', apiKey);
    if (pageToken) endpoint.searchParams.set('pageToken', pageToken);

    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`YouTube playlist fetch failed (${response.status}).`);
    }

    const payload = await response.json();
    for (const item of payload.items ?? []) {
      const videoId = item?.contentDetails?.videoId;
      const position = item?.snippet?.position;
      if (!videoId || typeof position !== 'number') continue;
      items.push({ videoId, position });
    }

    pageToken = payload.nextPageToken ?? null;
  } while (pageToken);

  return items;
}

async function fetchVideoDetails(apiKey: string, videoIds: string[]) {
  const details = new Map<
    string,
    { title: string; uploadedAt: string; views: number }
  >();

  for (const ids of chunk(videoIds, 50)) {
    const endpoint = new URL('https://www.googleapis.com/youtube/v3/videos');
    endpoint.searchParams.set('part', 'snippet,statistics');
    endpoint.searchParams.set('id', ids.join(','));
    endpoint.searchParams.set('key', apiKey);

    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`YouTube video fetch failed (${response.status}).`);
    }

    const payload = await response.json();
    for (const item of payload.items ?? []) {
      const videoId = item?.id;
      const title = item?.snippet?.title;
      const uploadedAt = item?.snippet?.publishedAt;
      const viewsRaw = item?.statistics?.viewCount;
      const views = Number.parseInt(String(viewsRaw ?? '0'), 10);
      if (!videoId || !title || !uploadedAt || Number.isNaN(views)) continue;
      details.set(videoId, { title, uploadedAt, views });
    }
  }

  return details;
}

export async function loadYoutubeRows() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error('Missing YOUTUBE_API_KEY environment variable.');
  }

  const configFile = process.env.YOUTUBE_NOTES_FILE || path.join(process.cwd(), 'vault/about_me/.youtube.md');
  if (!existsSync(configFile)) {
    throw new Error(`Missing notes file: ${configFile}`);
  }

  const markdown = readFileSync(configFile, 'utf8');
  const config = parseYoutubeConfig(markdown);

  const playlistItems = await fetchPlaylistItems(apiKey, config.playlistId);
  const orderedVideoIds = playlistItems.sort((a, b) => a.position - b.position).map((item) => item.videoId);
  const details = await fetchVideoDetails(apiKey, orderedVideoIds);

  const rows: YoutubeVideoRow[] = orderedVideoIds
    .map((videoId) => {
      const meta = details.get(videoId);
      if (!meta) return null;

      return {
        videoId,
        title: meta.title,
        uploadedAt: new Date(meta.uploadedAt).toISOString().slice(0, 10),
        views: meta.views,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        note: config.notesByVideoId.get(videoId) ?? ''
      };
    })
    .filter((row): row is YoutubeVideoRow => Boolean(row));

  return { playlistId: config.playlistId, rows };
}
