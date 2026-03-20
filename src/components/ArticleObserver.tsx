'use client';

import { useEffect, useRef } from 'react';

type Props = {
  initialSlug: string;
  section: string;
  totalArticles: number;
};

export default function ArticleObserver({ initialSlug, section, totalArticles }: Props) {
  const hasScrolledRef = useRef(false);
  const activeSlugRef = useRef(initialSlug);

  useEffect(() => {
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

    const articles = Array.from(contentPane.querySelectorAll<HTMLElement>('[data-article-slug]'));
    if (articles.length === 0) return;

    function activate(slug: string, index: string | undefined) {
      const changed = slug !== activeSlugRef.current;
      activeSlugRef.current = slug;

      articles.forEach((a) => {
        a.dataset.articleActive = a.dataset.articleSlug === slug ? 'true' : 'false';
      });

      if (!changed) return;

      const newUrl = `/${section}/${slug}`;
      if (window.location.pathname !== newUrl) {
        window.history.replaceState(null, '', newUrl);
      }

      const sidebar = document.getElementById('sidebar-index');
      if (sidebar) {
        sidebar.querySelectorAll('a').forEach((a) => a.classList.remove('active'));
        sidebar.querySelector(`a[href="${newUrl}"]`)?.classList.add('active');
      }

      const breadcrumb = document.querySelector('.status-breadcrumb');
      if (breadcrumb && index) {
        breadcrumb.textContent = `${section}/${slug} [${index}/${totalArticles}]`;
      }
    }

    // Set initial state
    activate(initialSlug, articles.find((a) => a.dataset.articleSlug === initialSlug)?.dataset.articleIndex);

    // On scroll, activate the last article whose top has scrolled past the trigger line
    function onScroll() {
      const trigger = contentPane!.getBoundingClientRect().top + contentPane!.clientHeight * 0.4;

      let active: HTMLElement = articles[0];
      for (const article of articles) {
        if (article.getBoundingClientRect().top <= trigger) {
          active = article;
        }
      }

      activate(active.dataset.articleSlug!, active.dataset.articleIndex);
    }

    contentPane.addEventListener('scroll', onScroll, { passive: true });
    return () => contentPane.removeEventListener('scroll', onScroll);
  }, [section, totalArticles, initialSlug]);

  return null;
}
