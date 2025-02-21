'use client'

import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
}

export default function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  return (
    <Picker
      data={data}
      onEmojiSelect={(emoji: any) => onEmojiSelect(emoji.native)}
      theme="dark"
      previewPosition="none"
      skinTonePosition="none"
      navPosition="bottom"
      perLine={8}
      maxFrequentRows={4}
    />
  )
}
