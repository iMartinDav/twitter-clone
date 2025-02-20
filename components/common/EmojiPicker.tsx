'use client'

import dynamic from 'next/dynamic'
import { Smile } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { EmojiClickData, Theme } from 'emoji-picker-react'

const EmojiPickerComponent = dynamic(
  () => import('emoji-picker-react').then(mod => mod.default),
  { ssr: false }
)

interface EmojiPickerProps {
  onChange: (emoji: string) => void
}

export function EmojiPicker({ onChange }: EmojiPickerProps) {
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onChange(emojiData.emoji)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full w-9 h-9 hover:bg-[#2F3336]/50 transition-all duration-200"
        >
          <Smile className="h-5 w-5 text-[#6B46CC]" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-full border-none p-0 shadow-xl" 
        side="top" 
        align="start"
      >
        <EmojiPickerComponent
          onEmojiClick={handleEmojiClick}
          theme={Theme.DARK}
          width="100%"
        />
      </PopoverContent>
    </Popover>
  )
}
