import { notFound } from 'next/navigation';
import BaseLayout from '@/components/layout/BaseLayout';
import MdxContent from '@/components/content/MdxContent';
import YoutubePlaylistTable from '@/components/YoutubePlaylistTable';
import LetterboxdTable from '@/components/LetterboxdTable';
import { getPublishedDocs, groupDocsByGroup } from '@/lib/content';
import { getSectionLandingLinks } from '@/features/navigation/section-links';
import ArticleObserver from '@/components/ArticleObserver';

function toIsoDate(input: string) {
  return new Date(input).toISOString().slice(0, 10);
}

export function generateStaticParams() {
  return getPublishedDocs().map((doc) => ({ section: doc.section, slug: doc.slug }));
}

export default async function ArticlePage({ params }: { params: { section: string; slug: string } }) {
  const { section, slug } = params;

  const docs = getPublishedDocs();
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

  return (
    <BaseLayout
      currentSection={doc.section}
      sections={sections}
      sectionLinks={sectionLinks}
      sectionGroups={sectionGroups}
      currentSlug={doc.slug}
      articleIndex={index + 1}
      articleTotal={sectionDocs.length}
    >
      {sectionDocs.map((sectionDoc, i) => (
        <div key={sectionDoc._id}>
          {i > 0 && <hr className="article-divider" />}
          <article
            id={`article-${sectionDoc.slug}`}
            className="article-body"
            data-article-slug={sectionDoc.slug}
            data-article-index={i + 1}
            data-article-section={sectionDoc.section}
          >
            <header className="article-header">
              <h1>{sectionDoc.title}</h1>
              <p className="meta">
                {sectionDoc.group} / {toIsoDate(sectionDoc.date)}
              </p>
            </header>
            {sectionDoc.raw.trim() && <MdxContent source={sectionDoc.raw} />}
            {sectionDoc.component === 'youtube' && sectionDoc.playlist && (
              <section className="youtube-directory">
                <YoutubePlaylistTable playlistId={sectionDoc.playlist} />
              </section>
            )}
            {sectionDoc.component === 'letterboxd' && sectionDoc.username && (
              <section className="letterboxd-directory">
                <LetterboxdTable username={sectionDoc.username} />
              </section>
            )}
          </article>
        </div>
      ))}
      <ArticleObserver
        initialSlug={slug}
        section={section}
        totalArticles={sectionDocs.length}
      />
    </BaseLayout>
  );
}
