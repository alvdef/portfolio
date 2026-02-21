'use client';

import { useMDXComponent } from 'next-contentlayer/hooks';

type Props = {
  code: string;
};

export default function MdxContent({ code }: Props) {
  const Content = useMDXComponent(code);
  return <Content />;
}
