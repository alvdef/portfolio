import { THEME_ANIMATION_MS, THEME_STORAGE_KEY } from '@/features/ui/ui-constants';

let initialized = false;

type ThemeMode = 'light' | 'dark';

function resolveThemeMode(): ThemeMode {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getThemeToggle() {
  const button = document.getElementById('theme-toggle');
  return button instanceof HTMLButtonElement ? button : null;
}

export function applyStoredTheme() {
  document.documentElement.dataset.theme = resolveThemeMode();
}

export function syncThemeIcon() {
  const themeToggle = getThemeToggle();
  if (!themeToggle) return;
  themeToggle.textContent = document.documentElement.dataset.theme === 'dark' ? '☾' : '☀';
}

function animateThemeSwap() {
  const root = document.documentElement;
  root.classList.add('theme-animating');
  window.clearTimeout(window.__themeAnimTimeout);
  window.__themeAnimTimeout = window.setTimeout(() => {
    root.classList.remove('theme-animating');
  }, THEME_ANIMATION_MS);
}

function handleThemeToggle(event: MouseEvent) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.id !== 'theme-toggle') return;

  animateThemeSwap();
  const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem(THEME_STORAGE_KEY, next);
  syncThemeIcon();
}

export function syncThemeAfterSwap() {
  applyStoredTheme();
  syncThemeIcon();
  document.documentElement.classList.remove('theme-animating');
}

export function initThemeController() {
  if (initialized) return;
  initialized = true;

  applyStoredTheme();
  syncThemeIcon();
  document.addEventListener('click', handleThemeToggle);
}
