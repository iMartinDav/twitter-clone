import { create } from 'zustand'

interface EmojiStore {
  isOpen: boolean
  targetInput: string | null
  setIsOpen: (isOpen: boolean) => void
  setTargetInput: (id: string | null) => void
  handleEmojiSelect: (inputId: string, emoji: string) => void
}

export const useEmojiStore = create<EmojiStore>((set) => ({
  isOpen: false,
  targetInput: null,
  
  setIsOpen: (isOpen) => set({ isOpen }),
  setTargetInput: (id) => set({ targetInput: id }),
  
  handleEmojiSelect: (inputId, emoji) => {
    const element = document.getElementById(inputId) as HTMLTextAreaElement
    if (element) {
      const start = element.selectionStart
      const end = element.selectionEnd
      const value = element.value
      element.value = value.slice(0, start) + emoji + value.slice(end)
      element.selectionStart = element.selectionEnd = start + emoji.length
      element.focus()
      
      // Trigger change event
      const event = new Event('input', { bubbles: true })
      element.dispatchEvent(event)
    }
    set({ isOpen: false })
  }
}))
