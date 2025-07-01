'use client'
import React, { useState, useCallback } from 'react'
import { useSnapshot } from 'valtio'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $getSelection,
  $isRangeSelection,
  $insertNodes,
  $getNodeByKey,
  FORMAT_TEXT_COMMAND,
  RangeSelection,
  LexicalEditor,
  NodeKey,
  EditorConfig,
  $createTextNode,
} from 'lexical'
import { modalStore, modalActions } from '../modalStore'
import { $createFootnoteNode, $isFootnoteNode, FootnoteNode } from '../nodes/FootnoteNode'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { LinkNode, $isLinkNode, TOGGLE_LINK_COMMAND, SerializedLinkNode } from '@lexical/link'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { ListItemNode, ListNode } from '@lexical/list'
import { HeadingNode } from '@lexical/rich-text'
import { $isAtNodeEnd } from '@lexical/selection'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { $isTextNode } from 'lexical'
// Custom LinkNode to ensure links open in a new tab with appropriate attributes
// This is a custom implementation of LinkNode that sets the target and rel attributes
// to ensure links open in a new tab and prevent security vulnerabilities.
// It extends the default LinkNode from Lexical and overrides the createDOM and exportJSON methods
export class CustomLinkNode extends LinkNode {
  static getType(): string {
    return 'link'
  }
  static clone(node: CustomLinkNode): CustomLinkNode {
    return new CustomLinkNode(
      node.getURL(),
      { rel: node.getRel(), target: node.getTarget() },
      node.getKey()
    )
  }
  constructor(
    url: string,
    attributes: { rel?: string | null; target?: string | null } = {},
    key?: NodeKey,
  ) {
    super(url, { ...attributes, rel: 'noopener noreferrer', target: '_blank' }, key)
  }
  createDOM(config: EditorConfig): HTMLAnchorElement {
    const dom = super.createDOM(config)
    if (dom instanceof HTMLAnchorElement) {
      dom.target = '_blank'
      dom.rel = 'noopener noreferrer'
      return dom
    }
    const anchor = document.createElement('a')
    anchor.href = this.getURL()
    anchor.target = '_blank'
    anchor.rel = 'noopener noreferrer'
    if (config.theme?.link) {
      anchor.className = config.theme.link
    }
    return anchor
  }
  static importJSON(serializedNode: SerializedLinkNode): CustomLinkNode {
    const node = new CustomLinkNode(serializedNode.url)
    if (typeof node.setFormat === 'function') node.setFormat(serializedNode.format)
    if (typeof node.setIndent === 'function') node.setIndent(serializedNode.indent)
    if (typeof node.setDirection === 'function') node.setDirection(serializedNode.direction)
    return node
  }
  exportJSON(): SerializedLinkNode {
    return {
      ...super.exportJSON(),
      target: '_blank',
      rel: 'noopener noreferrer',
      type: 'link',
      version: 1,
    }
  }
}

export function $createCustomLinkNode(
  url: string,
  attributes?: { rel?: string | null; target?: string | null },
): CustomLinkNode {
  return new CustomLinkNode(url, attributes)
}

const footnoteEditorConfig = {
  namespace: 'FootnoteEditor',
  nodes: [HeadingNode, ListNode, ListItemNode, CustomLinkNode],
  onError: (error: Error) => {
    console.error('Footnote editor error:', error)
  },
  theme: {
    text: {
      bold: 'font-bold',
      italic: 'italic',
      strikethrough: 'line-through',
    },
    link: 'text-blue-400 underline',
  },
}

function getSelectedNode(selection: RangeSelection) {
  const anchor = selection.anchor
  const focus = selection.focus
  const anchorNode = selection.anchor.getNode()
  const focusNode = selection.focus.getNode()
  if (anchorNode === focusNode) {
    return anchorNode
  }
  const isBackward = selection.isBackward()
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode
  } else {
    return $isAtNodeEnd(anchor) ? focusNode : anchorNode
  }
}

