import { getCollection } from 'astro:content';

export type DocEntry = Awaited<ReturnType<typeof getPublishedDocs>>[number];

export async function getPublishedDocs() {
  const docs = await getCollection('docs', ({ data }) => data.status !== 'draft');
  return docs.sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title));
}

export async function getSectionsInUse() {
  const docs = await getPublishedDocs();
  return [...new Set(docs.map((doc) => doc.data.section))];
}

export async function getDocsForSection(section: string) {
  const docs = await getPublishedDocs();
  return docs.filter((doc) => doc.data.section === section);
}

export async function getDocBySectionAndSlug(section: string, slug: string) {
  const docs = await getPublishedDocs();
  return docs.find((doc) => doc.data.section === section && doc.data.slug === slug);
}

export function groupDocsByGroup<T extends { data: { group: string } }>(docs: T[]) {
  const grouped = new Map<string, T[]>();
  for (const doc of docs) {
    const arr = grouped.get(doc.data.group) ?? [];
    arr.push(doc);
    grouped.set(doc.data.group, arr);
  }
  return [...grouped.entries()].map(([group, items]) => ({ group, items }));
}
