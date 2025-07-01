import {
  ElementNode,
  LexicalNode,
  Spread,
  SerializedElementNode,
  NodeKey,
  createCommand,
  LexicalCommand,
  EditorConfig,
  LexicalEditor,
} from 'lexical'

export const SHOW_FOOTNOTE_POPUP_COMMAND: LexicalCommand<{
  nodeKey: NodeKey
  anchorElement: HTMLElement
}> = createCommand()
export const HIDE_FOOTNOTE_POPUP_COMMAND: LexicalCommand<void> = createCommand()

export type SerializedFootnoteNode = Spread<
  {
    type: 'footnote'
    version: 1
    footnoteID: number
    content: string
  },
  SerializedElementNode
>

export class FootnoteNode extends ElementNode {
  __footnoteID: number
  __content: string

  static getType(): string {
    return 'footnote'
  }

  static clone(node: FootnoteNode): FootnoteNode {
    return new FootnoteNode(node.__footnoteID, node.__content, node.__key)
  }

  constructor(footnoteID: number, content: string = '', key?: NodeKey) {
    super(key)
    this.__footnoteID = footnoteID
    this.__content = content
  }

  createDOM(config: EditorConfig, editor: LexicalEditor): HTMLElement {
    const sup = document.createElement('sup')
    sup.textContent = String(this.__footnoteID)
    sup.className = 'footnote-marker'
    sup.style.cursor = 'pointer'
    sup.style.color = '#0066cc'
    sup.setAttribute('data-footnote-id', String(this.__footnoteID))

    sup.addEventListener('mouseover', () => {
      editor.dispatchCommand(SHOW_FOOTNOTE_POPUP_COMMAND, {
        nodeKey: this.__key,
        anchorElement: sup,
      })
    })
    sup.addEventListener('mouseout', () => {
      editor.dispatchCommand(HIDE_FOOTNOTE_POPUP_COMMAND, undefined)
    })

    return sup
  }

  updateDOM(prevNode: FootnoteNode, dom: HTMLElement): boolean {
    if (this.__footnoteID !== prevNode.__footnoteID) {
      dom.textContent = String(this.__footnoteID)
      dom.setAttribute('data-footnote-id', String(this.__footnoteID))
    }
    return false
  }

  exportJSON(): SerializedFootnoteNode {
    return {
      ...super.exportJSON(),
      type: 'footnote',
      version: 1,
      footnoteID: this.__footnoteID,
      content: this.__content,
    }
  }

  static importJSON(serializedNode: SerializedFootnoteNode): FootnoteNode {
    return new FootnoteNode(serializedNode.footnoteID, serializedNode.content)
  }

  setContent(content: string): void {
    const writable = this.getWritable()
    writable.__content = content
  }

  isInline(): boolean {
    return true
  }
}

export function $createFootnoteNode(footnoteID: number, content: string = ''): FootnoteNode {
  return new FootnoteNode(footnoteID, content)
}

export function $isFootnoteNode(node: LexicalNode | null | undefined): node is FootnoteNode {
  return node instanceof FootnoteNode
}
