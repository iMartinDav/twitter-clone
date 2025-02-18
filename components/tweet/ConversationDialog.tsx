'use client'

import React, { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
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
import { Gift, ImagePlus, List, Smile, MapPin, Loader2, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Profile {
  id: string
  full_name: string
  username: string
  avatar_url: string
  bio: string
}

interface Tweet {
  id: string
  content: string
  created_at: string
  user_id: string
  profile: Profile
}

type ActionIconType = typeof Gift | typeof ImagePlus | typeof List | typeof Smile | typeof MapPin

interface ActionIcon {
  icon: ActionIconType
  label: string
}

interface ConversationDialogProps {
  tweetId: string
  children: React.ReactNode
  replyCount?: number
  maxLength?: number
}

const ACTIONS: ActionIcon[] = [
  { icon: ImagePlus, label: 'Add image' },
  { icon: Gift, label: 'Add gift' },
  { icon: List, label: 'Add list' },
  { icon: Smile, label: 'Add emoji' },
  { icon: MapPin, label: 'Add location' },
]

export const ConversationDialog: React.FC<ConversationDialogProps> = ({
  tweetId,
  children,
  replyCount,
  maxLength = 280,
}) => {
  const [content, setContent] = useState('')
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [parentTweet, setParentTweet] = useState<Tweet | null>(null)
  const { user, session } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClientComponentClient()

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

    const fetchParentTweet = async () => {
      try {
        const { data, error } = await supabase
          .from('tweets')
          .select(`
            *,
            profile:profiles(*)
          `)
          .eq('id', tweetId)
          .single()

        if (error) throw error
        if (data) setParentTweet(data as Tweet)
      } catch (error) {
        console.error('Error fetching tweet:', error)
      }
    }

    if (open) {
      fetchProfile()
      fetchParentTweet()
    }

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
  }, [session?.user?.id, supabase, tweetId, open])

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to reply to tweets',
        variant: 'destructive',
      })
      return
    }
    setOpen(newOpen)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isSubmitting || !user) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('tweets')
        .insert([{ 
          content: content.trim(), 
          user_id: user.id,
          reply_to: tweetId 
        }])

      if (error) throw error

      toast({ title: 'Success', description: 'Reply posted!' })
      setContent('')
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to post reply',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const characterCount = content.length
  const isOverLimit = characterCount > maxLength
  const remainingChars = maxLength - characterCount
  const progressPercentage = (characterCount / maxLength) * 100

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-full max-w-[600px] p-0 bg-[#16141D] border border-[#25252C] rounded-xl shadow-2xl">
        <DialogHeader className="border-b border-[#25252C] px-4 py-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-[#9898c5] text-lg font-medium text-center flex-1">
              Reply to Tweet
            </DialogTitle>
          </div>
        </DialogHeader>

        <DialogDescription className="sr-only">A dialog to reply to a tweet.</DialogDescription>

        <div className="p-4">
          {/* Parent Tweet */}
          {parentTweet && (
            <div className="mb-4 border-b border-[#25252C] pb-4">
              <div className="flex gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage
                    src={parentTweet.profile.avatar_url}
                    className="object-cover"
                    alt={parentTweet.profile.full_name}
                  />
                  <AvatarFallback className="bg-[#352f4d] text-white">
                    {parentTweet.profile.full_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#9898c5]">
                      {parentTweet.profile.full_name}
                    </span>
                    <span className="text-sm text-[#6b7280]">
                      @{parentTweet.profile.username}
                    </span>
                    <span className="text-sm text-[#6b7280]">·</span>
                    <span className="text-sm text-[#6b7280]">
                      {formatDistanceToNow(new Date(parentTweet.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-[#9898c5] mt-1">{parentTweet.content}</p>
                </div>
              </div>
            </div>
          )}

          {/* Reply Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Tweet your reply"
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
              </div>
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
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Reply'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const ConversationButton = ({ tweetId, replyCount }: { tweetId: string; replyCount?: number }) => (
  <ConversationDialog tweetId={tweetId} replyCount={replyCount}>
    <Button
      variant="ghost"
      size="icon"
      className="text-muted-foreground group hover:text-blue-400"
    >
      <MessageSquare className="h-5 w-5" />
      {typeof replyCount === 'number' && replyCount > 0 && (
        <span className="ml-2 text-sm group-hover:text-blue-400">
          {replyCount}
        </span>
      )}
    </Button>
  </ConversationDialog>
)
