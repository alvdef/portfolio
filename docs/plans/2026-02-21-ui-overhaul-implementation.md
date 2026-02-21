# UI Overhaul Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Overhaul the portfolio UI — dynamic header carousel, Medium-style article layout with peek+snap transitions, redesigned navigation controls, status line, footer, and enhanced motion.

**Architecture:** Modify existing Astro components (HeaderCarousel, BaseLayout, Sidebar) and CSS. Replace ScrollResistance with a PeekSnap component. Add a StatusLine component. Pass additional props (next/prev article titles) through the layout chain.

**Tech Stack:** Astro 5, React 19 (islands), Tailwind CSS v4, CSS View Transitions API

---

### Task 1: Enhanced Motion — Update View Transitions

Update the existing CSS keyframes and transition timings to be more pronounced.

**Files:**
- Modify: `src/styles/global.css:297-366` (view transition section)

**Step 1: Update transition durations and timings**

Replace the view transition rules (lines 297-366) with enhanced values:

```css
::view-transition-old(root) {
  animation-duration: 250ms;
  animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45);
}

::view-transition-new(root) {
  animation-duration: 250ms;
  animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

**Step 2: Update keyframe translate/scale values**

Replace all slide keyframes. Change `20px` → `35px` and `0.985` → `0.97`. Example for slide-out-left:

```css
@keyframes slide-out-left {
  from { opacity: 1; transform: translateX(0) scale(1); }
  to { opacity: 0; transform: translateX(-35px) scale(0.97); }
}
```

Apply the same pattern to all 8 slide keyframes (out-left, in-right, out-right, in-left, out-up, in-down, out-down, in-up). The `slide-in-*` keyframes use `35px` translate but no scale.

Remove the `fade-out` and `fade-in` keyframes. Replace `data-nav-dir='none'` rules with a directional slide (use slide-out-down/slide-in-up as default):

```css
:root[data-nav-dir='none']::view-transition-old(root) { animation-name: slide-out-down; }
:root[data-nav-dir='none']::view-transition-new(root) { animation-name: slide-in-up; }
```

**Step 3: Verify visually**

Run: `npm run dev`
Navigate between sections and articles. Confirm transitions feel more pronounced with no pure fades.

**Step 4: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: enhance view transition motion (35px, 0.97 scale, 250ms)"
```

---

### Task 2: Header Carousel — Dynamic Rotating Sections

Replace the 3-item carousel with a fully dynamic one that shows all sections and rotates the active to center.

**Files:**
- Modify: `src/components/HeaderCarousel.astro` (full rewrite of nav section)
- Modify: `src/styles/global.css:124-136` (carousel-nav styles)

**Step 1: Rewrite HeaderCarousel.astro**

Replace the entire file content:

```astro
---
import ClockWidget from '@/components/ClockWidget';
import SpotifyNowPlaying from '@/components/SpotifyNowPlaying';

interface Props {
  sections: string[];
  currentSection: string;
}

const { sections, currentSection } = Astro.props;
const activeIndex = sections.indexOf(currentSection);

// Build circular order: place active in center, wrap others around it
const count = sections.length;
const half = Math.floor(count / 2);
const ordered: { name: string; offset: number }[] = [];
for (let i = -half; i <= half; i++) {
  // Skip duplicate center for even-length arrays
  if (count % 2 === 0 && i === half) continue;
  const idx = ((activeIndex + i) % count + count) % count;
  ordered.push({ name: sections[idx], offset: i });
}
---

<header class="top-header">
  <div class="widget-left clock-cluster">
    <ClockWidget client:load />
  </div>
  <nav class="carousel-nav" aria-label="Section navigation">
    {ordered.map(({ name, offset }) => {
      if (offset === 0) {
        return <span class="carousel-item active">{name}</span>;
      }
      const dir = offset < 0 ? 'left' : 'right';
      return (
        <a href={`/${name}`} data-nav-dir={dir} class="carousel-item dimmed">
          {name}
        </a>
      );
    })}
  </nav>
  <div class="widget-right">
    <SpotifyNowPlaying client:load />
    <button id="theme-toggle" type="button" class="theme-toggle" aria-label="Toggle theme">☀</button>
  </div>
</header>
```

**Step 2: Update carousel CSS in global.css**

Replace the `.carousel-nav` and related styles (lines 124-136):

