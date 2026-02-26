# Continuous Scroll Navigation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace PeekSnap threshold-based navigation with native continuous scroll within sections.

**Architecture:** Each `app/[section]/[slug]/page.tsx` route renders all articles in the section as a single scrollable page. An IntersectionObserver updates the URL, sidebar highlight, and status line as the user scrolls. Keyboard shortcuts j/k scroll to adjacent articles instead of triggering route changes.

**Tech Stack:** Next.js App Router, React, CSS, IntersectionObserver API

---

### Task 1: Remove PeekSnap component and related code

**Files:**
- Delete: `src/components/PeekSnap.tsx`
- Delete: `src/styles/components/peek.css`
- Modify: `src/components/layout/BaseLayout.tsx:5,41`
- Modify: `src/styles/global.css:8`
- Modify: `src/features/ui/ui-constants.ts:7-9`
- Modify: `src/features/navigation/navigation-state.ts:3`

**Step 1: Delete PeekSnap component**

```bash
rm src/components/PeekSnap.tsx
```

**Step 2: Delete peek CSS**

```bash
rm src/styles/components/peek.css
```

**Step 3: Remove PeekSnap from BaseLayout**

In `src/components/layout/BaseLayout.tsx`, remove the PeekSnap import (line 5) and the `<PeekSnap />` element (line 41). Also remove `prevUrl` and `nextUrl` from Props and the `data-prev-url`/`data-next-url` attributes on `<main>`.

The file should become:

```tsx
import type { ReactNode } from 'react';
import HeaderCarousel from '@/components/layout/HeaderCarousel';
import Sidebar from '@/components/layout/Sidebar';
import AppRuntime from '@/components/layout/AppRuntime';

type Props = {
  currentSection: string;
  sections: string[];
  sectionLinks: Record<string, string>;
  sectionGroups: Array<{ group: string; items: Array<{ title: string; slug: string; section: string }> }>;
  currentSlug: string;
  articleIndex: number;
  articleTotal: number;
  children: ReactNode;
};

export default function BaseLayout({
  currentSection,
  sections,
  sectionLinks,
  sectionGroups,
  currentSlug,
  articleIndex,
  articleTotal,
  children
}: Props) {
  return (
    <>
      <AppRuntime />
      <div className="app-grid">
        <HeaderCarousel sections={sections} sectionLinks={sectionLinks} currentSection={currentSection} />
        <Sidebar groups={sectionGroups} currentSlug={currentSlug} />
        <main className="content-pane">
          {children}
        </main>
      </div>

      <div className="status-line">
        <span className="status-breadcrumb">{currentSection}/{currentSlug} [{articleIndex}/{articleTotal}]</span>
        <span className="status-keys">h/l sections · j/k articles</span>
        <span className="status-credit">Álvaro de Francisco &copy; 2026</span>
      </div>
    </>
  );
}
```

**Step 4: Remove peek.css import from global.css**

In `src/styles/global.css`, remove line 8: `@import './components/peek.css';`

**Step 5: Remove peek constants from ui-constants.ts**

In `src/features/ui/ui-constants.ts`, remove lines 7-9:
```
export const PEEK_THRESHOLD = 220;
export const PEEK_MAX = 130;
export const PEEK_SNAP_HOLD_MS = 120;
```

**Step 6: Remove pauseOverscroll from navigation-state.ts**

In `src/features/navigation/navigation-state.ts`, remove `pauseOverscroll` from the interface and default state:

```typescript
export interface PortfolioNavState {
  isNavigating: boolean;
}
```

And update the initializer:
```typescript
window.__portfolioNavState = { isNavigating: false };
```

**Step 7: Remove iframe focus handlers from nav-controller.ts**

In `src/features/navigation/nav-controller.ts`, remove:
- `handleIframeFocusIn` function (lines 57-61)
- `handleIframeFocusOut` function (lines 63-67)
- The two event listeners in `initNavigationController` (lines 126-127):
  ```
  document.addEventListener('focusin', handleIframeFocusIn);
  document.addEventListener('focusout', handleIframeFocusOut);
  ```

