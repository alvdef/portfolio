'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { initNavigationController, resetNavigationAfterSwap, syncSectionCarousel } from '@/features/navigation/nav-controller';
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

  useEffect(() => {
    resetNavigationAfterSwap();
    syncThemeAfterSwap();
    syncSidebarForViewport();
    syncSectionCarousel();
  }, [pathname]);

  return null;
}
