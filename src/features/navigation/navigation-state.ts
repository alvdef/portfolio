export interface PortfolioNavState {
  isNavigating: boolean;
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
    window.__portfolioNavState = { isNavigating: false };
  }
  return window.__portfolioNavState;
}
