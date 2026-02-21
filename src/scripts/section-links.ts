export function getSectionLandingLinks<T extends { data: { section: string; slug: string; order: number } }>(
  docs: T[],
  sections: string[]
) {
  return Object.fromEntries(
    sections.map((section) => {
      const firstInSection = docs
        .filter((item) => item.data.section === section)
        .sort((a, b) => a.data.order - b.data.order)[0];
      return [section, firstInSection ? `/${section}/${firstInSection.data.slug}` : `/${section}`];
    })
  );
}
