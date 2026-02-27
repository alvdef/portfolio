'use client';

import { useEffect, useRef } from 'react';

type Props = {
  initialSlug: string;
  section: string;
  totalArticles: number;
};

export default function ArticleObserver({ initialSlug, section, totalArticles }: Props) {
  const hasScrolledRef = useRef(false);
  const ratioMap = useRef(new Map<Element, number>());

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

    const articles = contentPane.querySelectorAll<HTMLElement>('[data-article-slug]');
    if (articles.length === 0) return;

    // Set initial active state
    articles.forEach((article) => {
      article.dataset.articleActive = article.dataset.articleSlug === initialSlug ? 'true' : 'false';
    });

    const observer = new IntersectionObserver(
      (entries) => {
        // Track ratios for all observed articles
        for (const entry of entries) {
          ratioMap.current.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
        }

        // Find article with highest visibility
        let bestEl: HTMLElement | null = null;
        let bestRatio = 0;
        for (const [el, ratio] of ratioMap.current) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestEl = el as HTMLElement;
          }
        }

        if (!bestEl) return;
        const slug = bestEl.dataset.articleSlug;
        const index = bestEl.dataset.articleIndex;
        if (!slug) return;

        // Update active state on all articles
        articles.forEach((article) => {
          article.dataset.articleActive = article === bestEl ? 'true' : 'false';
        });

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
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
      }
    );

    articles.forEach((article) => observer.observe(article));
    return () => {
      observer.disconnect();
      ratioMap.current.clear();
    };
  }, [section, totalArticles, initialSlug]);

  return null;
}
