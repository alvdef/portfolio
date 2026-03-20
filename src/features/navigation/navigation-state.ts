declare global {
  interface Window {
    __themeAnimTimeout?: number;
    __portfolioNavigate?: (url: string) => void;
  }
}

export {};