**Step 8: Verify build compiles**

Run: `npm run build`
Expected: Build succeeds (article page will break in next task — that's OK, we fix it immediately)

**Step 9: Commit**

```bash
git add -A && git commit -m "refactor: remove PeekSnap and related overscroll detection code"
```

---

### Task 2: Update article CSS for continuous scroll layout

**Files:**
- Modify: `src/styles/components/article.css:3-7,9-17`

**Step 1: Update content-pane and article-body styles**

In `src/styles/components/article.css`, replace the `.content-pane` and `.article-body` rules (lines 3-17) with:

```css
.content-pane {
  padding: 0;
  overflow-x: visible;
  overflow-y: auto;
  height: calc(100vh - 3rem);
}

.article-body {
  touch-action: pan-y;
  padding: 15vh 1.25rem 4rem;
  max-width: 80ch;
  margin: 0 auto;
  transform: translateX(clamp(-2.75rem, -5vw, -0.6rem));
  content-visibility: auto;
  contain-intrinsic-size: auto 100vh;
}
```

Key changes:
- `.content-pane` becomes the scroll container (`overflow-y: auto`, `height: calc(100vh - 3rem)`)
- `.article-body` loses `height` and `overflow-y` (no longer its own scroll viewport)
- Added `content-visibility: auto` and `contain-intrinsic-size` for off-screen rendering optimization

**Step 2: Add article divider style**

Append to `src/styles/components/article.css` (after the existing rules, before `.article-footer`):

```css
.article-divider {
  border: none;
  border-top: 1px solid var(--line);
  margin: 0 auto;
  max-width: 80ch;
  transform: translateX(clamp(-2.75rem, -5vw, -0.6rem));
}
```

**Step 3: Update mobile article-body override**

In `src/styles/responsive.css`, update the `.article-body` rule (lines 45-49). Remove `max-width: 100%` (already handled), keep mobile padding, and ensure no height constraint:

```css
.article-body {
  padding: 8vh 0.9rem 3rem;
  transform: none;
}
```

Also add mobile override for the divider:

```css
.article-divider {
  transform: none;
}
```

**Step 4: Verify build compiles**

Run: `npm run build`

**Step 5: Commit**

```bash
git add -A && git commit -m "refactor: update CSS for continuous scroll article layout"
```

---

### Task 3: Render all section articles on the article page

**Files:**
- Modify: `app/[section]/[slug]/page.tsx` (complete rewrite)

**Step 1: Rewrite the article page to render all articles**

Replace `app/[section]/[slug]/page.tsx` entirely:

```tsx
import { notFound } from 'next/navigation';
import BaseLayout from '@/components/layout/BaseLayout';
import MdxContent from '@/components/content/MdxContent';
import YoutubePlaylistTable from '@/components/YoutubePlaylistTable';
import { getPublishedDocs, groupDocsByGroup } from '@/lib/content';
import { getSectionLandingLinks } from '@/features/navigation/section-links';
import ArticleObserver from '@/components/ArticleObserver';

function toIsoDate(input: string) {
  return new Date(input).toISOString().slice(0, 10);
}

export async function generateStaticParams() {
  const docs = await getPublishedDocs();
  return docs.map((doc) => ({ section: doc.section, slug: doc.slug }));
}

export default async function ArticlePage({ params }: { params: Promise<{ section: string; slug: string }> }) {
  const { section, slug } = await params;

  const docs = await getPublishedDocs();
  const doc = docs.find((item) => item.section === section && item.slug === slug);
  if (!doc) {
    notFound();
  }

  const sectionDocs = docs.filter((item) => item.section === doc.section);
  const sections = [...new Set(docs.map((item) => item.section))];
  const sectionLinks = getSectionLandingLinks(docs, sections);
  const sectionGroups = groupDocsByGroup(sectionDocs).map(({ group, items }) => ({
    group,
    items: items.map((item) => ({ title: item.title, slug: item.slug, section: item.section }))
  }));

  const index = sectionDocs.findIndex((item) => item._id === doc._id);

  return (
    <BaseLayout
      currentSection={doc.section}
      sections={sections}
      sectionLinks={sectionLinks}
      sectionGroups={sectionGroups}
      currentSlug={doc.slug}
      articleIndex={index + 1}
      articleTotal={sectionDocs.length}
    >
      {sectionDocs.map((sectionDoc, i) => {
        const isYoutube = sectionDoc.sourceType === 'virtual' && sectionDoc.section === 'about_me' && sectionDoc.slug === 'youtube';
        return (
          <div key={sectionDoc._id}>
            {i > 0 && <hr className="article-divider" />}
            <article
              id={`article-${sectionDoc.slug}`}
              className="article-body"
              data-article-slug={sectionDoc.slug}
              data-article-index={i + 1}
              data-article-section={sectionDoc.section}
            >
              <header className="article-header">
                <h1>{sectionDoc.title}</h1>
                <p className="meta">
                  {sectionDoc.group} / {toIsoDate(sectionDoc.date)}
                </p>
              </header>
              {sectionDoc.sourceType === 'virtual' ? (
                isYoutube ? (
                  <section className="youtube-directory">
                    <YoutubePlaylistTable />
                  </section>
                ) : (
                  <p>Virtual document has no renderer.</p>
                )
              ) : sectionDoc.body?.code ? (
                <MdxContent code={sectionDoc.body.code} />
              ) : (
                <p>Document renderer unavailable.</p>
              )}
            </article>
          </div>
        );
      })}
      <ArticleObserver
        initialSlug={slug}
        section={section}
        totalArticles={sectionDocs.length}
      />
    </BaseLayout>
  );
}
```

**Step 2: Verify build compiles (will fail — ArticleObserver doesn't exist yet)**

Run: `npm run build`
Expected: Fails with missing `ArticleObserver` module. That's OK — we create it in the next task.

---

### Task 4: Create ArticleObserver client component

**Files:**
- Create: `src/components/ArticleObserver.tsx`

**Step 1: Create the ArticleObserver component**

Create `src/components/ArticleObserver.tsx`:

```tsx
'use client';

import { useEffect, useRef } from 'react';

type Props = {
  initialSlug: string;
  section: string;
  totalArticles: number;
};

export default function ArticleObserver({ initialSlug, section, totalArticles }: Props) {
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    // Initial scroll to target article
    if (!hasScrolledRef.current) {
      hasScrolledRef.current = true;
      const target = document.getElementById(`article-${initialSlug}`);
      if (target) {
        target.scrollIntoView({ behavior: 'instant' });
      }
    }
  }, [initialSlug]);

  useEffect(() => {
    const contentPane = document.querySelector('.content-pane');
    if (!contentPane) return;

    const articles = contentPane.querySelectorAll<HTMLElement>('[data-article-slug]');
    if (articles.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry with the largest intersection ratio
        let bestEntry: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!bestEntry || entry.intersectionRatio > bestEntry.intersectionRatio) {
              bestEntry = entry;
            }
          }
        }

        if (!bestEntry) return;
        const el = bestEntry.target as HTMLElement;
        const slug = el.dataset.articleSlug;
        const index = el.dataset.articleIndex;
        if (!slug) return;

        // Update URL without triggering navigation
        const newUrl = `/${section}/${slug}`;
        if (window.location.pathname !== newUrl) {
          window.history.replaceState(null, '', newUrl);
        }

        // Update sidebar active link
        const sidebar = document.getElementById('sidebar-index');
        if (sidebar) {
          sidebar.querySelectorAll('a').forEach((a) => a.classList.remove('active'));
          const activeLink = sidebar.querySelector(`a[href="${newUrl}"]`);
          if (activeLink) activeLink.classList.add('active');
        }

        // Update status line
        const breadcrumb = document.querySelector('.status-breadcrumb');
        if (breadcrumb && index) {
          breadcrumb.textContent = `${section}/${slug} [${index}/${totalArticles}]`;
        }
      },
      {
        root: contentPane,
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    articles.forEach((article) => observer.observe(article));
    return () => observer.disconnect();
  }, [section, totalArticles]);

  return null;
}
```

**Step 2: Verify build compiles**

Run: `npm run build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: render all section articles with scroll observer"
```

---

### Task 5: Update keyboard navigation for scroll-based j/k

**Files:**
- Modify: `src/features/navigation/nav-controller.ts:76,98-110`
- Modify: `src/features/navigation/dom-data.ts`

**Step 1: Replace dom-data helpers for scroll-based navigation**

Replace `src/features/navigation/dom-data.ts` entirely:

```typescript
export function getArticleElements(): HTMLElement[] {
  const contentPane = document.querySelector('.content-pane');
  if (!contentPane) return [];
  return Array.from(contentPane.querySelectorAll<HTMLElement>('[data-article-slug]'));
}

export function getActiveArticleSlug(): string | null {
  return new URL(window.location.href).pathname.split('/').pop() || null;
}

export function getAdjacentArticle(direction: 'up' | 'down'): HTMLElement | null {
  const articles = getArticleElements();
  const activeSlug = getActiveArticleSlug();
  const currentIndex = articles.findIndex((el) => el.dataset.articleSlug === activeSlug);
  if (currentIndex === -1) return null;

  if (direction === 'up' && currentIndex > 0) return articles[currentIndex - 1];
  if (direction === 'down' && currentIndex < articles.length - 1) return articles[currentIndex + 1];
  return null;
}

export function getSectionCarouselElements() {
  const nav = document.getElementById('section-carousel-nav');
  const active = document.getElementById('active-section-item');
  if (!(nav instanceof HTMLElement) || !(active instanceof HTMLElement)) return null;
  return { nav, active };
}
```

**Step 2: Update nav-controller for scroll-based j/k**

In `src/features/navigation/nav-controller.ts`:

1. Update the import from dom-data (line 2):
```typescript
import { getAdjacentArticle, getSectionCarouselElements } from '@/features/navigation/dom-data';
```

2. Replace the j/k handling (lines 98-110) with scroll-based navigation:
```typescript
  if (event.key === 'j') {
    const next = getAdjacentArticle('down');
    if (next) {
      event.preventDefault();
      next.scrollIntoView({ behavior: 'smooth' });
    }
  }

  if (event.key === 'k') {
    const prev = getAdjacentArticle('up');
    if (prev) {
      event.preventDefault();
      prev.scrollIntoView({ behavior: 'smooth' });
    }
  }
```

3. Remove the `getArticleNeighborUrls` call (line 76) since j/k no longer need prev/next URLs. Also remove the `isNavigating` check for j/k (scrolling doesn't need it). Keep the `isNavigating` check for h/l section navigation.

The full `handleKeyNavigation` function becomes:

```typescript
function handleKeyNavigation(event: KeyboardEvent) {
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  if (isTypingTarget(event.target)) return;

  const state = getPortfolioNavState();

  if (event.key === 'h') {
    if (state.isNavigating) return;
    const left = document.querySelector('a[data-nav-nearest="prev"]');
    if (left instanceof HTMLAnchorElement) {
      event.preventDefault();
      state.isNavigating = true;
      setNavState('left', 'section', 'keyboard');
      navigateTo(left.href);
    }
  }

  if (event.key === 'l') {
    if (state.isNavigating) return;
    const right = document.querySelector('a[data-nav-nearest="next"]');
    if (right instanceof HTMLAnchorElement) {
      event.preventDefault();
      state.isNavigating = true;
      setNavState('right', 'section', 'keyboard');
      navigateTo(right.href);
    }
  }

  if (event.key === 'j') {
    const next = getAdjacentArticle('down');
    if (next) {
      event.preventDefault();
      next.scrollIntoView({ behavior: 'smooth' });
    }
  }

  if (event.key === 'k') {
    const prev = getAdjacentArticle('up');
    if (prev) {
      event.preventDefault();
      prev.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
```

**Step 3: Verify build compiles**

Run: `npm run build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: j/k keyboard shortcuts scroll to adjacent articles"
```

---

### Task 6: Update sidebar for same-section scroll navigation

**Files:**
- Modify: `src/features/sidebar/sidebar-controller.ts:51-65`

**Step 1: Intercept same-section sidebar clicks for scroll navigation**

In `src/features/sidebar/sidebar-controller.ts`, update the `handleDocumentClick` function. The existing code at lines 62-65 handles sidebar link clicks on mobile (closes sidebar). We need to also intercept same-section links and scroll instead of navigating.

Replace the `handleDocumentClick` function:

```typescript
function handleDocumentClick(event: MouseEvent) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const toggle = target.closest('#index-toggle');
  if (toggle instanceof HTMLButtonElement) {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    setDrawer(!expanded);
    return;
  }

  const sidebarLink = target.closest('#sidebar-index a[href]');
  if (sidebarLink instanceof HTMLAnchorElement) {
    // Check if this is a same-section link (scroll instead of navigate)
    const href = sidebarLink.getAttribute('href') || '';
    const currentSection = window.location.pathname.split('/')[1];
    const linkSection = href.split('/')[1];

    if (currentSection && linkSection === currentSection) {
      event.preventDefault();
      const slug = href.split('/')[2];
      const articleEl = document.getElementById(`article-${slug}`);
      if (articleEl) {
        articleEl.scrollIntoView({ behavior: 'smooth' });
      }
    }

    if (!isDesktopViewport()) {
      setDrawer(false, { persistDesktop: false });
    }
  }
}
```

**Step 2: Verify build compiles**

Run: `npm run build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: sidebar links scroll to articles within same section"
```

---

### Task 7: Clean up view transitions CSS for article navigation

**Files:**
- Modify: `src/styles/state/transitions.css`

**Step 1: Remove article view transition animations**

Since articles are now reached via scroll instead of route change, the article view transition animations are no longer triggered. Remove the article-specific rules and keyframes but keep section transitions.

In `src/styles/state/transitions.css`, remove:
- Lines 22-26: `data-nav-axis='article'` duration/easing rules
- Lines 42-45: Article direction animation assignments
- Lines 52-55: Keyboard article direction animation assignments
- Lines 82-100: `article-root-out-up`, `article-root-in-down`, `article-root-out-down`, `article-root-in-up` keyframes
- Lines 122-140: `key-article-root-out-up`, `key-article-root-in-down`, `key-article-root-out-down`, `key-article-root-in-up` keyframes
- Lines 144, 148: `--article-shift` and `--key-article-shift` from reduced motion

Also remove `--article-shift` and `--key-article-shift` from `src/styles/responsive.css` line 6.

The resulting `transitions.css` should only contain section-related transitions.

**Step 2: Verify build compiles**

Run: `npm run build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add -A && git commit -m "refactor: remove unused article view transition animations"
```

---

### Task 8: Update article page to remove prevUrl/nextUrl prop passing

**Files:**
- Modify: `app/[section]/[slug]/page.tsx` (already done in Task 3)

This was already handled in Task 3 — the rewritten page no longer passes `prevUrl`/`nextUrl` to BaseLayout since we removed those props in Task 1.

**Step 1: Verify the full flow works**

Run: `npm run build && npm run start`

Manual testing checklist:
- [ ] Navigate to any article URL — page loads with all section articles
- [ ] Scroll down — URL updates as new articles come into view
- [ ] Sidebar highlights update as you scroll
- [ ] Status line updates position as you scroll
- [ ] Press `j` — smooth scrolls to next article
- [ ] Press `k` — smooth scrolls to previous article
- [ ] Press `h`/`l` — navigates to adjacent section with view transition
- [ ] Click sidebar link in same section — scrolls to article
- [ ] Click sidebar link in different section — navigates with route change
- [ ] Mobile: no pull-to-refresh conflicts
- [ ] Mobile: sidebar closes after link click
- [ ] Direct URL `/section/slug` loads scrolled to correct article

**Step 2: Final commit**

```bash
git add -A && git commit -m "feat: continuous scroll navigation replaces PeekSnap"
```
