'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Gift, ImagePlus, List, Smile, MapPin, Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useEmojiStore } from '@/stores/use-emoji-store'
import { useTweetStore } from '@/stores/use-tweet-store'
import { insertTweet } from '@/services/tweet-service'


interface Profile {
  id: string
  full_name: string
  username: string
  avatar_url: string
  bio: string
}

type ActionIconType = typeof Gift | typeof ImagePlus | typeof List | typeof Smile | typeof MapPin

interface ActionIcon {
  icon: ActionIconType
  label: string
}

interface NewTweetDialogProps {
  children: React.ReactElement
  onTweetPosted?: () => void
  maxLength?: number
}

const ACTIONS: ActionIcon[] = [
  { icon: ImagePlus, label: 'Add image' },
  { icon: Gift, label: 'Add gift' },
  { icon: List, label: 'Add list' },
  { icon: Smile, label: 'Add emoji' },
  { icon: MapPin, label: 'Add location' },
]

const EmojiPicker = dynamic(() => import('@/components/emoji-picker'), {
  loading: () => <Loader2 className="h-5 w-5 animate-spin" />,
  ssr: false
})

export default function NewTweetDialog({
  children,
  onTweetPosted,
  maxLength = 280,
}: NewTweetDialogProps) {
  const [content, setContent] = useState('')
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const { user, session } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { handleEmojiSelect } = useEmojiStore()
  const addTweet = useTweetStore((state) => state.addTweet)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.id) return

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        if (error) throw error
        if (data) setProfile(data)
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }

    fetchProfile()

    const channel = supabase
      .channel('profile_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${session?.user?.id}`,
        },
        (payload) => {
          setProfile(payload.new as Profile)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session?.user?.id, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isSubmitting || !user) return

    setIsSubmitting(true)
    try {
      const newTweet = await insertTweet(content.trim(), user.id, {})
      addTweet(newTweet)
      
      toast({
        title: '🎉 Tweet Posted!',
        description: 'Your tweet has been shared successfully!',
        duration: 4000,
      })

      setContent('')
      setOpen(false)
      setShowEmojiPicker(false)
      onTweetPosted?.()
    } catch (error) {
      console.error('Failed to post tweet:', error)
      toast({
        title: '❌ Error',
        description: 'Could not post your tweet. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEmojiClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowEmojiPicker(!showEmojiPicker)
  }

  const onEmojiSelect = (emoji: string) => {
    if (textareaRef.current) {
      handleEmojiSelect(textareaRef.current.id, emoji)
      const newContent = textareaRef.current.value
      setContent(newContent)
    }
  }

  const characterCount = content.length
  const isOverLimit = characterCount > maxLength
  const remainingChars = maxLength - characterCount
  const progressPercentage = (characterCount / maxLength) * 100

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{React.Children.only(children)}</DialogTrigger>
      <DialogContent className="w-full max-w-[600px] p-0 bg-[#16141D] border border-[#25252C] rounded-xl shadow-2xl">
        <DialogHeader className="border-b border-[#25252C] px-4 py-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-[#9898c5] text-lg font-medium text-center flex-1">
              Create Post
            </DialogTitle>
          </div>
        </DialogHeader>

        <DialogDescription className="sr-only">A dialog to create a new tweet.</DialogDescription>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="flex gap-4">
            <Avatar className="h-10 w-10 shrink-0 ring-2 ring-transparent hover:ring-[#59F6E8] transition-all duration-300">
              <AvatarImage
                src={profile?.avatar_url}
                className="object-cover"
                alt={profile?.full_name || 'Profile picture'}
              />
              <AvatarFallback className="bg-[#352f4d] text-white">
                {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                ref={textareaRef}
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="text-lg bg-transparent border-none text-[#9898c5] placeholder-[#9ca3af] focus:placeholder-[#6b7280] focus:ring-0 resize-none p-0 min-h-[120px]"
                required
                maxLength={maxLength}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#25252C]">
            <div className="flex gap-1">
              {ACTIONS.map(({ icon: Icon, label }) => (
                <Button
                  key={label}
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-9 h-9 hover:bg-[#2F3336]/50 transition-all duration-200"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5 text-[#6B46CC] transition-colors" />
                </Button>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full w-9 h-9 hover:bg-[#2F3336]/50 transition-all duration-200"
                onClick={handleEmojiClick}
                aria-label="Add emoji"
              >
                <Smile className="h-5 w-5 text-[#6B46CC] transition-colors" />
              </Button>
            </div>
            
            {showEmojiPicker && (
              <div 
                className="absolute bottom-20 right-4 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <EmojiPicker onEmojiSelect={onEmojiSelect} />
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <div className="h-1 w-24 bg-[#2F3336] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#6B46CC] transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span
                className={`text-sm ${
                  remainingChars <= 20
                    ? 'text-red-400'
                    : remainingChars <= 50
                      ? 'text-yellow-400'
                      : 'text-[#9898c5]'
                }`}
              >
                {remainingChars}
              </span>
              <Button
                type="submit"
                className="rounded-full bg-[#6B46CC] hover:bg-[#5A37A7] text-white px-6 py-2 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting || !content.trim() || isOverLimit}
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Post'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
