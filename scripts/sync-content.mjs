import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const VAULT_DIR = process.env.CONTENT_VAULT_DIR || path.join(ROOT, 'vault');
const CONTENT_DIR = path.join(ROOT, 'src/content');
const GENERATED_DIR = path.join(ROOT, 'src/generated');
const GENERATED_SECTIONS = path.join(GENERATED_DIR, 'sections.ts');
const PUBLIC_IMAGES = path.join(ROOT, 'public/images');
const MARKER_FILE = path.join(GENERATED_DIR, 'content-sync.json');

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']);

function isMarkdown(filePath) {
  return path.extname(filePath).toLowerCase() === '.md';
}

function isImage(filePath) {
  return IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function listFilesRecursively(directory) {
  const out = [];
  if (!existsSync(directory)) {
    return out;
  }
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      out.push(...listFilesRecursively(fullPath));
    } else {
      out.push(fullPath);
    }
  }
  return out;
}

function parseFrontmatter(input) {
  if (!input.startsWith('---\n')) {
    return { frontmatter: {}, body: input };
  }
  const end = input.indexOf('\n---\n', 4);
  if (end === -1) {
    return { frontmatter: {}, body: input };
  }

  const block = input.slice(4, end).trim();
  const body = input.slice(end + 5);
  const frontmatter = {};

  for (const line of block.split('\n')) {
    const separator = line.indexOf(':');
    if (separator === -1) {
      continue;
    }
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    frontmatter[key] = value;
  }

  return { frontmatter, body };
}

function stringifyFrontmatter(frontmatter) {
  const lines = ['---'];
  for (const [key, value] of Object.entries(frontmatter)) {
    if (Array.isArray(value)) {
      lines.push(`${key}: [${value.map((v) => JSON.stringify(v)).join(', ')}]`);
      continue;
    }
    if (typeof value === 'number') {
      lines.push(`${key}: ${value}`);
      continue;
    }
    lines.push(`${key}: ${JSON.stringify(String(value))}`);
  }
  lines.push('---', '');
  return lines.join('\n');
}

function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function rewriteImages(markdown, sectionName) {
  let output = markdown;

  output = output.replace(/!\[\[([^\]]+)\]\]/g, (_, raw) => {
    const cleaned = raw.split('|')[0].trim();
    const fileName = path.basename(cleaned);
    const alt = path.basename(fileName, path.extname(fileName));
    return `![${alt}](/images/${sectionName}/${fileName})`;
  });

  output = output.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (full, alt, imagePath) => {
    if (/^https?:\/\//i.test(imagePath) || imagePath.startsWith('/images/')) {
      return full;
    }
    const fileName = path.basename(imagePath.replace(/"/g, '').trim());
    return `![${alt}](/images/${sectionName}/${fileName})`;
  });

  return output;
}

function getSourceHash(files) {
  const hash = crypto.createHash('sha256');
  for (const filePath of files.sort()) {
    hash.update(filePath);
    hash.update(String(statSync(filePath).mtimeMs));
    hash.update(readFileSync(filePath));
  }
  return hash.digest('hex');
}

async function fetchYoutubeVideos(apiKey, playlistId) {
  const endpoint = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
  endpoint.searchParams.set('part', 'snippet,contentDetails');
  endpoint.searchParams.set('maxResults', '50');
  endpoint.searchParams.set('playlistId', playlistId);
  endpoint.searchParams.set('key', apiKey);

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`YouTube fetch failed for playlist ${playlistId}: ${response.status}`);
  }

  const json = await response.json();
  return (json.items ?? []).map((item) => {
    const videoId = item?.contentDetails?.videoId;
    const title = item?.snippet?.title;
    const publishedAt = item?.snippet?.publishedAt;
    return { videoId, title, publishedAt };
  }).filter((item) => item.videoId && item.title && item.publishedAt);
}

if (!existsSync(VAULT_DIR)) {
  throw new Error(`Vault directory not found: ${VAULT_DIR}. Set CONTENT_VAULT_DIR or create ./vault.`);
}

const sections = readdirSync(VAULT_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b));

if (sections.length === 0) {
  throw new Error(`No top-level section directories found in vault: ${VAULT_DIR}`);
}

