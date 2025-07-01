import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { MarkFeature } from '../features/mark/markFeature.server'
import { FootnoteFeature } from '../lexical/features/FootnoteFeature.server'
import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => {
          const filtered = defaultFeatures.filter(
            (feature) => feature.key !== 'subscript' && feature.key !== 'superscript' && feature.key !== 'link' ,
          )
          return [...filtered,MarkFeature(),FootnoteFeature()]
        },
      }),
    },
  ],
}