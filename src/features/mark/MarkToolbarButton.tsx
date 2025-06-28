import React from 'react'
import { $isRangeSelection, FORMAT_TEXT_COMMAND, RangeSelection } from 'lexical'
import { $isTableSelection } from '@lexical/table'
import { MarkIcon } from './MarkIcon'

export const markToolbarButton = {
  key: 'marks',
  label: 'Highlight',
  ChildComponent: MarkIcon,
  isActive: ({ selection }: { selection: any }) => {
    if ($isRangeSelection(selection)) {
      return (selection as RangeSelection).hasFormat('highlight')
    }
    if ($isTableSelection(selection)) {
      return (selection as any).hasFormat?.('highlight') ?? false
    }
    return false
  },
  onSelect: ({ editor }: { editor: any }) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'highlight')
  },
  order: 3,
}