'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getPortfolioNavState } from '@/features/navigation/navigation-state';
import { PEEK_MAX, PEEK_SNAP_HOLD_MS, PEEK_THRESHOLD } from '@/features/ui/ui-constants';
import { navigateTo, setNavState } from '@/features/navigation/nav-controller';
import { getAdjacentArticleData, getArticleScrollRoot } from '@/features/navigation/dom-data';

interface PeekData {
  direction: 'up' | 'down';
  amount: number;
  title: string;
  meta: string;
}

export default function PeekSnap() {
  const pathname = usePathname();
  const [peek, setPeek] = useState<PeekData | null>(null);
  const accRef = useRef(0);
  const touchStartYRef = useRef(0);

  useEffect(() => {
    const root = getArticleScrollRoot();
    if (!root) return;
    const rootEl = root;

    function getArticleData(direction: 'up' | 'down') {
      return getAdjacentArticleData(direction);
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
      setNavState(direction === 'up' ? 'up' : 'down', 'article', 'gesture');
      accRef.current = 0;
      setPeek({ direction, amount: PEEK_MAX, title: data.title, meta: data.meta });
      window.setTimeout(() => {
        setPeek(null);
        navigateTo(data.url);
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
      const atTop = rootEl.scrollTop <= 0;
      const atBottom = rootEl.scrollTop + rootEl.clientHeight >= rootEl.scrollHeight;
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
      const atTop = rootEl.scrollTop <= 0;
      const atBottom = rootEl.scrollTop + rootEl.clientHeight >= rootEl.scrollHeight;
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

    rootEl.addEventListener('wheel', onWheel, { passive: true });
    rootEl.addEventListener('scroll', onScroll, { passive: true });
    rootEl.addEventListener('touchstart', onTouchStart, { passive: true });
    rootEl.addEventListener('touchmove', onTouchMove, { passive: true });
    rootEl.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      rootEl.removeEventListener('wheel', onWheel);
      rootEl.removeEventListener('scroll', onScroll);
      rootEl.removeEventListener('touchstart', onTouchStart);
      rootEl.removeEventListener('touchmove', onTouchMove);
      rootEl.removeEventListener('touchend', onTouchEnd);
    };
  }, [pathname]);

  useEffect(() => {
    getPortfolioNavState().isNavigating = false;
    accRef.current = 0;
    setPeek(null);
  }, [pathname]);

  if (!peek || peek.amount === 0) return null;

  const isTop = peek.direction === 'up';
  const style: React.CSSProperties = {
    position: 'fixed',
    left: 0,
    right: 0,
    [isTop ? 'top' : 'bottom']: '0',
    height: `${peek.amount}px`,
    overflow: 'hidden',
    transition: peek.amount === 0 ? 'height var(--ui-duration-fast) var(--ui-ease)' : 'none',
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
