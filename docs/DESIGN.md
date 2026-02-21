# LOG

## 2026-02-19

- Added deterministic prebuild content sync from `vault/` into `src/content/` and `public/images/`.
- Enforced generated taxonomy artifacts in build: `src/generated/sections.ts` and `src/generated/groups.ts`.
- Moved group taxonomy source from code to `vault/_config.yaml`.
- Adopted section discovery rule: top-level `vault/` folders prefixed with `_` are excluded from sections.
- Added shared global assets convention: `vault/_assets/` mapped to `public/images/_assets/`.
- Enabled markdown image rewriting for both section-local assets and `_assets` references.
- Added theme toggle icon next to clock (sun/moon) with persisted state across Astro client-side page transitions.

## 2026-02-20

- Sanitized `.env.example` by replacing committed Spotify credential values with placeholders to prevent secret exposure in repository defaults.

## 2026-02-21

- Added project-wide ESLint flat configuration for Astro + TypeScript (including React islands) and standardized npm lint scripts (`lint`, `lint:fix`).
- Switched hidden vault conventions from `_` prefix to `.` prefix for top-level non-section folders and other elements.
- Header carousel shows all sections and keeps the active section centered.
- Sidebar is a grid column on desktop (visible by default), fixed overlay on mobile (toggled by ≡ in header).
- Article pages use a centered, reading-first layout with generous top spacing.
- Removed prev/next article buttons; replaced with peek+snap overscroll — preview strip shows next article title on overscroll, snaps on threshold.
- Desktop status line is fixed at the bottom and remains stable during navigation.
- Theme toggle is in the header area with a larger, easier hit target.
- Navigation transitions avoid fade-only behavior and use directional movement for better spatial continuity.
- Section changes use subtle horizontal movement; article changes use softer vertical movement.
- Section navigation targets canonical article URLs directly and undirected transitions avoid vertical motion.
- Theme changes are smoothly animated, desktop sidebar collapse state is persistent.
- Frontend behavior logic is modularized into dedicated navigation, sidebar, and theme controllers with shared UI constants.
- Sections are always odd count by design convention.
- Spotify now-playing remains server-side and tied to the site owner's account via personal OAuth refresh token; visitor sessions never drive playback data.
- Added one-time Spotify OAuth helper endpoints (`/api/spotify-authorize`, `/api/spotify-callback`) to generate and capture `SPOTIFY_REFRESH_TOKEN`.
- Missing Spotify refresh token is treated as a valid fallback state and keeps widget output as `Silence`.
- Removed explicit Vercel function runtime from `vercel.json`; deployment now relies on Vercel's default Node.js runtime selection for API routes.
- Spotify OAuth callback strategy uses HTTPS Vercel URL in production and `http://localhost` only for local development token bootstrap.
- Added repo-level `.gitignore` override for `src/lib/**` so shared/global ignore rules do not exclude app source modules from commits.
- Disabled Spotify track marquee animation; long now-playing text is clipped with ellipsis instead of scrolling.
- Hid the now-playing widget on mobile viewports (`max-width: 960px`) to keep header controls concise.
- Aligned the desktop status breadcrumb start with the header clock using a shared horizontal offset.
