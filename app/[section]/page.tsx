import { notFound, redirect } from 'next/navigation';
import { getDocsForSection, getSectionsInUse } from '@/lib/content';

export function generateStaticParams() {
  return getSectionsInUse().map((section) => ({ section }));
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const docs = getDocsForSection(section);

  if (docs.length === 0) {
    notFound();
  }

  const firstDoc = docs[0];
  redirect(`/${section}/${firstDoc.slug}`);
}
