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