```css
.carousel-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  overflow: hidden;
}

.carousel-item {
  text-decoration: none;
  color: var(--muted);
  font-size: 0.78rem;
  transition: font-size 250ms ease, color 250ms ease, opacity 250ms ease;
  white-space: nowrap;
}

.carousel-item.active {
  color: var(--fg);
  font-size: 1.1rem;
  font-weight: 500;
}

.carousel-item.dimmed {
  color: var(--muted);
}
```

Remove the old `.carousel-nav .dimmed` rule (line 133-135).

**Step 3: Update widget-right to accommodate theme toggle**

The theme toggle moves from `.widget-left` to `.widget-right`. Update the `.widget-right` style:

```css
.widget-right {
  justify-self: end;
  max-width: 22rem;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
}
```

Update `.theme-toggle` to have a larger click target:

```css
.theme-toggle {
  background: transparent;
  border: none;
  padding: 0.5rem;
  margin: 0;
  color: inherit;
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  min-width: 2rem;
  min-height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

Remove the theme toggle button from `.clock-cluster` (already done in Step 1 — it's now inside `.widget-right`).

**Step 4: Update mobile carousel styles**

In the `@media (max-width: 960px)` block, update:

```css
.carousel-nav {
  gap: 0.5rem;
  font-size: 0.75rem;
}

.carousel-item.active {
  font-size: 0.95rem;
}
```

**Step 5: Verify visually**

Run: `npm run dev`
Navigate between sections. Confirm: all sections visible, active is centered and larger, no underlines, items are vertically centered. Theme toggle is on the right after Spotify.

**Step 6: Commit**

```bash
git add src/components/HeaderCarousel.astro src/styles/global.css
git commit -m "feat: dynamic rotating header carousel with all sections visible"
```

---

### Task 3: Article Layout — Breathing Room and Bigger Title

Update article styling for Medium-style spacing.

**Files:**
- Modify: `src/styles/global.css:238-295` (article styles)
- Modify: `src/pages/[section]/[slug].astro:39-49` (remove prev/next footer)

**Step 1: Update article body styles**

Replace `.article-body` (line 238-244):

```css
.article-body {
  height: calc(100vh - 3rem);
  overflow-y: auto;
  touch-action: pan-y;
  padding: 15vh 1.25rem 4rem;
  max-width: 76ch;
  margin: 0 auto;
}
```

Key changes: `padding-top: 15vh` (was `1rem`), `margin: 0 auto` (centers the column), `padding-bottom: 4rem` (more space at bottom).

**Step 2: Update article header title size**

Replace `.article-header h1` (line 246-250):

```css
.article-header h1 {
  margin: 0;
  font-size: 2rem;
  line-height: 1.15;
  font-weight: 700;
}
```

Changed from `1.3rem` to `2rem`.

**Step 3: Remove prev/next footer from slug page**

In `src/pages/[section]/[slug].astro`, remove the article footer. Replace lines 45-48:

```astro
    <Content />
  </article>
```

Remove:
```astro
    <footer class="article-footer">
      {prevDoc ? <a href={`/${prevDoc.data.section}/${prevDoc.data.slug}`}>Prev</a> : <span />}
      {nextDoc ? <a href={`/${nextDoc.data.section}/${nextDoc.data.slug}`}>Next</a> : <span />}
    </footer>
