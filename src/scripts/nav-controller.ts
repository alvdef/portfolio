import { navigate } from 'astro:transitions/client';
import { getPortfolioNavState } from '@/scripts/navigation-state';

export type NavDir = 'left' | 'right' | 'up' | 'down' | 'none';
export type NavAxis = 'section' | 'article' | 'none';

let initialized = false;

function inferAxisFromDir(dir: NavDir): NavAxis {
  if (dir === 'left' || dir === 'right') return 'section';
  if (dir === 'up' || dir === 'down') return 'article';
  return 'none';
}

export function setNavState(dir: NavDir, axis?: NavAxis) {
  const root = document.documentElement;
  root.dataset.navDir = dir;
  root.dataset.navAxis = axis ?? inferAxisFromDir(dir);
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
}

function handleLinkNavState(event: MouseEvent) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const link = target.closest('a[href]');
  if (!(link instanceof HTMLAnchorElement)) return;

  const dir = (link.dataset.navDir || 'none') as NavDir;
  const axis = (link.dataset.navAxis as NavAxis | undefined) || inferAxisFromDir(dir);
  setNavState(dir, axis);
}

function handleIframeFocusIn(event: FocusEvent) {
  if (event.target instanceof HTMLIFrameElement) {
    getPortfolioNavState().pauseOverscroll = true;
  }
}

function handleIframeFocusOut(event: FocusEvent) {
  if (event.target instanceof HTMLIFrameElement) {
    getPortfolioNavState().pauseOverscroll = false;
  }
}

function handleKeyNavigation(event: KeyboardEvent) {
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  if (isTypingTarget(event.target)) return;

  const state = getPortfolioNavState();
  if (state.isNavigating) return;

  const root = document.getElementById('article-scroll-root');
  const prevUrl = root?.dataset.prevUrl;
  const nextUrl = root?.dataset.nextUrl;

  if (event.key === 'h') {
    const left = document.querySelector('a[data-nav-nearest="prev"]');
    if (left instanceof HTMLAnchorElement) {
      event.preventDefault();
      state.isNavigating = true;
      setNavState('left', 'section');
      navigate(left.href);
    }
  }

  if (event.key === 'l') {
    const right = document.querySelector('a[data-nav-nearest="next"]');
    if (right instanceof HTMLAnchorElement) {
      event.preventDefault();
      state.isNavigating = true;
      setNavState('right', 'section');
      navigate(right.href);
    }
  }

  if (event.key === 'j' && nextUrl) {
    event.preventDefault();
    state.isNavigating = true;
    setNavState('down', 'article');
    navigate(nextUrl);
  }

  if (event.key === 'k' && prevUrl) {
    event.preventDefault();
    state.isNavigating = true;
    setNavState('up', 'article');
    navigate(prevUrl);
  }
}

function handleBeforePreparation(event: Event) {
  const astroEvent = event as Event & { navigationType?: string };
  if (astroEvent.navigationType === 'traverse') {
    setNavState('none', 'none');
  }
}

export function resetNavigationAfterSwap() {
  getPortfolioNavState().isNavigating = false;
}

export function initNavigationController() {
  if (initialized) return;
  initialized = true;

  document.addEventListener('click', handleLinkNavState);
  document.addEventListener('focusin', handleIframeFocusIn);
  document.addEventListener('focusout', handleIframeFocusOut);
  document.addEventListener('keydown', handleKeyNavigation);
  document.addEventListener('astro:before-preparation', handleBeforePreparation);
}
