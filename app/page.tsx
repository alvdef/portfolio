import { notFound } from 'next/navigation';
import BaseLayout from '@/components/layout/BaseLayout';
import MdxContent from '@/components/content/MdxContent';
import { getPublishedDocs, groupDocsByGroup, HOME_SECTION } from '@/lib/content';
import { getSectionLandingLinks } from '@/features/navigation/section-links';

export default async function HomePage() {
  const docs = getPublishedDocs();
  const home = docs.find((item) => item.section === HOME_SECTION);
  if (!home) notFound();

  const sections = [...new Set(docs.map((item) => item.section))];
  const sectionLinks = getSectionLandingLinks(docs, sections);
  // On the home page the sidebar is a site index: every other article, grouped by section.
  const sidebarGroups = sections
    .filter((section) => section !== HOME_SECTION)
    .flatMap((section) =>
      groupDocsByGroup(docs.filter((item) => item.section === section)).map(({ group, items }) => ({
        group: group || section,
        items: items.map((item) => ({ title: item.title, slug: item.slug, href: item.href }))
      }))
    );

  return (
    <BaseLayout
      currentSection={HOME_SECTION}
      sections={sections}
      sectionLinks={sectionLinks}
      sectionGroups={sidebarGroups}
      currentSlug={home.slug}
      articleIndex={1}
      articleTotal={1}
    >
      <article className="article-body home-body" data-article-active="true">
        <header className="article-header">
          <h1>{home.title}</h1>
        </header>
        <MdxContent source={home.raw} />
      </article>
    </BaseLayout>
  );
}
