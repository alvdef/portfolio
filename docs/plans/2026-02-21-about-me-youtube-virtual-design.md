# About Me YouTube Virtual Article Design

## Goal
Add a dynamic, non-markdown article under `about_me` at `/about_me/youtube` that lists videos from a configured YouTube playlist with title, upload date, views, and optional notes sourced from `vault/about_me/.youtube.md`.

## Decisions
- Use a **virtual article** in app code (not `src/content` markdown) so it participates in existing sidebar/navigation.
- Fetch YouTube data at **request time** (`prerender = false`) to keep playlist data live.
- Keep notes in `vault/about_me/.youtube.md` using frontmatter + list lines (`url | note`).
- Render data in a compact, table-like style aligned with the existing IBM-inspired visual language.

## Architecture
- Extend content helper layer to expose both markdown docs and virtual docs.
- Add a dedicated renderer branch for virtual doc slug `youtube` in `src/pages/[section]/[slug].astro`.
- Add a small YouTube module to:
  - parse playlist ID from `.youtube.md`
  - fetch playlist items + video stats from YouTube Data API v3
  - merge per-video notes by URL/video ID
- Keep the virtual doc grouped in `about_me` so section landing redirect and sidebar ordering continue to work.

## Data Contract
- `.youtube.md` format:
  - Frontmatter key: `playlist: <url>`
  - Body lines: `<video_url> | <note>`
- Rendered columns:
  - `name` (video title with link)
  - `upload date`
  - `views`
  - `notes`

## Error Handling
- Missing/invalid `.youtube.md`: show clear inline error block in article content.
- Missing `YOUTUBE_API_KEY`: show clear inline warning and empty table state.
- API failures: keep page render successful with error message and no crash.

## Validation
- Run `npm run sync:content`
- Run `npm run check:content`
- Run `npm run build`
- Manual check: `/about_me/youtube` appears in sidebar and renders IBM-style list table.
