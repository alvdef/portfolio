export function getSectionLandingLinks<T extends { section: string; slug: string; order: number }>(
  docs: T[],
  sections: string[]
) {
  return Object.fromEntries(
    sections.map((section) => {
      const firstInSection = docs
        .filter((item) => item.section === section)
        .sort((a, b) => a.order - b.order)[0];
      return [section, firstInSection ? `/${section}/${firstInSection.slug}` : `/${section}`];
    })
  );
}
