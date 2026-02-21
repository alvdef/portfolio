import { notFound, redirect } from 'next/navigation';
import { getDocsForSection, getSectionsInUse } from '@/lib/content';

export async function generateStaticParams() {
  const sections = await getSectionsInUse();
  return sections.map((section) => ({ section }));
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const docs = await getDocsForSection(section);

  if (docs.length === 0) {
    notFound();
  }

  const firstDoc = docs[0];
  redirect(`/${section}/${firstDoc.slug}`);
}
