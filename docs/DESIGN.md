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

- Migrated the portfolio runtime from Astro to Next.js App Router using a big-bang replacement strategy.
- Replaced generated Astro content collections with a Contentlayer-backed `content/` source of truth.
- Moved server endpoints to Next Route Handlers while preserving existing API paths and response contracts.
- Standardized content notes lookup for YouTube metadata under `content/about_me/.youtube.md`.
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
- Added a virtual `about_me/youtube` article rendered from code (not markdown) that fetches playlist metadata dynamically and merges note annotations from `vault/about_me/.youtube.md`.
- Article reading column is left-aligned in the content pane and widened (`90ch`) for denser desktop reading.
- YouTube playlist table now uses two rows per video (metadata row + notes row), with single-line ellipsis for long titles and non-wrapping upload dates.
- YouTube playlist metadata columns (`Upload date`, `Views`) are left-biased with auto table sizing, and notes row spacing is tightened to visually pair notes with each video title.
- YouTube playlist table disables horizontal scrolling and uses fixed column sizing so content always fits container width, with ellipsis on long single-line fields.
- YouTube playlist table orders metadata columns on the left (`Upload date`, `Views`) with tighter inter-column spacing to prioritize scanability.
- YouTube playlist metadata columns stay anchored at the far right; `Upload date` compresses slightly to leave more room for the channel hyperlink column while keeping the italicized notes row with a `---` fallback.
- Mobile header omits live clock and theme toggle to prioritize navigation controls.
- Section carousel keeps the active section as the anchor and allows horizontal scrolling so all sections remain reachable on small screens.
- Stylesheet architecture is layered: global entrypoint imports dedicated token/base/layout/component/state/responsive CSS modules.
- Frontend swap lifecycle is centralized in a single app lifecycle module instead of being wired inline in layout templates.
- DOM dataset access for article/section navigation uses shared typed helper utilities to reduce stringly-typed selectors and key lookups.
- Client controllers/helpers are organized by feature under `src/features/*` (navigation, sidebar, theme, app lifecycle, shared UI constants).
- Section header navigation now keeps the active section fixed at the visual center while neighboring section labels compress at the edges.
- Article reading offset remains left-biased on desktop but gracefully recenters on narrower viewports to prevent left-edge clipping.
- Navigation and UI motion now use softer, spring-like easing with subtle scale/opacity continuity instead of rigid linear-feeling movement.
- Vim-style keyboard navigation (`h/j/k/l`) uses a dedicated, low-amplitude transition profile to keep rapid article/section stepping visually stable.
- Header clock now hydrates from a static placeholder and starts ticking after mount to avoid hydration mismatch resets during navigation.
- Vim-style keyboard navigation (`h/j/k/l`) now uses a higher-amplitude dedicated transition profile so motion is clearly perceptible.
