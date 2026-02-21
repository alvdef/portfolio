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

- Switched hidden vault conventions from `_` prefix to `.` prefix for top-level non-section folders and other elements.
- Header carousel shows all sections with active centered; uses fixed-width slots (9rem) so positions don't shift when active changes.
- Carousel items use `data-nav-nearest="prev"/"next"` on immediate neighbors for keyboard rotation (h/l), not `data-nav-dir` which matches multiple elements.
- Sidebar is a static grid column on desktop (visible by default), fixed overlay on mobile (toggled by ≡ in header).
- Article layout: 15vh top padding, 2rem title, `margin: 0 auto` centering (Medium-style).
- Removed prev/next article buttons; replaced with peek+snap overscroll — preview strip shows next article title on overscroll, snaps on threshold.
- Status line fixed at viewport bottom with `view-transition-name` to prevent movement during page transitions. Contains position info (left) and © credit (right). Desktop only.
- Theme toggle moved to header right (after Spotify widget) with larger hit target (2rem min).
- View transitions: 250ms, 35px translate, 0.97 scale. No pure fades — `data-nav-dir='none'` uses vertical slide.
- Sections are always odd count by design convention.
