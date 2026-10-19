'use client';

import { useEffect, useLayoutEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { consumeSlideArrival, initNavigationController, notifyRouteCommitted, resetNavigationAfterSwap, syncSectionCarousel } from '@/features/navigation/nav-controller';
import { initSidebarController, syncSidebarForViewport } from '@/features/sidebar/sidebar-controller';
import { initThemeController, syncThemeAfterSwap } from '@/features/theme/theme-controller';

export default function AppRuntime() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    window.__portfolioNavigate = (url: string) => {
      router.push(url);
    };

    initNavigationController();
    initSidebarController();
    initThemeController();

    return () => {
      delete window.__portfolioNavigate;
    };
  }, [router]);

  // Runs before paint, so a page that arrives without a slide starts its line reveal from the first frame.
  useLayoutEffect(() => {
    if (!consumeSlideArrival()) {
      document.documentElement.dataset.arrival = 'reveal';
    }
  }, [pathname]);

  useEffect(() => {
    notifyRouteCommitted();
    resetNavigationAfterSwap();
    syncThemeAfterSwap();
    syncSidebarForViewport();
    syncSectionCarousel();
  }, [pathname]);

  return null;
}