```

**Step 4: Update mobile article styles**

In the `@media (max-width: 960px)` block, update `.article-body`:

```css
.article-body {
  max-width: 100%;
  padding: 8vh 0.9rem 3rem;
}
```

**Step 5: Verify visually**

Run: `npm run dev`
Confirm: title is further down the page, bigger, article content is centered, no prev/next buttons.

**Step 6: Commit**

```bash
git add src/styles/global.css src/pages/\[section\]/\[slug\].astro
git commit -m "feat: Medium-style article layout with breathing room and larger title"
```

---

### Task 4: Index Toggle — Hamburger Icon with Slide Sidebar

Replace "INDEX" text toggle with `≡` hamburger, make sidebar slide from left on both desktop and mobile.

**Files:**
- Modify: `src/layouts/BaseLayout.astro:40` (button markup)
- Modify: `src/layouts/BaseLayout.astro:57-67` (drawer script)
- Modify: `src/styles/global.css:187-231` (sidebar styles)
- Modify: `src/styles/global.css:368-404` (mobile sidebar styles)

**Step 1: Update the toggle button markup**

In `BaseLayout.astro`, replace line 40:

```astro
<button id="index-toggle" class="index-toggle" type="button" aria-controls="sidebar-index" aria-expanded="false">≡</button>
```

**Step 2: Update the drawer script**

In the `setDrawer` function (lines 57-62), remove the text-content toggle since the icon doesn't change:

```javascript
function setDrawer(open) {
  if (!toggleButton || !sidebar) return;
  toggleButton.setAttribute('aria-expanded', String(open));
  sidebar.dataset.open = open ? 'true' : 'false';
}
```

**Step 3: Restyle the index toggle (always visible)**

Replace `.index-toggle` (lines 222-231):

```css
.index-toggle {
  position: fixed;
  top: 0.6rem;
  left: 0.75rem;
  z-index: 50;
  background: transparent;
  border: none;
  padding: 0.25rem;
  margin: 0;
  color: var(--fg);
  font-size: 1.4rem;
  line-height: 1;
  cursor: pointer;
}
```

Remove the `display: none` — now always visible.

**Step 4: Restyle sidebar for slide-in on desktop**

Replace `.sidebar` (lines 187-191):

```css
.sidebar {
  position: fixed;
  top: 3rem;
  left: 0;
  bottom: 0;
  width: 15rem;
  border-right: 1px solid var(--line);
  padding: 1rem 0.75rem;
  overflow: auto;
  background: var(--bg);
  z-index: 40;
  transform: translateX(-100%);
  transition: transform 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.sidebar[data-open='true'] {
  transform: translateX(0);
}
```

**Step 5: Remove old grid column for sidebar**

Update `.app-grid` (line 106-111) — remove the sidebar column since it's now an overlay:

```css
.app-grid {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;
  min-height: 100vh;
}
```

**Step 6: Update mobile overrides**

In the `@media (max-width: 960px)` block, remove the `.sidebar` and `.index-toggle` mobile-specific rules since the styles are now unified. Keep only:

```css
.sidebar[data-open='true'] {
  width: 100%;
}
```

So on mobile the sidebar takes full width instead of 15rem.

**Step 7: Verify visually**

Run: `npm run dev`
Confirm: `≡` icon always visible top-left, clicking it slides sidebar in from left, clicking again slides it out. Works on both desktop and mobile.

**Step 8: Commit**

```bash
git add src/layouts/BaseLayout.astro src/styles/global.css
git commit -m "feat: hamburger index toggle with slide-in sidebar"
```

---

### Task 5: Peek + Snap — Replace ScrollResistance

Replace the current ScrollResistance component with a PeekSnap component that shows a preview strip of the next/prev article on overscroll.

**Files:**
- Create: `src/components/PeekSnap.tsx` (replaces ScrollResistance)
- Modify: `src/layouts/BaseLayout.astro:6,46` (swap component import)
- Modify: `src/pages/[section]/[slug].astro` (pass next/prev titles as data attributes)
- Modify: `src/styles/global.css` (add peek strip styles)

**Step 1: Add next/prev title data attributes to article**

In `src/pages/[section]/[slug].astro`, update the `<article>` tag to include next/prev article titles:

```astro
<article
  id="article-scroll-root"
  class="article-body"
  data-next-url={nextDoc ? `/${nextDoc.data.section}/${nextDoc.data.slug}` : ''}
  data-prev-url={prevDoc ? `/${prevDoc.data.section}/${prevDoc.data.slug}` : ''}
  data-next-title={nextDoc?.data.title ?? ''}
  data-next-meta={nextDoc ? `${nextDoc.data.group} / ${new Date(nextDoc.data.date).toISOString().slice(0, 10)}` : ''}
  data-prev-title={prevDoc?.data.title ?? ''}
  data-prev-meta={prevDoc ? `${prevDoc.data.group} / ${new Date(prevDoc.data.date).toISOString().slice(0, 10)}` : ''}
>
```

**Step 2: Create PeekSnap.tsx**

```tsx
import { useEffect, useRef, useState } from 'react';
import { navigate } from 'astro:transitions/client';

declare global {
  interface Window {
    __portfolioNavState?: { isNavigating: boolean; pauseOverscroll?: boolean };
  }
}

const THRESHOLD = 150;
const MAX_PEEK = 80;

function getState() {
  if (!window.__portfolioNavState) {
    window.__portfolioNavState = { isNavigating: false, pauseOverscroll: false };
  }
  return window.__portfolioNavState;
}

export default function PeekSnap() {
  const [peek, setPeek] = useState<{ direction: 'up' | 'down'; amount: number; title: string; meta: string } | null>(null);
  const accRef = useRef(0);
  const touchStartYRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const root = document.getElementById('article-scroll-root');
    if (!root) return;

    function getArticleData(direction: 'up' | 'down') {
      const root = document.getElementById('article-scroll-root');
      if (!root) return null;
      const prefix = direction === 'up' ? 'prev' : 'next';
      const url = root.dataset[`${prefix}Url`];
      const title = root.dataset[`${prefix}Title`] || '';
      const meta = root.dataset[`${prefix}Meta`] || '';
      if (!url) return null;
      return { url, title, meta };
    }

    function updatePeek(direction: 'up' | 'down', amount: number) {
      const data = getArticleData(direction);
      if (!data) { setPeek(null); return; }
      const clamped = Math.min(amount, MAX_PEEK);
      setPeek({ direction, amount: clamped, title: data.title, meta: data.meta });
    }

    function resetPeek() {
      // Animate spring-back
      setPeek(prev => prev ? { ...prev, amount: 0 } : null);
      setTimeout(() => setPeek(null), 200);
    }

    function triggerNav(direction: 'up' | 'down') {
      const data = getArticleData(direction);
      if (!data) return;
      const state = getState();
      state.isNavigating = true;
      document.documentElement.dataset.navDir = direction === 'up' ? 'up' : 'down';
      accRef.current = 0;
      setPeek(null);
      navigate(data.url);
    }

    const onWheel = (event: WheelEvent) => {
      const state = getState();
      if (state.isNavigating || state.pauseOverscroll) return;
      if (event.deltaY === 0) return;

      const atTop = root.scrollTop <= 0;
      const atBottom = root.scrollTop + root.clientHeight >= root.scrollHeight;
      if (!(atTop || atBottom)) {
        if (accRef.current !== 0) { accRef.current = 0; resetPeek(); }
        return;
      }

      const wantsPrev = atTop && event.deltaY < 0;
      const wantsNext = atBottom && event.deltaY > 0;
      if (!wantsPrev && !wantsNext) {
        if (accRef.current !== 0) { accRef.current = 0; resetPeek(); }
        return;
      }

      accRef.current += Math.abs(event.deltaY);
      const direction = wantsPrev ? 'up' : 'down';
      updatePeek(direction, (accRef.current / THRESHOLD) * MAX_PEEK);

      if (accRef.current >= THRESHOLD) {
        triggerNav(direction);
      }
    };

    // Reset accumulator when user scrolls back into content
    const onScroll = () => {
      const atTop = root.scrollTop <= 0;
      const atBottom = root.scrollTop + root.clientHeight >= root.scrollHeight;
      if (!atTop && !atBottom && accRef.current > 0) {
        accRef.current = 0;
        resetPeek();
      }
    };

    let touchStartY = 0;
    const onTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? 0;
      touchStartYRef.current = touchStartY;
    };

    const onTouchMove = (event: TouchEvent) => {
      const state = getState();
      if (state.isNavigating || state.pauseOverscroll) return;

      const currentY = event.touches[0]?.clientY ?? touchStartYRef.current;
      const delta = touchStartYRef.current - currentY;
      if (delta === 0) return;

      const atTop = root.scrollTop <= 0;
      const atBottom = root.scrollTop + root.clientHeight >= root.scrollHeight;
      if (!(atTop || atBottom)) {
        if (accRef.current !== 0) { accRef.current = 0; resetPeek(); }
        return;
      }

      const wantsPrev = atTop && delta < 0;
      const wantsNext = atBottom && delta > 0;
      if (!wantsPrev && !wantsNext) {
        if (accRef.current !== 0) { accRef.current = 0; resetPeek(); }
        return;
      }

      accRef.current += Math.abs(delta);
      touchStartYRef.current = currentY;
      const direction = wantsPrev ? 'up' : 'down';
      updatePeek(direction, (accRef.current / THRESHOLD) * MAX_PEEK);

      if (accRef.current >= THRESHOLD) {
        triggerNav(direction);
      }
    };

    const onTouchEnd = () => {
      if (accRef.current > 0 && accRef.current < THRESHOLD) {
        accRef.current = 0;
        resetPeek();
      }
    };

    const onAfterSwap = () => {
      getState().isNavigating = false;
      accRef.current = 0;
      setPeek(null);
    };

    root.addEventListener('wheel', onWheel, { passive: true });
    root.addEventListener('scroll', onScroll, { passive: true });
    root.addEventListener('touchstart', onTouchStart, { passive: true });
    root.addEventListener('touchmove', onTouchMove, { passive: true });
    root.addEventListener('touchend', onTouchEnd, { passive: true });
    document.addEventListener('astro:after-swap', onAfterSwap);

    return () => {
      root.removeEventListener('wheel', onWheel);
      root.removeEventListener('scroll', onScroll);
      root.removeEventListener('touchstart', onTouchStart);
      root.removeEventListener('touchmove', onTouchMove);
      root.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('astro:after-swap', onAfterSwap);
    };
  }, []);

  if (!peek || peek.amount === 0) return null;

  const isTop = peek.direction === 'up';
  const style: React.CSSProperties = {
    position: 'fixed',
    left: 0,
    right: 0,
    [isTop ? 'top' : 'bottom']: '0',
    height: `${peek.amount}px`,
    overflow: 'hidden',
    transition: peek.amount === 0 ? 'height 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
    zIndex: 30,
  };

  return (
    <div className="peek-strip" style={style} data-direction={peek.direction}>
      <div className="peek-strip-content">
        <span className="peek-strip-title">{peek.title}</span>
        <span className="peek-strip-meta">{peek.meta}</span>
      </div>
    </div>
  );
}
```

**Step 3: Add peek strip CSS to global.css**

Add after the `.article-footer` rules:

```css
.peek-strip {
  background: var(--bg);
  border-top: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: center;
}