rmSync(CONTENT_DIR, { recursive: true, force: true });
rmSync(PUBLIC_IMAGES, { recursive: true, force: true });
mkdirSync(CONTENT_DIR, { recursive: true });
mkdirSync(PUBLIC_IMAGES, { recursive: true });
mkdirSync(GENERATED_DIR, { recursive: true });

for (const section of sections) {
  const sourceSection = path.join(VAULT_DIR, section);
  const targetSection = path.join(CONTENT_DIR, section);
  const targetImages = path.join(PUBLIC_IMAGES, section);
  mkdirSync(targetSection, { recursive: true });
  mkdirSync(targetImages, { recursive: true });

  const files = listFilesRecursively(sourceSection);
  for (const sourcePath of files) {
    const relative = path.relative(sourceSection, sourcePath);
    const outPath = path.join(targetSection, relative);

    if (isMarkdown(sourcePath)) {
      mkdirSync(path.dirname(outPath), { recursive: true });
      const input = readFileSync(sourcePath, 'utf8');
      const { frontmatter, body } = parseFrontmatter(input);
      const normalized = {
        ...frontmatter,
        section,
        slug: frontmatter.slug || toSlug(path.basename(sourcePath)),
        title: frontmatter.title || path.basename(sourcePath, '.md'),
        status: frontmatter.status || 'published',
        group: frontmatter.group || 'PERSONAL',
        order: frontmatter.order ? Number(frontmatter.order) : 999,
        date: frontmatter.date || new Date().toISOString().slice(0, 10)
      };

      const rewritten = rewriteImages(body, section);
      writeFileSync(outPath, `${stringifyFrontmatter(normalized)}${rewritten}`);
      continue;
    }

    if (isImage(sourcePath)) {
      const fileName = path.basename(sourcePath);
      cpSync(sourcePath, path.join(targetImages, fileName));
    }
  }
}

const youtubeApiKey = process.env.YOUTUBE_API_KEY;
const youtubePlaylists = (process.env.YOUTUBE_PLAYLIST_IDS ?? '')
  .split(',')
  .map((entry) => entry.trim())
  .filter(Boolean);
const youtubeSection = process.env.YOUTUBE_SECTION && sections.includes(process.env.YOUTUBE_SECTION)
  ? process.env.YOUTUBE_SECTION
  : (sections.includes('msc') ? 'msc' : sections[0]);
const youtubeGroup = process.env.YOUTUBE_GROUP || 'FREE TIME';

if (youtubeApiKey && youtubePlaylists.length > 0) {
  const targetSection = path.join(CONTENT_DIR, youtubeSection);
  mkdirSync(targetSection, { recursive: true });

  for (const playlistId of youtubePlaylists) {
    const videos = await fetchYoutubeVideos(youtubeApiKey, playlistId);
    for (const video of videos) {
      const date = new Date(video.publishedAt).toISOString().slice(0, 10);
      const title = `YT ${video.videoId}`;
      const fileName = `youtube-${video.videoId}.md`;
      const markdown = `${stringifyFrontmatter({
        title,
        slug: `youtube-${video.videoId}`,
        section: youtubeSection,
        group: youtubeGroup,
        order: 9000,
        date,
        status: 'published',
        tag: ['YOUTUBE', playlistId]
      })}# [${date}] | [${video.videoId}] | ${video.title}

<details>
<summary>Reveal video</summary>

<iframe
  src=\"https://www.youtube.com/embed/${video.videoId}?rel=0&controls=1\"
  title=\"${video.title.replaceAll('\"', '&quot;')}\"
  loading=\"lazy\"
  allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\"
  referrerpolicy=\"strict-origin-when-cross-origin\"
  allowfullscreen
></iframe>

</details>
`;
      writeFileSync(path.join(targetSection, fileName), markdown);
    }
  }
}

const sectionsFile = `export const SECTIONS = ${JSON.stringify(sections)} as const;\n`;
writeFileSync(GENERATED_SECTIONS, sectionsFile);

const sourceFiles = listFilesRecursively(VAULT_DIR).filter((p) => isMarkdown(p) || isImage(p));
const sourceHash = getSourceHash(sourceFiles);
writeFileSync(
  MARKER_FILE,
  JSON.stringify(
    {
      sourceHash,
      sections,
      generatedAt: new Date().toISOString()
    },
    null,
    2
  )
);

console.log(`Synced content from ${VAULT_DIR}`);
console.log(`Sections: ${sections.join(', ')}`);
