import { visit, SKIP } from 'unist-util-visit';

const wikiImageRe = /!\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g;

export default function remarkWikilinks() {
  return (tree: any) => {
    visit(tree, 'paragraph', (node: any, index: number | undefined, parent: any) => {
      if (index === undefined || !parent) return;

      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (child.type !== 'text' || !wikiImageRe.test(child.value)) continue;

        wikiImageRe.lastIndex = 0;
        const parts: any[] = [];
        let last = 0;
        let hasFigure = false;

        let match;
        while ((match = wikiImageRe.exec(child.value)) !== null) {
          if (match.index > last) {
            parts.push({ type: 'text', value: child.value.slice(last, match.index) });
          }

          const filename = match[1];
          const caption = match[2];

          if (caption) {
            hasFigure = true;
            parts.push({
              type: 'mdxJsxFlowElement',
              name: 'figure',
              attributes: [],
              children: [
                {
                  type: 'mdxJsxFlowElement',
                  name: 'img',
                  attributes: [
                    { type: 'mdxJsxAttribute', name: 'src', value: `/assets/${filename}` },
                    { type: 'mdxJsxAttribute', name: 'alt', value: caption },
                  ],
                  children: [],
                },
                {
                  type: 'mdxJsxFlowElement',
                  name: 'figcaption',
                  attributes: [],
                  children: [{ type: 'text', value: caption }],
                },
              ],
            });
          } else {
            parts.push({
              type: 'image',
              url: `/assets/${filename}`,
              alt: '',
            });
          }
          last = match.index + match[0].length;
        }

        if (last < child.value.length) {
          parts.push({ type: 'text', value: child.value.slice(last) });
        }

        if (hasFigure) {
          // Figure is block-level — replace the paragraph with the parts directly
          parent.children.splice(index, 1, ...parts);
          return [SKIP, index];
        }

        node.children.splice(i, 1, ...parts);
        i += parts.length - 1;
      }
    });
  };
}