.peek-strip[data-direction='up'] {
  border-top: none;
  border-bottom: 1px solid var(--line);
}

.peek-strip-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  padding: 0.5rem 1rem;
}

.peek-strip-title {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--fg);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 50ch;
}

.peek-strip-meta {
  font-size: 0.7rem;
  color: var(--muted);
  font-family: 'IBM Plex Mono', monospace;
}
```

**Step 4: Swap component in BaseLayout**

In `src/layouts/BaseLayout.astro`:
- Line 6: Change `import ScrollResistance from '@/components/ScrollResistance';` to `import PeekSnap from '@/components/PeekSnap';`
- Line 46: Change `<ScrollResistance client:load />` to `<PeekSnap client:load />`

**Step 5: Delete old ScrollResistance**

Delete `src/components/ScrollResistance.tsx` (no longer needed).

**Step 6: Verify visually**

Run: `npm run dev`
Scroll to the bottom of an article. Continue scrolling — the peek strip should appear showing the next article's title and meta. Release before threshold — strip springs back. Scroll past threshold — navigates to next article.

**Step 7: Commit**

```bash
git add src/components/PeekSnap.tsx src/layouts/BaseLayout.astro src/pages/\[section\]/\[slug\].astro src/styles/global.css
git rm src/components/ScrollResistance.tsx
git commit -m "feat: peek+snap article transitions with preview strip"
```

---

### Task 6: Status Line — Desktop Vim-style Position Indicator

Add a fixed status line at the bottom-left showing position and keyboard shortcuts.

**Files:**
- Modify: `src/layouts/BaseLayout.astro` (add status line markup, pass position data)
- Modify: `src/pages/[section]/[slug].astro` (pass article index and total)
- Modify: `src/styles/global.css` (add status line styles)

**Step 1: Pass article position data to BaseLayout**

In `src/pages/[section]/[slug].astro`, add new props to BaseLayout. Add `articleIndex` and `articleTotal`:

```astro
<BaseLayout
  title={doc.data.title}
  currentSection={doc.data.section}
  sections={[...SECTIONS]}
  sectionGroups={sectionGroups}
  currentSlug={doc.data.slug}
  prevUrl={prevDoc ? `/${prevDoc.data.section}/${prevDoc.data.slug}` : null}
  nextUrl={nextDoc ? `/${nextDoc.data.section}/${nextDoc.data.slug}` : null}
  articleIndex={index + 1}
  articleTotal={sectionDocs.length}
