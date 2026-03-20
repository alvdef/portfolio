# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Next.js dev server
npm run build        # Static build (generates all routes)
npm run lint         # ESLint
npm run lint:fix     # ESLint with auto-fix
```

## Architecture

Markdown-first portfolio on Next.js App Router. Content is authored in an Obsidian vault (`vault/`), parsed at build time, and statically generated.

### Content pipeline

`vault/*.md` → `src/lib/content.ts` (gray-matter + fs walk) → `next-mdx-remote/rsc` → static HTML

- **Slug** = filename without `.md`. **Section** = parent directory name. Both derived from file path, not frontmatter.
- Files/dirs starting with `_` are drafts (gitignored, excluded from build). Files/dirs starting with `.` are config (committed, excluded from content loader).
- Frontmatter requires: `title`, `order`, `date`, `group`. Optional: `tag`, `component`, `playlist`.
- `component: "youtube"` with a `playlist` ID renders `YoutubePlaylistTable` instead of MDX.
- Docs are cached in-memory on first call to `getPublishedDocs()`.

### Multi-article pages

`/[section]/[slug]` renders **all articles in that section** stacked vertically, then scrolls to the requested one. `ArticleObserver` uses `IntersectionObserver` + `history.replaceState()` to sync the URL and sidebar as the user scrolls — no full navigation occurs.

### Client controllers (initialized in `AppRuntime.tsx`)

Three independent controllers manage client state via DOM data attributes and localStorage:

- **Navigation** (`nav-controller.ts`): Vim keys (h/l = section, j/k = article). Sets `data-nav-dir`, `data-nav-axis`, `data-nav-input` on `<html>` for CSS view transitions. Uses `window.__portfolioNavigate` to route through Next.js router.
- **Sidebar** (`sidebar-controller.ts`): Desktop toggle persisted in localStorage. Mobile auto-closes on navigation. Same-section links scroll instead of navigating.
- **Theme** (`theme-controller.ts`): Light/dark toggle. `<html data-theme>` + CSS variables (`--bg`, `--fg`, `--muted`, `--line`). Stored in localStorage.

### Design constraints

Monochrome only. All Tailwind rounded corners, shadows, and gradients are overridden to zero in `tokens.css`. Breakpoint: 960px.

## Environment

Required: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REDIRECT_URI`, `YOUTUBE_API_KEY`. Optional: `SPOTIFY_REFRESH_TOKEN`.
