import Link from 'next/link';
import ClockWidget from '@/components/ClockWidget';
import SpotifyNowPlaying from '@/components/SpotifyNowPlaying';

type Props = {
  sections: string[];
  currentSection: string;
  sectionLinks?: Record<string, string>;
};

export default function HeaderCarousel({ sections, currentSection, sectionLinks = {} }: Props) {
  const activeIndex = sections.indexOf(currentSection);
  const count = sections.length;
  const half = Math.floor(count / 2);
  const ordered: { name: string; offset: number }[] = [];

  for (let i = -half; i <= half; i += 1) {
    if (count % 2 === 0 && i === half) continue;
    const idx = ((activeIndex + i) % count + count) % count;
    ordered.push({ name: sections[idx], offset: i });
  }

  const leftItems = ordered.filter(({ offset }) => offset < 0);
  const rightItems = ordered.filter(({ offset }) => offset > 0);
  const activeItem = ordered.find(({ offset }) => offset === 0)?.name ?? currentSection;

  return (
    <header className="top-header">
      <div className="widget-left">
        <button id="index-toggle" className="index-toggle" type="button" aria-controls="sidebar-index" aria-expanded="false">
          ≡
        </button>
        <div className="header-clock">
          <ClockWidget />
        </div>
      </div>
      <nav className="carousel-nav" id="section-carousel-nav" aria-label="Section navigation">
        <div className="carousel-rail left">
          {leftItems.map(({ name, offset }) => {
            const nearest = offset === -1 ? 'prev' : undefined;
            return (
              <Link
                key={`${name}-left-${offset}`}
                href={sectionLinks[name] ?? `/${name}`}
                data-nav-dir="left"
                data-nav-axis="section"
                data-nav-nearest={nearest}
                className="carousel-item dimmed"
              >
                {name}
              </Link>
            );
          })}
        </div>
        <span className="carousel-item active" id="active-section-item">{activeItem}</span>
        <div className="carousel-rail right">
          {rightItems.map(({ name, offset }) => {
            const nearest = offset === 1 ? 'next' : undefined;
            return (
              <Link
                key={`${name}-right-${offset}`}
                href={sectionLinks[name] ?? `/${name}`}
                data-nav-dir="right"
                data-nav-axis="section"
                data-nav-nearest={nearest}
                className="carousel-item dimmed"
              >
                {name}
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="widget-right">
        <SpotifyNowPlaying />
        <button id="theme-toggle" type="button" className="theme-toggle" aria-label="Toggle theme">
          ☀
        </button>
      </div>
    </header>
  );
}
