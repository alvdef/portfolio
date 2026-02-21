import { allDocs, type Doc } from 'contentlayer/generated';

export type VirtualDocData = {
  title: string;
  slug: string;
  order: number;
  date: string;
  section: string;
  group: string;
  status: string;
  tag?: string[];
  isVirtual: true;
};

export type VirtualDocEntry = {
  _id: string;
  _raw: { flattenedPath: string };
  sourceType: 'virtual';
  body?: { code: string };
} & VirtualDocData;

export type DocEntry = (Doc & { sourceType: 'doc' }) | VirtualDocEntry;

function toDocEntry(doc: Doc): DocEntry {
  return { ...doc, sourceType: 'doc' };
}

function getVirtualDocs(): VirtualDocEntry[] {
  return [
    {
      _id: 'virtual:about_me:youtube',
      _raw: { flattenedPath: 'about_me/youtube' },
      sourceType: 'virtual',
      title: 'YouTube Recommendations',
      slug: 'youtube',
      order: 9998,
      date: '2026-02-21',
      section: 'about_me',
      group: 'PERSONAL',
      status: 'published',
      tag: ['YOUTUBE'],
      isVirtual: true
    }
  ];
}

function compareDocs(a: DocEntry, b: DocEntry) {
  return a.order - b.order || a.title.localeCompare(b.title);
}

export async function getPublishedDocs(): Promise<DocEntry[]> {
  const docs = allDocs
    .filter((doc) => doc.status !== 'draft')
    .map((doc) => toDocEntry(doc));

  return [...docs, ...getVirtualDocs()].sort(compareDocs);
}

export async function getSectionsInUse() {
  const docs = await getPublishedDocs();
  return [...new Set(docs.map((doc) => doc.section))];
}

export async function getDocsForSection(section: string) {
  const docs = await getPublishedDocs();
  return docs.filter((doc) => doc.section === section);
}

export async function getDocBySectionAndSlug(section: string, slug: string) {
  const docs = await getPublishedDocs();
  return docs.find((doc) => doc.section === section && doc.slug === slug);
}

export function groupDocsByGroup<T extends { group: string }>(docs: T[]) {
  const grouped = new Map<string, T[]>();
  for (const doc of docs) {
    const arr = grouped.get(doc.group) ?? [];
    arr.push(doc);
    grouped.set(doc.group, arr);
  }
  return [...grouped.entries()].map(([group, items]) => ({ group, items }));
}
