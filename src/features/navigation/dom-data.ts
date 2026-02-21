export interface ArticleLinkData {
  url: string;
  title: string;
  meta: string;
}

export function getArticleScrollRoot() {
  const root = document.getElementById('article-scroll-root');
  return root instanceof HTMLElement ? root : null;
}

export function getAdjacentArticleData(direction: 'up' | 'down'): ArticleLinkData | null {
  const root = getArticleScrollRoot();
  if (!root) return null;

  const prefix = direction === 'up' ? 'prev' : 'next';
  const url = root.dataset[`${prefix}Url`];
  if (!url) return null;

  return {
    url,
    title: root.dataset[`${prefix}Title`] || '',
    meta: root.dataset[`${prefix}Meta`] || ''
  };
}

export function getArticleNeighborUrls() {
  const root = getArticleScrollRoot();
  return {
    prevUrl: root?.dataset.prevUrl || '',
    nextUrl: root?.dataset.nextUrl || ''
  };
}

export function getSectionCarouselElements() {
  const nav = document.getElementById('section-carousel-nav');
  const active = document.getElementById('active-section-item');
  if (!(nav instanceof HTMLElement) || !(active instanceof HTMLElement)) return null;
  return { nav, active };
}
