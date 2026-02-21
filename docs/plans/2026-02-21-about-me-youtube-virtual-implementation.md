# About Me YouTube Virtual Article Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a virtual `about_me` article at `/about_me/youtube` that dynamically fetches playlist videos and renders title, upload date, view count, and notes from `vault/about_me/.youtube.md`.

**Architecture:** Keep markdown docs as-is and introduce one synthetic doc in the content helper layer for the YouTube page. Route rendering branches on this virtual slug and loads live data from a small YouTube service module that merges API metadata with `.youtube.md` notes.

**Tech Stack:** Astro, TypeScript, YouTube Data API v3 (fetch), Node fs/path parsing for `.youtube.md`.

---

### Task 1: Add Virtual Doc Support In Content Layer

**Files:**
- Modify: `src/lib/content.ts`
- Modify: `src/pages/[section]/index.astro`

**Step 1: Write failing behavior check**
- Add a lightweight assertion path in code (temporary console/assert during local run) expecting `about_me` docs list to include slug `youtube`.

**Step 2: Run check to verify it fails**
Run: `npm run build`
Expected: route generation does not include `/about_me/youtube` yet.

**Step 3: Implement minimal support**
- Add a virtual doc type in `src/lib/content.ts`.
- Add helper that appends `{ section: 'about_me', slug: 'youtube', title: 'youtube', ... }`.
- Update section redirect logic to work with mixed markdown + virtual docs.

**Step 4: Run check to verify it passes**
Run: `npm run build`
Expected: static path includes `/about_me/youtube` (or route can resolve once dynamic rendering step is added).

**Step 5: Commit**
```bash
git add src/lib/content.ts src/pages/[section]/index.astro
git commit -m "feat: add virtual docs support for about me routes"
```

### Task 2: Add YouTube + Notes Data Service

**Files:**
- Create: `src/lib/youtube.ts`
- Create: `vault/about_me/.youtube.md` (seed format)

**Step 1: Write failing behavior check**
- Add unit-like runtime checks in the module for parsing `.youtube.md` and extracting playlist ID + notes map.

**Step 2: Run check to verify it fails**
Run: `npm run build`
Expected: parser missing/invalid import until module is implemented.

**Step 3: Implement minimal support**
- Parse frontmatter `playlist` URL and line entries `video_url | note`.
- Resolve video IDs from URLs.
- Fetch playlist items + video statistics (`snippet`, `contentDetails`, `statistics`).
- Return normalized rows: `videoId`, `title`, `publishedAt`, `viewCount`, `url`, `note`.
- Return structured error states for missing key/file/playlist.

**Step 4: Run check to verify it passes**
Run: `npm run build`
Expected: module compiles and handles missing API key without crashing.

**Step 5: Commit**
```bash
git add src/lib/youtube.ts vault/about_me/.youtube.md
git commit -m "feat: add youtube playlist and notes loader"
```

### Task 3: Render Virtual YouTube Article In Route

**Files:**
- Modify: `src/pages/[section]/[slug].astro`
- Modify: `src/layouts/BaseLayout.astro` (only if needed for title/meta handling)
- Modify: `src/styles/global.css`

**Step 1: Write failing behavior check**
Run: `npm run build`
Expected: `/about_me/youtube` cannot render virtual content branch yet.

**Step 2: Implement minimal render branch**
- Detect virtual doc slug `youtube`.
- Set `export const prerender = false;` for request-time fetch.
- Load rows from `src/lib/youtube.ts`.
- Render IBM-directory-inspired table:
  - column headers for name/date/views/notes
  - monospace rows, underlined links, subtle horizontal rules
- Preserve existing layout/sidebar/section behavior.

**Step 3: Run checks**
Run: `npm run sync:content`
Run: `npm run check:content`
Run: `npm run build`
Expected: all commands pass.

**Step 4: Commit**
```bash
git add src/pages/[section]/[slug].astro src/styles/global.css src/layouts/BaseLayout.astro
git commit -m "feat: render dynamic about me youtube virtual article"
```

### Task 4: Log Design Decision

**Files:**
- Modify: `docs/DESIGN.md`

**Step 1: Add decision log bullet**
- Add a concise 2026-02-21 bullet documenting virtual `about_me` YouTube article + `.youtube.md` notes integration.

**Step 2: Verify**
Run: `npm run build`
Expected: unaffected, build passes.

**Step 3: Commit**
```bash
git add docs/DESIGN.md docs/plans/2026-02-21-about-me-youtube-virtual-design.md docs/plans/2026-02-21-about-me-youtube-virtual-implementation.md
git commit -m "docs: add youtube virtual article design and implementation plan"
```
