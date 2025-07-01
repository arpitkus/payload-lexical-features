'use client'
import React from 'react'
import { createClientFeature } from '@payloadcms/richtext-lexical/client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSuperscript } from '@fortawesome/free-solid-svg-icons'
import { FootnoteNode } from '../nodes/FootnoteNode'
import { modalActions } from '../modalStore'
import { FootnoteModal } from '../plugins/Modal'
import { FootnotePopupPlugin } from '../plugins/Popup'

const FootnoteController: React.FC = () => (
  <>
    <FootnoteModal />
    <FootnotePopupPlugin />
  </>
)

const FootnoteToolbarButton: React.FC = () => (
  <button
    type="button"
    title="Insert Footnote"
    aria-label="Insert Footnote"
    onClick={() => modalActions.open()}
    className="toolbar-popup__button"
  >
    <FontAwesomeIcon icon={faSuperscript} />
  </button>
)

export const FootnoteFeature = createClientFeature({
  nodes: [FootnoteNode],
  plugins: [
    {
      Component: FootnoteController,
      position: 'belowContainer',
    },
  ],
  toolbarInline: {
    groups: [
      {
        key: 'format',
        type: 'buttons',
        items: [
          {
            key: 'footnote',
            order: 6,
            Component: FootnoteToolbarButton,
          },
        ],
      },
    ],
  },
})

export { FootnoteToolbarButton }