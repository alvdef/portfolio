export type YoutubeVideoRow = {
  videoId: string;
  title: string;
  url: string;
  uploadedAt: string;
  channelTitle: string;
  channelUrl: string;
};

function chunk<T>(items: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

async function fetchPlaylistItems(apiKey: string, playlistId: string) {
  const items: Array<{ videoId: string; position: number }> = [];
  let pageToken: string | null = null;

  do {
    const endpoint = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    endpoint.searchParams.set('part', 'contentDetails,snippet');
    endpoint.searchParams.set('maxResults', '50');
    endpoint.searchParams.set('playlistId', playlistId);
    endpoint.searchParams.set('key', apiKey);
    if (pageToken) endpoint.searchParams.set('pageToken', pageToken);

    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`YouTube playlist fetch failed (${response.status}).`);

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
  const details = new Map<string, { title: string; uploadedAt: string; channelTitle: string; channelId: string }>();

  for (const ids of chunk(videoIds, 50)) {
    const endpoint = new URL('https://www.googleapis.com/youtube/v3/videos');
    endpoint.searchParams.set('part', 'snippet');
    endpoint.searchParams.set('id', ids.join(','));
    endpoint.searchParams.set('key', apiKey);

    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`YouTube video fetch failed (${response.status}).`);

    const payload = await response.json();
    for (const item of payload.items ?? []) {
      const videoId = item?.id;
      const title = item?.snippet?.title;
      const uploadedAt = item?.snippet?.publishedAt;
      const channelTitle = item?.snippet?.channelTitle;
      const channelId = item?.snippet?.channelId;
      if (!videoId || !title || !uploadedAt || !channelTitle || !channelId) continue;
      details.set(videoId, { title, uploadedAt, channelTitle, channelId });
    }
  }

  return details;
}

export async function loadYoutubeRows(playlistId: string) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('Missing YOUTUBE_API_KEY environment variable.');

  const playlistItems = await fetchPlaylistItems(apiKey, playlistId);
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
        url: `https://www.youtube.com/watch?v=${videoId}`,
        channelTitle: meta.channelTitle,
        channelUrl: `https://www.youtube.com/channel/${meta.channelId}`,
      };
    })
    .filter((row): row is YoutubeVideoRow => Boolean(row));

  return { playlistId, rows };
}
