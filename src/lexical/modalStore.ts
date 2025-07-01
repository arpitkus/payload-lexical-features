
// 
import { proxy } from 'valtio'
import { NodeKey } from 'lexical'

type ModalMode = 'edit' | 'insert'

interface ModalStore {
  // Indicates if the modal is currently open
  // This is used to control the visibility of the modal in the UI
  // When true, the modal is displayed; when false, it is hidden
  // This state is managed by the modalActions to open and close the modal as needed
  isOpen: boolean
  content: string
  nodeKey: NodeKey | null
  mode: ModalMode
  footnoteID?: number
}

export const modalStore = proxy<ModalStore>({
  isOpen: false,
  content: '',
  nodeKey: null,
  mode: 'insert',
  footnoteID: undefined,
})

export const modalActions = {
  open(nodeKey: NodeKey | null = null, footnoteID?: number) {
    modalStore.isOpen = true
    modalStore.nodeKey = nodeKey
    modalStore.mode = nodeKey ? 'edit' : 'insert'
    modalStore.footnoteID = footnoteID
  },
  openForNew(footnoteID?: number) {
    modalStore.isOpen = true
    modalStore.nodeKey = null
    modalStore.mode = 'insert'
    modalStore.footnoteID = footnoteID
  },
  close() {
    modalStore.isOpen = false
    modalStore.content = ''
    modalStore.nodeKey = null
    modalStore.mode = 'insert'
    modalStore.footnoteID = undefined
  },
  setContent(content: string) {
    modalStore.content = content
  },
}