import { notFound } from 'next/navigation';
import BaseLayout from '@/components/layout/BaseLayout';
import MdxContent from '@/components/content/MdxContent';
import YoutubePlaylistTable from '@/components/YoutubePlaylistTable';
import LetterboxdTable from '@/components/LetterboxdTable';
import { getPublishedDocs, getDocsForPage, groupDocsByGroup } from '@/lib/content';
import { getSectionLandingLinks } from '@/features/navigation/section-links';
import ArticleObserver from '@/components/ArticleObserver';

function toIsoDate(input: string) {
  return new Date(input).toISOString().slice(0, 10);
}

export function generateStaticParams() {
  return getPublishedDocs().map((doc) => ({
    section: doc.section,
    slug: doc.groupSlug ? [doc.groupSlug, doc.slug] : [doc.slug],
  }));
}

export default async function ArticlePage({ params }: { params: { section: string; slug: string[] } }) {
  const { section, slug: slugParts } = params;

  let groupSlug: string | undefined;
  let articleSlug: string;

  if (slugParts.length === 2) {
    [groupSlug, articleSlug] = slugParts;
  } else if (slugParts.length === 1) {
    articleSlug = slugParts[0];
  } else {
    notFound();
  }

  const docs = getPublishedDocs();
  const doc = docs.find(
    (item) => item.section === section && item.slug === articleSlug && item.groupSlug === groupSlug
  );
  if (!doc) notFound();

  const pageDocs = getDocsForPage(section, doc.groupSlug);
  const sectionDocs = docs.filter((item) => item.section === section);
  const sections = [...new Set(docs.map((item) => item.section))];
  const sectionLinks = getSectionLandingLinks(docs, sections);
  const sectionGroups = groupDocsByGroup(sectionDocs).map(({ group, items }) => ({
    group,
    items: items.map((item) => ({ title: item.title, slug: item.slug, href: item.href }))
  }));

  const index = pageDocs.findIndex((item) => item._id === doc._id);
  const pathPrefix = doc.groupSlug ? `/${section}/${doc.groupSlug}` : `/${section}`;

  return (
    <BaseLayout
      currentSection={doc.section}
      sections={sections}
      sectionLinks={sectionLinks}
      sectionGroups={sectionGroups}
      currentSlug={doc.slug}
      articleIndex={index + 1}
      articleTotal={pageDocs.length}
    >
      {pageDocs.map((pageDoc, i) => (
        <div key={pageDoc._id}>
          {i > 0 && <hr className="article-divider" />}
          <article
            id={`article-${pageDoc.slug}`}
            className="article-body"
            data-article-slug={pageDoc.slug}
            data-article-index={i + 1}
            data-article-section={pageDoc.section}
          >
            <header className="article-header">
              <h1>{pageDoc.title}</h1>
              <p className="meta">
                {pageDoc.group ? `${pageDoc.group} / ` : ''}{toIsoDate(pageDoc.date)}
              </p>
            </header>
            {pageDoc.raw.trim() && <MdxContent source={pageDoc.raw} />}
            {pageDoc.component === 'youtube' && pageDoc.playlist && (
              <section className="youtube-directory">
                <YoutubePlaylistTable playlistId={pageDoc.playlist} />
              </section>
            )}
            {pageDoc.component === 'letterboxd' && pageDoc.username && (
              <section className="letterboxd-directory">
                <LetterboxdTable username={pageDoc.username} />
              </section>
            )}
          </article>
        </div>
      ))}
      <ArticleObserver
        initialSlug={articleSlug}
        pathPrefix={pathPrefix}
        section={section}
        totalArticles={pageDocs.length}
      />
    </BaseLayout>
  );
}
