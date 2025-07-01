import { createServerFeature } from '@payloadcms/richtext-lexical'
import { FootnoteNode } from '../nodes/FootnoteNode'

export const FootnoteFeature = createServerFeature({
  key: 'footnote',
  feature: {
    ClientFeature: '/lexical/features/FootnoteFeature.client#FootnoteFeature',
    nodes: [{ node: FootnoteNode }],
  },
})