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

interface PeekData {
  direction: 'up' | 'down';
  amount: number;
  title: string;
  meta: string;
}

export default function PeekSnap() {
  const [peek, setPeek] = useState<PeekData | null>(null);
  const accRef = useRef(0);
  const touchStartYRef = useRef(0);

  useEffect(() => {
    const root = document.getElementById('article-scroll-root');
    if (!root) return;

    function getArticleData(direction: 'up' | 'down') {
      const el = document.getElementById('article-scroll-root');
      if (!el) return null;
      const prefix = direction === 'up' ? 'prev' : 'next';
      const url = el.dataset[`${prefix}Url`];
      const title = el.dataset[`${prefix}Title`] || '';
      const meta = el.dataset[`${prefix}Meta`] || '';
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
      const direction = wantsPrev ? 'up' as const : 'down' as const;
      updatePeek(direction, (accRef.current / THRESHOLD) * MAX_PEEK);

      if (accRef.current >= THRESHOLD) {
        triggerNav(direction);
      }
    };

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
      const direction = wantsPrev ? 'up' as const : 'down' as const;
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