const FootnoteToolbar = () => {
  const [editor] = useLexicalComposerContext()
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)
  const [isLink, setIsLink] = useState(false)

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'))
      setIsItalic(selection.hasFormat('italic'))
      setIsStrikethrough(selection.hasFormat('strikethrough'))
      const node = getSelectedNode(selection)
      const parent = node.getParent()
      setIsLink($isLinkNode(parent) || $isLinkNode(node))
    }
  }, [])

  React.useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar()
      })
    })
  }, [editor, updateToolbar])

  const insertLink = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const node = getSelectedNode(selection)
        const parent = node.getParent()
        if ($isLinkNode(parent) || $isLinkNode(node)) {
          editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
        } else {
          if (selection.getTextContent()) {
            const url = prompt('Enter URL:', 'https://')
            if (url && url.trim()) {
              const linkNode = $createCustomLinkNode(url.trim())
              if (selection.isCollapsed()) {
                linkNode.append($createTextNode(url))
                $insertNodes([linkNode])
              } else {
                const textContent = selection.getTextContent()
                linkNode.append($createTextNode(textContent))
                selection.insertNodes([linkNode])
              }
            }
          } else {
            const url = prompt('Enter URL:', 'https://')
            if (url && url.trim()) {
              editor.dispatchCommand(TOGGLE_LINK_COMMAND, url.trim())
            }
          }
        }
      }
    })
  }, [editor])

  return (
    <div
      style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '10px',
        borderBottom: '1px solid #232323',
        paddingBottom: '10px',
        background: 'transparent',
      }}
    >
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        style={{
          fontWeight: isBold ? 'bold' : 'normal',
          background: isBold ? '#232323' : '#181818',
          color: isBold ? '#fff' : '#bbb',
          border: 'none',
          borderRadius: 8,
          padding: '6px 14px',
          fontSize: '1.1rem',
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
      >
        B
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        style={{
          fontStyle: isItalic ? 'italic' : 'normal',
          background: isItalic ? '#232323' : '#181818',
          color: isItalic ? '#fff' : '#bbb',
          border: 'none',
          borderRadius: 8,
          padding: '6px 14px',
          fontSize: '1.1rem',
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
      >
        I
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
        style={{
          textDecoration: isStrikethrough ? 'line-through' : 'none',
          background: isStrikethrough ? '#232323' : '#181818',
          color: isStrikethrough ? '#fff' : '#bbb',
          border: 'none',
          borderRadius: 8,
          padding: '6px 14px',
          fontSize: '1.1rem',
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
      >
        S
      </button>
      <button
        type="button"
        onClick={insertLink}
        style={{
          textDecoration: isLink ? 'underline' : 'none',
          background: isLink ? '#232323' : '#181818',
          color: isLink ? '#fff' : '#bbb',
          border: 'none',
          borderRadius: 8,
          padding: '6px 14px',
          fontSize: '1.1rem',
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
      >
        Link
      </button>
    </div>
  )
}

export const FootnoteModal: React.FC = () => {
  const [editor] = useLexicalComposerContext()
  const modalState = useSnapshot(modalStore)
  const [modalEditor, setModalEditor] = useState<LexicalEditor | null>(null)

  const initialConfig = {
    ...footnoteEditorConfig,
    editorState: (e: LexicalEditor) => {
      const nodeKey = modalState.nodeKey
      if (nodeKey) {
        const node = editor.getEditorState()._nodeMap.get(nodeKey) as FootnoteNode
        if (node && node.__content) {
          try {
            const parsedState = e.parseEditorState(node.__content)
            e.setEditorState(parsedState)
          } catch (error) {
            console.error('Error parsing footnote content:', error)
          }
        }
      }
    },
  }

  const getNextFootnoteId = React.useCallback(() => {
    let maxId = 0
    editor.getEditorState().read(() => {
      const allNodes = editor.getEditorState()._nodeMap
      allNodes.forEach((node) => {
        if ($isFootnoteNode(node)) {
          maxId = Math.max(maxId, node.__footnoteID)
        }
      })
    })
    return maxId + 1
  }, [editor])

  const handleSave = React.useCallback(() => {
    if (!modalEditor) return

    const editorState = modalEditor.getEditorState()
    const contentToSave = JSON.stringify(editorState.toJSON())
    const nodeKey = modalState.nodeKey

    if (nodeKey) {
      editor.update(() => {
        const node = $getNodeByKey<FootnoteNode>(nodeKey)
        if ($isFootnoteNode(node)) {
          node.setContent(contentToSave)
        }
      })
    } else {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          const nextId = getNextFootnoteId()
          const footnoteNode = $createFootnoteNode(nextId, contentToSave)
          if (!selection.isCollapsed()) {
            const focusNode = selection.focus.getNode();
            if ($isTextNode(focusNode)) {
              selection.setTextNodeRange(
                focusNode,
                selection.focus.offset,
                focusNode,
                selection.focus.offset
              );
            }
            // If not a textNode do nothing:the selection will collapse to the end by default on insert
          }
          $insertNodes([footnoteNode])
        }
      })
    }

    modalActions.close()
  }, [editor, getNextFootnoteId, modalState.nodeKey, modalEditor])

  const handleDelete = useCallback(() => {
    if (!modalState.nodeKey) return
    editor.update(() => {
      const node = $getNodeByKey<FootnoteNode>(modalState.nodeKey!)
      if (node) node.remove()
    })
    modalActions.close()
  }, [editor, modalState.nodeKey])

  if (!modalState.isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(10,10,10,0.96)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.2s',
      }}
      onClick={modalActions.close}
    >
      <div
        style={{
          background: '#181818',
          borderRadius: '18px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.55), 0 1.5px 4px rgba(0,0,0,0.18)',
          padding: '28px 28px 18px 28px',
          minWidth: '340px',
          maxWidth: '420px',
          margin: '40px auto',
          color: '#fff',
          fontFamily: 'inherit',
          border: '1.5px solid #232323',
          position: 'relative',
          animation: 'fadeIn 0.2s',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1.3rem', margin: 0, letterSpacing: 0.5 }}>
            {modalState.nodeKey ? 'Edit Footnote' : 'Add Footnote'}
          </h2>
          {modalState.footnoteID && (
            <span style={{
              marginLeft: 10,
              fontSize: 13,
              color: '#bbb',
              background: '#232323',
              borderRadius: 6,
              padding: '2px 10px',
              fontWeight: 500,
            }}>
              #{modalState.footnoteID}
            </span>
          )}
          <button
            onClick={modalActions.close}
            style={{
              background: 'none',
              border: 'none',
              color: '#bbb',
              fontSize: 22,
              cursor: 'pointer',
              marginLeft: 'auto',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s',
            }}
            aria-label="Close"
          >×</button>
        </div>
        <label style={{ fontWeight: 600, marginBottom: 8, display: 'block', color: '#bbb', fontSize: '1.05rem' }}>
          Content <span style={{ color: '#e53e3e' }}>*</span>
        </label>
        <div
          style={{
            border: '1.5px solid #232323',
            borderRadius: '10px',
            padding: '12px',
            minHeight: '90px',
            position: 'relative',
            marginBottom: '10px',
            background: '#181818',
            color: '#fff',
          }}
        >
          <LexicalComposer initialConfig={initialConfig}>
            <FootnoteToolbar />
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  style={{
                    minHeight: '60px',
                    outline: 'none',
                    color: '#fff',
                    background: 'transparent',
                  }}
                />
              }
              placeholder={
                <div
                  style={{
                    color: '#444',
                    position: 'absolute',
                    top: '30px',
                    left: '14px',
                    pointerEvents: 'none',
                  }}
                >
                </div>
              }
              ErrorBoundary={React.Fragment}
            />
            <OnChangePlugin
              onChange={(editorState, editor) => setModalEditor(editor)}
            />
            <HistoryPlugin />
            <LinkPlugin validateUrl={url => url.startsWith('http')} />
            <ListPlugin />
          </LexicalComposer>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '10px',
          }}
        >
          {modalState.nodeKey && (
            <button
              type="button"
              onClick={handleDelete}
              style={{
                background: '#181818',
                color: '#e53e3e',
                border: '1.5px solid #e53e3e',
                borderRadius: '8px',
                padding: '10px 22px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                marginRight: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'background 0.15s',
              }}
            >
              <FontAwesomeIcon icon={faTrash} style={{ marginRight: 6 }} />
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={modalActions.close}
            style={{
              background: '#232323',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 22px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              background: '#fff',
              color: '#181818',
              border: '1.5px solid #fff',
              borderRadius: '8px',
              padding: '10px 22px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {modalState.nodeKey ? 'Update' : 'Insert'}
          </button>
        </div>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0 }
            to { opacity: 1 }
          }
        `}</style>
      </div>
    </div>
  )
}