'use client'

import React, { createContext, useContext, useState } from 'react'

interface EmojiContextType {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  targetInput: string | null
  setTargetInput: (id: string | null) => void
  handleEmojiSelect: (inputId: string, emoji: string) => void
}

const EmojiContext = createContext<EmojiContextType | undefined>(undefined)

export function EmojiProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [targetInput, setTargetInput] = useState<string | null>(null)

  const handleEmojiSelect = (inputId: string, emoji: string) => {
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
    setIsOpen(false)
  }

  return (
    <EmojiContext.Provider value={{
      isOpen,
      setIsOpen,
      targetInput,
      setTargetInput,
      handleEmojiSelect
    }}>
      {children}
    </EmojiContext.Provider>
  )
}

export const useEmoji = () => {
  const context = useContext(EmojiContext)
  if (!context) {
    throw new Error('useEmoji must be used within an EmojiProvider')
  }
  return context
}
