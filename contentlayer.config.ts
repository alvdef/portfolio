import { defineDocumentType, makeSource } from 'contentlayer/source-files';

export const Doc = defineDocumentType(() => ({
  name: 'Doc',
  filePathPattern: '**/*.md',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    slug: { type: 'string', required: true },
    order: { type: 'number', required: true },
    date: { type: 'date', required: true },
    section: { type: 'string', required: true },
    group: { type: 'string', required: true },
    status: { type: 'string', required: true },
    tag: { type: 'list', of: { type: 'string' }, required: false }
  }
}));

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Doc]
});
