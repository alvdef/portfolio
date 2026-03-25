export function getSectionLandingLinks<T extends { section: string; href: string; order: number }>(
  docs: T[],
  sections: string[]
) {
  return Object.fromEntries(
    sections.map((section) => {
      const firstInSection = docs
        .filter((item) => item.section === section)
        .sort((a, b) => a.order - b.order)[0];
      return [section, firstInSection ? firstInSection.href : `/${section}`];
    })
  );
}
