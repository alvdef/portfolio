export interface PortfolioNavState {
  isNavigating: boolean;
  pauseOverscroll: boolean;
}

declare global {
  interface Window {
    __portfolioNavState?: PortfolioNavState;
    __themeAnimTimeout?: number;
    __portfolioAfterSwapBound?: boolean;
    __portfolioNavigate?: (url: string) => void;
  }
}

export function getPortfolioNavState(): PortfolioNavState {
  if (!window.__portfolioNavState) {
    window.__portfolioNavState = { isNavigating: false, pauseOverscroll: false };
  }
  return window.__portfolioNavState;
}
