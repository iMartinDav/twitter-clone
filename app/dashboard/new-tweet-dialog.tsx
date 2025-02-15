'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Gift, ImagePlus, List, Smile, MapPin } from 'lucide-react'

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
  { icon: Gift, label: 'Add gift' },
  { icon: ImagePlus, label: 'Add image' },
  { icon: List, label: 'Add list' },
  { icon: Smile, label: 'Add emoji' },
  { icon: MapPin, label: 'Add location' },
]

export default function NewTweetDialog({
  children,
  onTweetPosted,
  maxLength = 280,
}: NewTweetDialogProps) {
  const [content, setContent] = useState('')
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
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

    fetchProfile()

    // Subscribe to profile changes
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
    if (!content.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      // Your API call would go here
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulated API call

      toast({ title: 'Success', description: 'Tweet posted!' })
      setContent('')
      setOpen(false)
      router.refresh()
      onTweetPosted?.()
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

  const characterCount = content.length
  const isOverLimit = characterCount > maxLength

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{React.Children.only(children)}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0 bg-[#16141D] border-2 border-[#25252C]">
        <DialogTitle className="sr-only">New Tweet</DialogTitle>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12 shrink-0 border-2 border-transparent hover:border-[#59F6E8] transition-all">
              <AvatarImage 
                src={profile?.avatar_url} 
                className="object-cover"
                alt={profile?.full_name || 'Profile picture'} 
              />
              <AvatarFallback className="bg-[#352f4d] text-white text-lg">
                {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="What is happening ?!"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="text-xl bg-transparent border-none text-[#9898c5] placeholder-[#9ca3af] focus:placeholder-[#6b7280] focus:ring-0 resize-none p-0 min-h-[56px]"
                required
                maxLength={maxLength}
              />
              <div className="text-sm text-gray-400 text-right">
                {characterCount}/{maxLength}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-[#2F3336]">
            <div className="flex gap-2">
              {ACTIONS.map(({ icon: Icon, label }) => (
                <Button
                  key={label}
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-[#2F3336] transition-colors"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5 text-[#6B46CC] hover:bg-[#5A37A7]" />
                </Button>
              ))}
            </div>
            <Button
              type="submit"
              className="rounded-full bg-[#6B46CC] hover:bg-[#5A37A7] text-white px-6 py-2 font-bold transition-colors"
              disabled={isSubmitting || !content.trim() || isOverLimit}
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
