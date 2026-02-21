# portfolio

Markdown-first portfolio. Content lives in an Obsidian vault, syncs to Astro at build time, deploys as static HTML to Vercel.

## Stack

Astro 5, React 19 (islands), Tailwind CSS 4, TypeScript.

## Content pipeline

```
vault/           -->  npm run sync:content  -->  src/content/    -->  astro build  -->  dist/
(obsidian)            rewrites images,           (generated md)       static HTML
                      injects frontmatter,
                      generates sections.ts
                      and groups.ts
```

The vault is the source of truth. Each top-level folder becomes a section. Folders starting with `.` are ignored (`.obsidian`, `.notes`, `.assets`). Global images go in `vault/.assets/`.

Group taxonomy is defined in `vault/.config.yaml`.

A SHA256 hash of the vault is stored in `src/generated/content-sync.json`. The build fails if content is stale — forces a fresh sync.

## Frontmatter

Injected automatically by the sync script. You only need to set `title`, `group`, `order`, and `date` in the vault markdown. The rest (`section`, `slug`, `status`) is derived.

## Structure

```
vault/                   # Obsidian vault (source of truth)
src/content/             # Generated markdown (do not edit)
src/generated/           # Generated TS (sections, groups)
src/components/          # Astro + React islands
src/layouts/             # BaseLayout (single shell)
src/pages/               # [section]/[slug].astro routes
src/styles/global.css    # All styles (monochrome theme)
api/                     # Vercel serverless (Spotify proxy)
scripts/                 # sync-content, check-freshness
```

## Navigation

Vim-style: `h`/`l` cycle sections, `j`/`k` cycle articles within a section. Overscrolling past an article boundary peeks the next article title; keep scrolling to snap to it.

## Running

```
cp .env.example .env     # fill in Spotify creds (optional)
npm install
npm run dev              # syncs vault, starts dev server
```

## Environment

Spotify widget requires `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN`. Without them, it shows "Silence".

## Design constraints

Monochrome. No rounded corners, no shadows, no gradients. IBM Plex Sans + Mono. Light/dark toggle persisted in localStorage.
