import { DESKTOP_BREAKPOINT_PX, SIDEBAR_DESKTOP_STATE_KEY } from '@/scripts/ui-constants';

interface DrawerOptions {
  persistDesktop?: boolean;
}

let initialized = false;

function isDesktopViewport() {
  return window.innerWidth > DESKTOP_BREAKPOINT_PX;
}

function getDesktopSidebarPreference() {
  const stored = localStorage.getItem(SIDEBAR_DESKTOP_STATE_KEY);
  if (stored === null) return true;
  return stored === 'true';
}

function getControls() {
  const toggleButton = document.getElementById('index-toggle');
  const sidebar = document.getElementById('sidebar-index');
  const grid = document.querySelector('.app-grid');
  if (!(toggleButton instanceof HTMLButtonElement)) return null;
  if (!(sidebar instanceof HTMLElement)) return null;
  if (!(grid instanceof HTMLElement)) return null;
  return { toggleButton, sidebar, grid };
}

export function setDrawer(open: boolean, options: DrawerOptions = {}) {
  const controls = getControls();
  if (!controls) return;

  const { persistDesktop = true } = options;
  controls.toggleButton.setAttribute('aria-expanded', String(open));
  controls.sidebar.dataset.open = open ? 'true' : 'false';
  controls.grid.dataset.sidebarOpen = open ? 'true' : 'false';

  if (persistDesktop && isDesktopViewport()) {
    localStorage.setItem(SIDEBAR_DESKTOP_STATE_KEY, String(open));
  }
}

export function syncSidebarForViewport() {
  if (isDesktopViewport()) {
    setDrawer(getDesktopSidebarPreference(), { persistDesktop: false });
  } else {
    setDrawer(false, { persistDesktop: false });
  }
}

function handleDocumentClick(event: MouseEvent) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const toggle = target.closest('#index-toggle');
  if (toggle instanceof HTMLButtonElement) {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    setDrawer(!expanded);
    return;
  }

  const sidebarLink = target.closest('#sidebar-index a[href]');
  if (sidebarLink instanceof HTMLAnchorElement && !isDesktopViewport()) {
    setDrawer(false, { persistDesktop: false });
  }
}

function handleResize() {
  syncSidebarForViewport();
}

export function initSidebarController() {
  if (initialized) return;
  initialized = true;

  syncSidebarForViewport();
  document.addEventListener('click', handleDocumentClick);
  window.addEventListener('resize', handleResize);
}
