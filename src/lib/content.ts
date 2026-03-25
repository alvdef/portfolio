import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export type Doc = {
  _id: string;
  title: string;
  order: number;
  date: string;
  group?: string;
  groupSlug?: string;
  tag?: string[];
  component?: string;
  playlist?: string;
  username?: string;
  slug: string;
  section: string;
  href: string;
  raw: string;
};

function slugifyGroup(group: string): string {
  return group.toLowerCase().replace(/\s+/g, '-');
}

const vaultDir = path.join(process.cwd(), 'vault');

function walkMd(dir: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name.startsWith('_')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkMd(full));
    } else if (entry.name.endsWith('.md')) {
      files.push(full);
    }
  }
  return files;
}

function loadAll(): Doc[] {
  return walkMd(vaultDir).map((file) => {
    const content = fs.readFileSync(file, 'utf8');
    const { data, content: raw } = matter(content);
    const rel = path.relative(vaultDir, file);
    const section = rel.split(path.sep)[0];
    const slug = path.basename(file, '.md');
    const group = data.group as string | undefined;
    const groupSlug = group ? slugifyGroup(group) : undefined;
    const href = groupSlug
      ? `/${section}/${groupSlug}/${slug}`
      : `/${section}/${slug}`;
    return {
      _id: rel,
      title: data.title as string,
      order: data.order as number,
      date: data.date as string,
      group,
      groupSlug,
      tag: data.tag as string[] | undefined,
      component: data.component as string | undefined,
      playlist: data.playlist as string | undefined,
      username: data.username as string | undefined,
      slug,
      section,
      href,
      raw,
    };
  });
}

let cached: Doc[] | null = null;

function allDocs(): Doc[] {
  if (!cached) cached = loadAll();
  return cached;
}

function compareDocs(a: Doc, b: Doc) {
  return a.order - b.order || a.title.localeCompare(b.title);
}

export function getPublishedDocs(): Doc[] {
  return allDocs().slice().sort(compareDocs);
}

export function getSectionsInUse() {
  return [...new Set(getPublishedDocs().map((doc) => doc.section))];
}

export function getDocsForSection(section: string) {
  return getPublishedDocs().filter((doc) => doc.section === section);
}

export function getDocBySectionAndSlug(section: string, slug: string) {
  return getPublishedDocs().find((doc) => doc.section === section && doc.slug === slug);
}

export function getDocsForPage(section: string, groupSlug?: string) {
  return getPublishedDocs().filter(
    (d) => d.section === section && d.groupSlug === groupSlug
  );
}

export function groupDocsByGroup<T extends { group?: string }>(docs: T[]) {
  const grouped = new Map<string, T[]>();
  for (const doc of docs) {
    const key = doc.group ?? '';
    const arr = grouped.get(key) ?? [];
    arr.push(doc);
    grouped.set(key, arr);
  }
  return [...grouped.entries()].map(([group, items]) => ({ group, items }));
}
