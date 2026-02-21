import type { ReactNode } from 'react';
import HeaderCarousel from '@/components/layout/HeaderCarousel';
import Sidebar from '@/components/layout/Sidebar';
import AppRuntime from '@/components/layout/AppRuntime';
import PeekSnap from '@/components/PeekSnap';

type Props = {
  currentSection: string;
  sections: string[];
  sectionLinks: Record<string, string>;
  sectionGroups: Array<{ group: string; items: Array<{ title: string; slug: string; section: string }> }>;
  currentSlug: string;
  prevUrl: string | null;
  nextUrl: string | null;
  articleIndex: number;
  articleTotal: number;
  children: ReactNode;
};

export default function BaseLayout({
  currentSection,
  sections,
  sectionLinks,
  sectionGroups,
  currentSlug,
  prevUrl,
  nextUrl,
  articleIndex,
  articleTotal,
  children
}: Props) {
  return (
    <>
      <AppRuntime />
      <div className="app-grid">
        <HeaderCarousel sections={sections} sectionLinks={sectionLinks} currentSection={currentSection} />
        <Sidebar groups={sectionGroups} currentSlug={currentSlug} />
        <main className="content-pane" data-prev-url={prevUrl ?? ''} data-next-url={nextUrl ?? ''}>
          {children}
        </main>
        <PeekSnap />
      </div>

      <div className="status-line">
        <span className="status-breadcrumb">{currentSection}/{currentSlug} [{articleIndex}/{articleTotal}]</span>
        <span className="status-keys">h/l sections · j/k articles</span>
        <span className="status-credit">Álvaro de Francisco &copy; 2026</span>
      </div>
    </>
  );
}
