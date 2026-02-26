# Continuous Scroll Navigation

## Problem

The PeekSnap system (overscroll detection with preview strip and 220px threshold) causes usability issues on mobile:

- Competes with the browser's native pull-to-refresh gesture
- Threshold-based: all-or-nothing activation feels unnatural
- Overscroll detection is unreliable on touch devices

## Solution

Replace PeekSnap with native continuous scroll within each section. All articles in a section are rendered in a single scrollable page, separated by subtle divider lines. No gesture hijacking, no thresholds — just real browser scroll.

## Architecture

### Before (current)

Each article is an independent route (`/[section]/[slug]`). Navigating between articles triggers a full page navigation with view transitions.

### After

The route `/[section]` renders all articles for that section in a single scroll container. Each article is a DOM section with its own `id`. The route `/[section]/[slug]` loads the section page and scrolls to the target article.

### Key changes

- **SectionPage**: New component that renders all articles in order with `<hr>` dividers between them
- **ArticleObserver**: IntersectionObserver (threshold ~50%) detects the visible article and updates URL via `history.replaceState`, sidebar highlight, and status line position
- **PeekSnap removed**: Component, CSS, and all overscroll detection logic deleted
- **View transitions**: Removed for intra-section navigation (scroll replaces them). Kept for inter-section navigation (h/l, carousel clicks)

## Interaction details

### Scroll

- Native browser scroll, no manipulation
- Between articles: `1px solid` divider line in muted color
- `content-visibility: auto` on each article for future-proof rendering performance
- Scroll stops naturally at the end of the last article in the section

### URL and state

- IntersectionObserver on each article (threshold ~50%)
- When an article enters view: `history.replaceState` updates URL to `/section/slug`
- Sidebar highlights the active article
- Status line updates position `[n/total]`

### Keyboard (logic preserved, action changes)

- `j` → `scrollIntoView({ behavior: 'smooth' })` to next article
- `k` → scroll to previous article
- `h/l` → real navigation to another section (route change, kept as-is)

### Direct navigation

- URL `/section/slug` → loads section page, instant scroll to article
- Sidebar links within same section → `scrollIntoView({ behavior: 'smooth' })` (no route change)
- Sidebar links to different section → route change with view transition

### Section boundaries

- Scroll is contained within the current section
- To change sections: use carousel, sidebar, or h/l keyboard shortcuts

## What gets removed

- `PeekSnap.tsx` component
- `src/styles/components/peek.css`
- Overscroll detection logic in nav-controller
- `PEEK_THRESHOLD`, `PEEK_MAX`, `PEEK_SNAP_HOLD_MS` constants
- View transition animations for intra-section navigation
- `data-next-url`, `data-prev-url`, `data-next-title`, `data-prev-title`, `data-next-meta`, `data-prev-meta` attributes on article root

## Performance

With ~2 articles per section currently, rendering all articles is trivial. `content-visibility: auto` ensures off-screen articles skip rendering work. No lazy loading needed at this scale.
