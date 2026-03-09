import { defineDocumentType, makeSource } from 'contentlayer/source-files';

export const Doc = defineDocumentType(() => ({
  name: 'Doc',
  filePathPattern: '**/*.md',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    order: { type: 'number', required: true },
    date: { type: 'date', required: true },
    group: { type: 'string', required: true },
    status: { type: 'string', required: true },
    tag: { type: 'list', of: { type: 'string' }, required: false }
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.sourceFileName.replace(/\.md$/, '')
    },
    section: {
      type: 'string',
      resolve: (doc) => doc._raw.flattenedPath.split('/')[0]
    }
  }
}));

export default makeSource({
  contentDirPath: 'content',
  contentDirExclude: ['**/_*'],
  documentTypes: [Doc]
});
