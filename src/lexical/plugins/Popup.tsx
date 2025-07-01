'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getNodeByKey, NodeKey } from 'lexical'
import { modalActions } from '../modalStore'
import {
  FootnoteNode,
  SHOW_FOOTNOTE_POPUP_COMMAND,
  HIDE_FOOTNOTE_POPUP_COMMAND,
} from '../nodes/FootnoteNode'
import { mergeRegister } from '@lexical/utils'
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { LinkNode } from '@lexical/link'
import { HeadingNode } from '@lexical/rich-text'
import { ListItemNode, ListNode } from '@lexical/list'

const popupEditorConfig = {
  namespace: 'FootnotePopupEditor',
  nodes: [HeadingNode, LinkNode, ListNode, ListItemNode],
  onError: (error: Error) => {
    console.error('Popup editor error:', error)
  },
  editable: false,
  theme: {
    text: {
      bold: 'font-bold',
      italic: 'italic',
      strikethrough: 'line-through',
    },
    link: 'text-blue-400 underline',
  },
}
// Register the command to show the footnote popup
interface FootnotePopupProps {
  anchorElement: HTMLElement
  nodeKey: NodeKey
  initialContent: string
  onMouseEnter: () => void
  onMouseLeave: () => void
}

const FootnotePopup: React.FC<FootnotePopupProps> = ({
  // Props for the popup
  anchorElement,
  nodeKey,
  initialContent,
  onMouseEnter,
  onMouseLeave,
}) => {
  const [editor] = useLexicalComposerContext()
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [footnoteID, setFootnoteID] = useState<number | null>(null)

  const initialConfig = {
    ...popupEditorConfig,
    editorState: initialContent,
  }

  useEffect(() => {
    const rect = anchorElement.getBoundingClientRect()
    setPosition({
      top: rect.bottom + 12,
      left: rect.left - 24,
    })
    editor.getEditorState().read(() => {
      const node = $getNodeByKey(nodeKey) as FootnoteNode
      setFootnoteID(node?.__footnoteID ?? null)
    })
  }, [anchorElement, editor, nodeKey])

  const handleDelete = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if (node) node.remove()
    })
  }, [editor, nodeKey])

  const handleEdit = useCallback(() => {
    modalActions.open(nodeKey)
  }, [nodeKey])

  return (
    <div
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 1001,
        background: '#181818',
        borderRadius: '16px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.55), 0 1.5px 4px rgba(0,0,0,0.18)',
        minWidth: '320px',
        maxWidth: '420px',
        padding: '20px 22px 10px 22px',
        color: '#fff',
        fontSize: '1rem',
        fontWeight: 400,
        fontFamily: 'inherit',
        border: '1.5px solid #232323',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        animation: 'fadeIn 0.2s',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
        {footnoteID && (
          <span style={{
            fontSize: 14,
            color: '#bbb',
            background: '#232323',
            borderRadius: 6,
            padding: '2px 10px',
            fontWeight: 500,
            marginRight: 10,
          }}>
            #{footnoteID}
          </span>
        )}
        <span style={{ fontWeight: 500, color: '#fff', fontSize: 15 }}>Footnote</span>
      </div>
      <div
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          marginBottom: '10px',
          paddingBottom: 0,
          borderBottom: '1px solid #232323',
          fontSize: '1rem',
          fontWeight: 400,
          background: 'none',
        }}
      >
        <LexicalComposer initialConfig={initialConfig}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                style={{
                  fontSize: '1rem',
                  fontWeight: 400,
                  background: 'none',
                  color: '#fff',
                  padding: 0,
                  margin: 0,
                  border: 'none',
                  outline: 'none',
                  pointerEvents: 'none',
                  userSelect: 'text',
                }}
              />
            }
            placeholder={null}
            ErrorBoundary={React.Fragment}
          />
          <LinkPlugin />
        </LexicalComposer>
      </div>
      <div
        style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingTop: '2px',
        }}
      >
        <button
          onClick={handleEdit}
          title="Edit footnote"
          style={{
            border: '1.5px solid #232323',
            background: '#232323',
            color: '#fff',
            borderRadius: '8px',
            padding: '7px 12px',
            fontSize: '1.1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            transition: 'background 0.15s, color 0.15s',
          }}
        >
          <FontAwesomeIcon icon={faEdit} />
        </button>
        <button
          onClick={handleDelete}
          title="Delete footnote"
          style={{
            border: '1.5px solid #e53e3e',
            background: '#181818',
            color: '#e53e3e',
            borderRadius: '8px',
            padding: '7px 12px',
            fontSize: '1.1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            transition: 'background 0.15s, color 0.15s',
          }}
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0 }
          to { opacity: 1 }
        }
      `}</style>
    </div>
  )
}

interface ActiveFootnote {
  nodeKey: NodeKey
  anchorElement: HTMLElement
  content: string
}

export const FootnotePopupPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext()
  const [activeFootnote, setActiveFootnote] = useState<ActiveFootnote | null>(null)
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null)

  const showPopup = useCallback(
    (payload: { nodeKey: NodeKey; anchorElement: HTMLElement }) => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
      }
      let content = '{}' // Default content if node not found
      editor.getEditorState().read(() => {
        const node = $getNodeByKey(payload.nodeKey) as FootnoteNode
        if (node && node.__content) {
          content = node.__content
        }
      })
      setActiveFootnote({ ...payload, content })
    },
    [editor],
  )

  const hidePopup = useCallback(() => {
    hideTimerRef.current = setTimeout(() => {
      setActiveFootnote(null)
    }, 200)
  }, [])

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        SHOW_FOOTNOTE_POPUP_COMMAND,
        (payload) => {
          showPopup(payload)
          return true
        },
        1,
      ),
      editor.registerCommand(
        HIDE_FOOTNOTE_POPUP_COMMAND,
        () => {
          hidePopup()
          return true
        },
        1,
      ),
    )
  }, [editor, showPopup, hidePopup])

  if (!activeFootnote) return null  // No active footnote, nothing to render

  return createPortal(
    <FootnotePopup
      anchorElement={activeFootnote.anchorElement}
      nodeKey={activeFootnote.nodeKey}
      initialContent={activeFootnote.content}
      onMouseEnter={() => {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      }}
      onMouseLeave={hidePopup}
    />,
    document.body,
  )
}