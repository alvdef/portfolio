import { useEffect, useRef, useState } from 'react';
import { navigate } from 'astro:transitions/client';
import { getPortfolioNavState } from '@/scripts/navigation-state';
import { PEEK_MAX, PEEK_SNAP_HOLD_MS, PEEK_THRESHOLD } from '@/scripts/ui-constants';
import { setNavState } from '@/scripts/nav-controller';

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
      const clamped = Math.min(amount, PEEK_MAX);
      setPeek({ direction, amount: clamped, title: data.title, meta: data.meta });
    }

    function resetPeek() {
      setPeek(prev => prev ? { ...prev, amount: 0 } : null);
      setTimeout(() => setPeek(null), 200);
    }

    function triggerNav(direction: 'up' | 'down') {
      const data = getArticleData(direction);
      if (!data) return;
      const state = getPortfolioNavState();
      state.isNavigating = true;
      setNavState(direction === 'up' ? 'up' : 'down', 'article');
      accRef.current = 0;
      setPeek({ direction, amount: PEEK_MAX, title: data.title, meta: data.meta });
      window.setTimeout(() => {
        setPeek(null);
        navigate(data.url);
      }, PEEK_SNAP_HOLD_MS);
    }

    function resetPeekProgress() {
      if (accRef.current === 0) return;
      accRef.current = 0;
      resetPeek();
    }

    function processOverscrollDelta(delta: number, options: { updateTouchRef?: number } = {}) {
      const state = getPortfolioNavState();
      if (state.isNavigating || state.pauseOverscroll) return;
      if (delta === 0) return;

      if (options.updateTouchRef !== undefined) {
        touchStartYRef.current = options.updateTouchRef;
      }
      const atTop = root.scrollTop <= 0;
      const atBottom = root.scrollTop + root.clientHeight >= root.scrollHeight;
      if (!(atTop || atBottom)) {
        resetPeekProgress();
        return;
      }

      const wantsPrev = atTop && delta < 0;
      const wantsNext = atBottom && delta > 0;
      if (!wantsPrev && !wantsNext) {
        resetPeekProgress();
        return;
      }

      accRef.current += Math.abs(delta);
      const direction = wantsPrev ? 'up' as const : 'down' as const;
      updatePeek(direction, (accRef.current / PEEK_THRESHOLD) * PEEK_MAX);

      if (accRef.current >= PEEK_THRESHOLD) {
        triggerNav(direction);
      }
    }

    const onWheel = (event: WheelEvent) => {
      processOverscrollDelta(event.deltaY);
    };

    const onScroll = () => {
      const atTop = root.scrollTop <= 0;
      const atBottom = root.scrollTop + root.clientHeight >= root.scrollHeight;
      if (!atTop && !atBottom && accRef.current > 0) {
        resetPeekProgress();
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? 0;
    };

    const onTouchMove = (event: TouchEvent) => {
      const currentY = event.touches[0]?.clientY ?? touchStartYRef.current;
      const delta = touchStartYRef.current - currentY;
      processOverscrollDelta(delta, { updateTouchRef: currentY });
    };

    const onTouchEnd = () => {
      if (accRef.current > 0 && accRef.current < PEEK_THRESHOLD) {
        resetPeekProgress();
      }
    };

    const onAfterSwap = () => {
      getPortfolioNavState().isNavigating = false;
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
