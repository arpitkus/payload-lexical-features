'use client'

import {
  createClientFeature as clientFeature,
  toolbarFormatGroupWithItems,
} from '@payloadcms/richtext-lexical/client'
import { markToolbarButton } from './MarkToolbarButton'

const toolbarGroups = [
  toolbarFormatGroupWithItems([markToolbarButton]),
]

export default clientFeature({
  enableFormats: ['highlight'],
  toolbarFixed: { groups: toolbarGroups },
  toolbarInline: { groups: toolbarGroups },
})