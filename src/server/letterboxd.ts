import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export type LetterboxdRow = {
  title: string;
  year: number;
  rating: number;
  watchedDate: string;
  url: string;
};

function decodeHtmlEntities(str: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#039;': "'", '&apos;': "'",
  };
  return str.replace(/&(?:amp|lt|gt|quot|apos|#039);/g, (m) => entities[m] || m);
}

function extractTag(xml: string, tag: string): string | null {
  const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`<${escaped}>[\\s]*(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?[\\s]*<\\/${escaped}>`);
  const match = regex.exec(xml);
  return match ? decodeHtmlEntities(match[1].trim()) : null;
}

async function fetchRssEntries(username: string): Promise<LetterboxdRow[]> {
  const response = await fetch(`https://letterboxd.com/${encodeURIComponent(username)}/rss/`);
  if (!response.ok) throw new Error(`Letterboxd RSS fetch failed (${response.status}).`);

  const xml = await response.text();
  const items: LetterboxdRow[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];

    const filmTitle = extractTag(block, 'letterboxd:filmTitle');
    const filmYear = extractTag(block, 'letterboxd:filmYear');
    const memberRating = extractTag(block, 'letterboxd:memberRating');
    const watchedDate = extractTag(block, 'letterboxd:watchedDate');
    const link = extractTag(block, 'link');

    if (!filmTitle || !memberRating) continue;

    const rating = parseFloat(memberRating);
    if (isNaN(rating)) continue;

    items.push({
      title: filmTitle,
      year: filmYear ? parseInt(filmYear, 10) : 0,
      rating,
      watchedDate: watchedDate || '',
      url: link || '',
    });
  }

  return items;
}

function parseCsvLine(line: string): string[] {
  const cols: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      cols.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  cols.push(current);

  return cols;
}

function parseCsvEntries(csvPath: string): LetterboxdRow[] {
  if (!existsSync(csvPath)) return [];

  const csv = readFileSync(csvPath, 'utf-8').replace(/\r/g, '');
  const lines = csv.split('\n');
  if (lines.length < 2) return [];

  const header = parseCsvLine(lines[0]);
  const dateIdx = header.indexOf('Date');
  const nameIdx = header.indexOf('Name');
  const yearIdx = header.indexOf('Year');
  const uriIdx = header.indexOf('Letterboxd URI');
  const ratingIdx = header.indexOf('Rating');

  const rows: LetterboxdRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = parseCsvLine(line);

    const rating = parseFloat(cols[ratingIdx] || '');
    if (isNaN(rating)) continue;

    rows.push({
      title: cols[nameIdx] || '',
      year: parseInt(cols[yearIdx] || '0', 10),
      rating,
      watchedDate: cols[dateIdx] || '',
      url: cols[uriIdx] || '',
    });
  }

  return rows;
}

export async function loadLetterboxdRows(username: string) {
  const csvPath = join(process.cwd(), 'vault', 'assets', 'letterbox', 'ratings.csv');

  const [rssEntries, csvEntries] = await Promise.all([
    fetchRssEntries(username).catch(() => [] as LetterboxdRow[]),
    Promise.resolve(parseCsvEntries(csvPath)),
  ]);

  // Merge: RSS takes priority (newer data), dedup by title+year
  const seen = new Set<string>();
  const merged: LetterboxdRow[] = [];

  for (const entry of [...rssEntries, ...csvEntries]) {
    const key = `${entry.title.toLowerCase()}|${entry.year}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(entry);
  }

  // Filter 4.5+ and sort by rating desc, then by date desc
  const filtered = merged
    .filter((row) => row.rating >= 4.5)
    .sort((a, b) => b.rating - a.rating || b.watchedDate.localeCompare(a.watchedDate));

  return { username, rows: filtered };
}
