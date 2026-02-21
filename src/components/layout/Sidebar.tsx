import Link from 'next/link';

type GroupItem = {
  group: string;
  items: Array<{ title: string; slug: string; section: string }>;
};

type Props = {
  groups: GroupItem[];
  currentSlug: string;
};

export default function Sidebar({ groups, currentSlug }: Props) {
  return (
    <aside className="sidebar" id="sidebar-index">
      {groups.map(({ group, items }) => (
        <section key={group}>
          <h2>{group}</h2>
          <ul>
            {items.map((item) => (
              <li key={item.slug}>
                <Link className={item.slug === currentSlug ? 'active' : ''} href={`/${item.section}/${item.slug}`}>
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </aside>
  );
}
