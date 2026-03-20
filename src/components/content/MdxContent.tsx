import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkWikilinks from '@/lib/remark-wikilinks';

type Props = {
  source: string;
};

export default function MdxContent({ source }: Props) {
  return (
    <MDXRemote
      source={source}
      options={{ mdxOptions: { remarkPlugins: [remarkWikilinks] } }}
    />
  );
}
