'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { Gift, ImagePlus, List, MapPin, Loader2 } from 'lucide-react'
import { EmojiPicker } from '@/components/common/EmojiPicker'
import { insertTweet } from '@/services/tweet-service'

const ACTIONS = [
  { icon: ImagePlus, label: 'Add image' },
  { icon: Gift, label: 'Add gift' },
  { icon: List, label: 'Add list' },
  { icon: MapPin, label: 'Add location' },
]

export function ComposeTweet() {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const maxLength = 280

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isSubmitting || !user) return

    setIsSubmitting(true)
    try {
      await insertTweet(content.trim(), user.id, {})
      setContent('')
      toast({ title: 'Success', description: 'Tweet posted!' })
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to post tweet',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setContent(prev => prev + emoji)
  }

  const characterCount = content.length
  const remainingChars = maxLength - characterCount
  const progressPercentage = (characterCount / maxLength) * 100

  if (!user) return null

  return (
    <div className="border-b border-[#25252C] p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback>{user.email?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="What's happening?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] bg-transparent border-none text-[#9898c5] text-lg placeholder-[#9ca3af] focus:ring-0 resize-none p-0"
              maxLength={maxLength}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="flex gap-1">
            {ACTIONS.map(({ icon: Icon, label }) => (
              <Button
                key={label}
                variant="ghost"
                size="icon"
                className="rounded-full w-9 h-9 hover:bg-[#2F3336]/50"
                aria-label={label}
              >
                <Icon className="h-5 w-5 text-[#6B46CC]" />
              </Button>
            ))}
            <EmojiPicker onChange={handleEmojiSelect} />
          </div>

          <div className="flex items-center gap-3">
            <div className="h-1 w-24 bg-[#2F3336] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#6B46CC] transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className={`text-sm ${remainingChars <= 20 ? 'text-red-400' : 'text-[#9898c5]'}`}>
              {remainingChars}
            </span>
            <Button
              type="submit"
              className="rounded-full bg-[#6B46CC] hover:bg-[#5A37A7] px-6 py-2"
              disabled={isSubmitting || !content.trim() || characterCount > maxLength}
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Tweet'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
