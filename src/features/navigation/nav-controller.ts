import { getAdjacentArticle, getSectionCarouselElements } from '@/features/navigation/dom-data';

export type NavDir = 'left' | 'right' | 'up' | 'down' | 'none';
export type NavAxis = 'section' | 'article' | 'none';
export type NavInput = 'keyboard' | 'pointer' | 'gesture' | 'system';

let initialized = false;
let isNavigating = false;

export function navigateTo(url: string) {
  if (window.__portfolioNavigate) {
    window.__portfolioNavigate(url);
    return;
  }
  window.location.assign(url);
}

function centerActiveSectionInCarousel() {
  const elements = getSectionCarouselElements();
  if (!elements) return;
  const { nav, active } = elements;

  const target = active.offsetLeft - (nav.clientWidth / 2) + (active.clientWidth / 2);
  nav.scrollTo({ left: Math.max(0, target), behavior: 'auto' });
}

function inferAxisFromDir(dir: NavDir): NavAxis {
  if (dir === 'left' || dir === 'right') return 'section';
  if (dir === 'up' || dir === 'down') return 'article';
  return 'none';
}

export function setNavState(dir: NavDir, axis?: NavAxis, input: NavInput = 'pointer') {
  const root = document.documentElement;
  root.dataset.navDir = dir;
  root.dataset.navAxis = axis ?? inferAxisFromDir(dir);
  root.dataset.navInput = input;
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
  setNavState(dir, axis, 'pointer');
}

function handleKeyNavigation(event: KeyboardEvent) {
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  if (isTypingTarget(event.target)) return;

  if (event.key === 'h') {
    if (isNavigating) return;
    const left = document.querySelector('a[data-nav-nearest="prev"]') ?? document.querySelector('a[data-nav-nearest="next"]');
    if (left instanceof HTMLAnchorElement) {
      event.preventDefault();
      isNavigating = true;
      setNavState('left', 'section', 'keyboard');
      navigateTo(left.href);
    }
  }

  if (event.key === 'l') {
    if (isNavigating) return;
    const right = document.querySelector('a[data-nav-nearest="next"]') ?? document.querySelector('a[data-nav-nearest="prev"]');
    if (right instanceof HTMLAnchorElement) {
      event.preventDefault();
      isNavigating = true;
      setNavState('right', 'section', 'keyboard');
      navigateTo(right.href);
    }
  }

  if (event.key === 'j') {
    const next = getAdjacentArticle('down');
    if (next) {
      event.preventDefault();
      next.scrollIntoView({ behavior: 'smooth' });
    }
  }

  if (event.key === 'k') {
    const prev = getAdjacentArticle('up');
    if (prev) {
      event.preventDefault();
      prev.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

export function resetNavigationAfterSwap() {
  isNavigating = false;
}

export function syncSectionCarousel() {
  window.requestAnimationFrame(centerActiveSectionInCarousel);
}

export function initNavigationController() {
  if (initialized) return;
  initialized = true;

  document.addEventListener('click', handleLinkNavState);
  document.addEventListener('keydown', handleKeyNavigation);
  window.addEventListener('resize', syncSectionCarousel);
  syncSectionCarousel();
}