>
```

**Step 2: Update BaseLayout Props interface**

Add to the Props interface in `BaseLayout.astro`:

```typescript
interface Props {
  title: string;
  currentSection: string;
  sections: string[];
  sectionGroups: Array<{ group: string; items: Array<{ data: { title: string; slug: string; section: string } }> }>;
  currentSlug: string;
  prevUrl: string | null;
  nextUrl: string | null;
  articleIndex?: number;
  articleTotal?: number;
}
```

Update the destructuring:

```typescript
const { title, currentSection, sections, sectionGroups, currentSlug, prevUrl, nextUrl, articleIndex, articleTotal } = Astro.props;
```

**Step 3: Add status line markup to BaseLayout**

After the `</main>` tag and before `<PeekSnap client:load />`, add:

```astro
{articleIndex && articleTotal && (
  <div class="status-line">
    <span>{currentSection}/{currentSlug} [{articleIndex}/{articleTotal}]</span>
    <span class="status-keys">h/l sections · j/k articles</span>
  </div>
)}
```

**Step 4: Add status line CSS**

Add to `global.css`:

```css
.status-line {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.3rem 0.75rem;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem;
  color: var(--muted);
  display: flex;
  gap: 1.5rem;
  z-index: 20;
  pointer-events: none;
}

.status-keys {
  opacity: 0.6;
}

