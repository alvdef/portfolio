import { useEffect } from 'react';
import { navigate } from 'astro:transitions/client';

declare global {
  interface Window {
    __portfolioNavState?: { isNavigating: boolean; pauseOverscroll?: boolean };
  }
}

const THRESHOLD = 150;

function getState() {
  if (!window.__portfolioNavState) {
    window.__portfolioNavState = { isNavigating: false, pauseOverscroll: false };
  }
  return window.__portfolioNavState;
}

export default function ScrollResistance() {
  useEffect(() => {
    const root = document.getElementById('article-scroll-root');
    if (!root) return;

    let accumulator = 0;

    const onWheel = (event: WheelEvent) => {
      const state = getState();
      if (state.isNavigating || state.pauseOverscroll) return;
      if (event.deltaY === 0) return;

      const atTop = root.scrollTop <= 0;
      const atBottom = root.scrollTop + root.clientHeight >= root.scrollHeight;
      if (!(atTop || atBottom)) {
        accumulator = 0;
        return;
      }

      const wantsPrev = atTop && event.deltaY < 0;
      const wantsNext = atBottom && event.deltaY > 0;
      if (!wantsPrev && !wantsNext) {
        accumulator = 0;
        return;
      }

      accumulator += Math.abs(event.deltaY);
      if (accumulator < THRESHOLD) return;

      const url = wantsPrev ? root.dataset.prevUrl : root.dataset.nextUrl;
      accumulator = 0;
      if (!url) return;

      state.isNavigating = true;
      document.documentElement.dataset.navDir = wantsPrev ? 'up' : 'down';
      navigate(url);
    };

    let touchStartY = 0;
    const onTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? 0;
    };

    const onTouchMove = (event: TouchEvent) => {
      const state = getState();
      if (state.isNavigating || state.pauseOverscroll) return;

      const currentY = event.touches[0]?.clientY ?? touchStartY;
      const delta = touchStartY - currentY;
      if (delta === 0) return;

      const atTop = root.scrollTop <= 0;
      const atBottom = root.scrollTop + root.clientHeight >= root.scrollHeight;
      if (!(atTop || atBottom)) {
        accumulator = 0;
        return;
      }

      const wantsPrev = atTop && delta < 0;
      const wantsNext = atBottom && delta > 0;
      if (!wantsPrev && !wantsNext) {
        accumulator = 0;
        return;
      }

      accumulator += Math.abs(delta);
      touchStartY = currentY;

      if (accumulator < THRESHOLD) return;

      const url = wantsPrev ? root.dataset.prevUrl : root.dataset.nextUrl;
      accumulator = 0;
      if (!url) return;

      state.isNavigating = true;
      document.documentElement.dataset.navDir = wantsPrev ? 'up' : 'down';
      navigate(url);
    };

    const onAfterSwap = () => {
      getState().isNavigating = false;
    };

    root.addEventListener('wheel', onWheel, { passive: true });
    root.addEventListener('touchstart', onTouchStart, { passive: true });
    root.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('astro:after-swap', onAfterSwap);

    return () => {
      root.removeEventListener('wheel', onWheel);
      root.removeEventListener('touchstart', onTouchStart);
      root.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('astro:after-swap', onAfterSwap);
    };
  }, []);

  return null;
}
