import { notFound } from 'next/navigation';
import BaseLayout from '@/components/layout/BaseLayout';
import MdxContent from '@/components/content/MdxContent';
import YoutubePlaylistTable from '@/components/YoutubePlaylistTable';
import { getPublishedDocs, groupDocsByGroup } from '@/lib/content';
import { getSectionLandingLinks } from '@/features/navigation/section-links';

function toIsoDate(input: string) {
  return new Date(input).toISOString().slice(0, 10);
}

export async function generateStaticParams() {
  const docs = await getPublishedDocs();
  return docs.map((doc) => ({ section: doc.section, slug: doc.slug }));
}

export default async function ArticlePage({ params }: { params: Promise<{ section: string; slug: string }> }) {
  const { section, slug } = await params;

  const docs = await getPublishedDocs();
  const doc = docs.find((item) => item.section === section && item.slug === slug);
  if (!doc) {
    notFound();
  }

  const sectionDocs = docs.filter((item) => item.section === doc.section);
  const sections = [...new Set(docs.map((item) => item.section))];
  const sectionLinks = getSectionLandingLinks(docs, sections);
  const sectionGroups = groupDocsByGroup(sectionDocs).map(({ group, items }) => ({
    group,
    items: items.map((item) => ({ title: item.title, slug: item.slug, section: item.section }))
  }));

  const index = sectionDocs.findIndex((item) => item._id === doc._id);
  const prevDoc = index > 0 ? sectionDocs[index - 1] : null;
  const nextDoc = index < sectionDocs.length - 1 ? sectionDocs[index + 1] : null;

  const isYoutubeVirtualDoc = doc.sourceType === 'virtual' && doc.section === 'about_me' && doc.slug === 'youtube';

  return (
    <BaseLayout
      currentSection={doc.section}
      sections={sections}
      sectionLinks={sectionLinks}
      sectionGroups={sectionGroups}
      currentSlug={doc.slug}
      prevUrl={prevDoc ? `/${prevDoc.section}/${prevDoc.slug}` : null}
      nextUrl={nextDoc ? `/${nextDoc.section}/${nextDoc.slug}` : null}
      articleIndex={index + 1}
      articleTotal={sectionDocs.length}
    >
      <article
        id="article-scroll-root"
        className="article-body"
        data-next-url={nextDoc ? `/${nextDoc.section}/${nextDoc.slug}` : ''}
        data-prev-url={prevDoc ? `/${prevDoc.section}/${prevDoc.slug}` : ''}
        data-next-title={nextDoc?.title ?? ''}
        data-next-meta={nextDoc ? `${nextDoc.group} / ${toIsoDate(nextDoc.date)}` : ''}
        data-prev-title={prevDoc?.title ?? ''}
        data-prev-meta={prevDoc ? `${prevDoc.group} / ${toIsoDate(prevDoc.date)}` : ''}
      >
        <header className="article-header">
          <h1>{doc.title}</h1>
          <p className="meta">
            {doc.group} / {toIsoDate(doc.date)}
          </p>
        </header>
        {doc.sourceType === 'virtual' ? (
          isYoutubeVirtualDoc ? (
            <section className="youtube-directory">
              <YoutubePlaylistTable />
            </section>
          ) : (
            <p>Virtual document has no renderer.</p>
          )
        ) : doc.body?.code ? (
          <MdxContent code={doc.body.code} />
        ) : (
          <p>Document renderer unavailable.</p>
        )}
      </article>
    </BaseLayout>
  );
}
