import { createServerFeature } from '@payloadcms/richtext-lexical'

export const MarkFeature = createServerFeature({
  feature: {
    ClientFeature: '@/features/mark/markFeature.client',
  },
  key: 'marks',
})