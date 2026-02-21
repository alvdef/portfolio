import { redirect } from 'next/navigation';
import { getPublishedDocs } from '@/lib/content';

export default async function HomePage() {
  const docs = await getPublishedDocs();
  const firstDoc = docs[0];

  if (!firstDoc) {
    throw new Error('No published content found.');
  }

  redirect(`/${firstDoc.section}/${firstDoc.slug}`);
}
