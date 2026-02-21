# portfolio

Markdown-first portfolio on Next.js App Router.

## Stack

Next.js 16, React 19, Contentlayer (MDX), TypeScript.

## Content

Content lives in `content/` and is loaded by Contentlayer.

- Section/article routes come from frontmatter fields (`section`, `slug`, `order`, `status`).
- `content/about_me/.youtube.md` stores the playlist id and optional per-video notes.
- Static assets are served from `public/images/`.

## Structure

```
app/                     # Next routes and API route handlers
content/                 # Markdown/MDX source of truth
src/components/          # React UI components
src/features/            # Client controllers (navigation/sidebar/theme)
src/lib/                 # Content helpers
src/server/              # Server-side Spotify/YouTube helpers
src/styles/              # Monochrome stylesheet modules
public/                  # Static assets
```

## Running

```bash
cp .env.example .env
npm install
npm run dev
```

## Environment

Required:
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REDIRECT_URI`
- `YOUTUBE_API_KEY`

Optional:
- `SPOTIFY_REFRESH_TOKEN`
- `YOUTUBE_NOTES_FILE` (defaults to `content/about_me/.youtube.md`)

Without `SPOTIFY_REFRESH_TOKEN`, now-playing falls back to `Silence`.

## Navigation

Vim-style keys:
- `h`/`l`: previous/next section
- `j`/`k`: next/previous article

Overscroll peek+snap remains enabled for article boundaries.

## Design constraints

Monochrome. No rounded corners, no shadows, no gradients.
