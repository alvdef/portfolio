# Repository Guidelines

## Mandatory: Corrections Logging
- Treat `docs/DESIGN.md` as a project decision log for reproducibility.
- Log concrete project-level choices.
- Do not log prompt-writing/process guidance or agent-behavior notes.
- Do not log minor quirks that can be inferred from code.
- Keep entries brief and in `-` bullet format, grouped by date.
- If no meaningful project decision/state change happened, add nothing.

## Project Structure & Module Organization
- `src/` contains the Astro app:
- `src/pages/` route files (`index.astro`, `src/pages/[section]/[slug].astro`).
- `src/layouts/` shared page shell (`BaseLayout.astro`).
- `src/components/` Astro and React islands (`ClockWidget.tsx`, `ScrollResistance.tsx`).
- `src/content/` build-time Markdown content generated from the vault source.
- `src/generated/` deterministic generated artifacts (for example `sections.ts`).
- `scripts/` content pipeline scripts (`sync-content.mjs`, `check-content-freshness.mjs`).
- `vault/` local source-of-truth Markdown and assets used by the sync step.
- `api/` Vercel serverless functions (Spotify proxy).
- `public/` static assets served directly.

## Build, Test, and Development Commands
- `npm run sync:content`: Scans `vault/`, injects/normalizes frontmatter, rewrites image paths, and populates `src/content/` + `public/images/`.
- `npm run check:content`: Fails if generated content is missing or stale.
- `npm run dev`: Runs content checks, then starts Astro dev server.
- `npm run build`: Re-syncs content and runs the Astro production build.
- `npm run preview`: Serves the built output locally.

## Coding Style & Naming Conventions
- Use TypeScript/ESM with 2-space indentation and semicolons.
- Keep styles in `src/styles/global.css` and enforce monochrome constraints (`border-radius: 0`, no shadows/gradients).
- Use descriptive, kebab-case filenames for content (`project-alpha.md`) and PascalCase for React components (`SpotifyNowPlaying.tsx`).
- Keep routing and content logic markdown-first; avoid section-specific hardcoding.

## Testing Guidelines
- No formal test suite is configured yet.
- Required verification before changes are considered complete:
- Run `npm run sync:content`, `npm run check:content`, and `npm run build`.
- Manually validate keyboard navigation (`h/j/k/l`), mobile `INDEX ↓` drawer behavior, and markdown rendering.

## Commit & Pull Request Guidelines
- Follow Conventional Commit style shown in history: `feat: ...`, `docs: ...`.
- Keep commits focused by concern (content pipeline, layout, interaction, API).
- PRs should include:
- Purpose and scope summary.
- Validation evidence (commands run + results).
- Screenshots/GIFs for UI/interaction changes (desktop + mobile).

## Security & Configuration Tips
- Do not commit secrets. Use `.env` values from `.env.example` for Spotify OAuth credentials.
- Keep OAuth token handling server-side only (`api/spotify-now-playing.ts`).
- Use always `npm install @package`, never add packages directly to package.json