@media (max-width: 960px) {
  .status-line {
    display: none;
  }
}
```

**Step 5: Verify visually**

Run: `npm run dev`
On desktop: status line visible at bottom-left with section/slug [index/total] and key hints. On mobile: hidden.

**Step 6: Commit**

```bash
git add src/layouts/BaseLayout.astro src/pages/\[section\]/\[slug\].astro src/styles/global.css
git commit -m "feat: vim-style status line with article position (desktop only)"
```

---

### Task 7: Footer — Minimal Credit Line

Add a simple credit footer at the end of article content.

**Files:**
- Modify: `src/pages/[section]/[slug].astro` (add footer inside article)
- Modify: `src/styles/global.css` (restyle article-footer)

**Step 1: Add footer to article**

In `src/pages/[section]/[slug].astro`, after `<Content />` and before `</article>`, add:

```astro
    <Content />
    <footer class="article-footer">
      <span>© 2026</span>
    </footer>
  </article>
```

**Step 2: Restyle article-footer**

Replace `.article-footer` in global.css:

```css
.article-footer {
  margin-top: 4rem;
  padding-top: 1rem;
  border-top: 1px solid var(--line);
  text-align: center;
  color: var(--muted);
  font-size: 0.75rem;
  font-family: 'IBM Plex Mono', monospace;
}
```

Remove the `display: flex` and `justify-content` rules from the old footer style.

**Step 3: Verify visually**

Run: `npm run dev`
Scroll to bottom of article. Confirm: subtle credit line appears, centered, muted.

**Step 4: Commit**

```bash
git add src/pages/\[section\]/\[slug\].astro src/styles/global.css
git commit -m "feat: minimal credit footer in article"
```

---

### Task 8: Final Polish and Integration Testing

Verify all changes work together, fix any visual conflicts.

**Files:**
- Possibly: any of the above files for adjustments

**Step 1: Full navigation test**

Run: `npm run dev`

Test matrix:
- [ ] Section navigation with h/l keys — carousel rotates, transitions are enhanced
- [ ] Article navigation with j/k keys — peek strip works
- [ ] Scroll overscroll at bottom — peek strip shows next article
- [ ] Scroll overscroll at top — peek strip shows prev article
- [ ] Release before threshold — strip springs back
- [ ] `≡` toggle — sidebar slides in/out on desktop
- [ ] `≡` toggle — sidebar slides in/out on mobile
- [ ] Theme toggle — right side of header, larger click target
- [ ] Status line — visible on desktop, hidden on mobile
- [ ] Footer — visible at bottom of article content
- [ ] All sections visible in carousel for any number of sections
- [ ] Responsive at 960px breakpoint

**Step 2: Fix any issues found**

Address layout overlaps, z-index conflicts, or transition timing issues.

**Step 3: Build test**

Run: `npm run build`
Confirm no build errors.

**Step 4: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: integration polish for UI overhaul"
```
