import type { ReactNode } from 'react';
import '@/styles/global.css';

export const metadata = {
  title: 'portfolio',
  description: 'utilitarian portfolio'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-nav-dir="none" data-nav-axis="none" data-nav-input="system">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { const stored = localStorage.getItem('theme'); const nextTheme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); document.documentElement.dataset.theme = nextTheme; })();`
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
