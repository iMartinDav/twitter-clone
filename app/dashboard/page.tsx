// app/dashboard/page.tsx
'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSquareXTwitter } from 'react-icons/fa6'
import {
  ImagePlus,
  Smile,
  MapPin,
  BarChart4,
  MessageSquare,
  Heart,
  Repeat2,
  Share,
} from 'lucide-react'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { TweetActionButton } from '@/components/tweet/tweet-action-button'
import { useTweetInteractions } from '@/hooks/use-tweet-interactions'
import type { Database } from '@/types/supabase'
import type { Tweet } from '@/types/tweet'

const ACTIONS = [
  { icon: ImagePlus, label: 'Media' },
  { icon: BarChart4, label: 'Poll' },
  { icon: Smile, label: 'Emoji' },
  { icon: MapPin, label: 'Location' },
] as const

export default function Dashboard() {
  const { user, session } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()
  const { interactions, handleLike, fetchTweetInteractions } = useTweetInteractions()

  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [isMounted, setIsMounted] = useState(false)
  const [profile, setProfile] = useState<Database['public']['Tables']['profiles']['Row'] | null>(
    null,
  )
  const [isHovered, setIsHovered] = useState<string | null>(null)

  const maxLength = 280
  const remainingChars = maxLength - content.length
  const charCountColor = useMemo(() => {
    if (remainingChars < 0) return 'text-red-500'
    if (remainingChars < 20) return 'text-yellow-500'
    return 'text-gray-400'
  }, [remainingChars])

  const getAvatarFallback = useCallback((name?: string) => {
    if (!name) return '?'
    return name.charAt(0).toUpperCase()
  }, [])

  const renderAvatar = useCallback(
    (avatarUrl: string | null | undefined, fullName?: string, className = 'h-12 w-12') => (
      <Avatar
        className={`${className} border-2 border-transparent hover:border-[#59F6E8] transition-all`}
      >
        <AvatarImage
          src={avatarUrl || undefined}
          className="object-cover"
          alt={fullName || 'Profile picture'}
        />
        <AvatarFallback className="bg-[#352f4d] text-white text-lg">
          {getAvatarFallback(fullName)}
        </AvatarFallback>
      </Avatar>
    ),
    [getAvatarFallback],
  )

  const fetchTweets = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('tweets')
        .select('*, user:profiles(full_name, username, avatar_url)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTweets(data as Tweet[])
    } catch (error) {
      console.error('Error fetching tweets:', error)
      toast({ title: 'Error', description: 'Failed to load tweets', variant: 'destructive' })
    }
  }, [supabase, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isSubmitting || !user) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('tweets')
        .insert([{ content: content.trim(), user_id: user.id }])

      if (error) throw error

      setContent('')
      toast({ title: 'Success', description: 'Tweet posted!' })
      await fetchTweets()
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

  const handleRealtimeUpdate = useCallback(
    (payload: RealtimePostgresChangesPayload<Database['public']['Tables']['tweets']['Row']>) => {
      if (payload.eventType === 'INSERT') fetchTweets()
      if (payload.eventType === 'DELETE')
        setTweets((prev) => prev.filter((t) => t.id !== payload.old.id))
    },
    [fetchTweets],
  )

  const handleRealtimeLike = useCallback(
    (payload: RealtimePostgresChangesPayload<Database['public']['Tables']['likes']['Row']>) => {
      if ('tweet_id' in payload.new && payload.new.tweet_id)
        fetchTweetInteractions(payload.new.tweet_id)
    },
    [fetchTweetInteractions],
  )

  useEffect(() => {
    setIsMounted(true)
    fetchTweets()

    const tweetsChannel = supabase
      .channel('tweets_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tweets' },
        handleRealtimeUpdate,
      )
      .subscribe()

    const likesChannel = supabase
      .channel('likes_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, handleRealtimeLike)
      .subscribe()

    return () => {
      supabase.removeChannel(tweetsChannel)
      supabase.removeChannel(likesChannel)
    }
  }, [fetchTweets, handleRealtimeLike, handleRealtimeUpdate, supabase])

  useEffect(() => {
    if (!session?.user?.id) return

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        if (error) throw error
        setProfile(data)
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }

    fetchProfile()

    const channel = supabase
      .channel('dashboard_profile')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload) => {
          setProfile(payload.new as Database['public']['Tables']['profiles']['Row'])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session?.user?.id, supabase])

  const renderTweet = useCallback(
    (tweet: Tweet) => (
      <motion.div
        key={tweet.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 hover:bg-white/5 transition-colors border-b border-[#2F3336]"
      >
        <div className="flex gap-4">
          {renderAvatar(tweet.user.avatar_url, tweet.user.full_name)}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-bold text-white truncate hover:underline cursor-pointer">
                {tweet.user.full_name}
              </span>
              <span className="text-gray-500 truncate">@{tweet.user.username}</span>
              <span className="text-gray-500">·</span>
              <time className="text-gray-500" dateTime={tweet.created_at}>
                {format(new Date(tweet.created_at), 'MMM d')}
              </time>
            </div>

            <p className="text-white mt-1 break-words">{tweet.content}</p>

            <div className="flex items-center justify-between mt-3">
              <TweetActionButton
                icon={MessageSquare}
                label="Reply"
                count={interactions[tweet.id]?.replies?.length}
                hoverColor="hover:text-blue-400"
                onClick={() => router.push(`/tweet/${tweet.id}`)}
              />
              <TweetActionButton
                icon={Repeat2}
                label="Retweet"
                count={interactions[tweet.id]?.retweets?.length}
                hoverColor="hover:text-green-400"
              />
              <TweetActionButton
                icon={Heart}
                label="Like"
                count={interactions[tweet.id]?.likes?.length}
                isActive={interactions[tweet.id]?.likes?.some((like) => like.user_id === user?.id)}
                activeColor="text-red-400"
                hoverColor="hover:text-red-400"
                onClick={() => user?.id && handleLike(tweet.id, user.id)}
              />
              <TweetActionButton icon={Share} label="Share" hoverColor="hover:text-blue-400" />
            </div>
          </div>
        </div>
      </motion.div>
    ),
    [interactions, user?.id, router, handleLike, renderAvatar],
  )

  if (!isMounted) return <LoadingSkeleton />

  return (
    <div className="w-full max-w-[600px] mx-auto bg-background">
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b border-[#2F3336]">
        <div className="flex justify-center p-2">
          <FaSquareXTwitter className="text-4xl text-[#59F6E8]" />
        </div>
        <nav className="flex px-4 py-3">
          <Button variant="ghost" className="flex-1 font-semibold relative text-white/90">
            For you
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#6B46CC] rounded-full" />
          </Button>
          <Button variant="ghost" className="flex-1 text-white/50 font-semibold">
            Following
          </Button>
        </nav>
      </header>

      <form onSubmit={handleSubmit} className="border-b border-[#2F3336]">
        <div className="flex p-3 gap-4">
          {renderAvatar(profile?.avatar_url, profile?.full_name)}

          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="What is happening?!"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="text-xl bg-transparent border-none placeholder:text-muted-foreground resize-none min-h-[56px] max-h-[300px] py-2"
              maxLength={maxLength}
            />

            <div className="flex items-center justify-between pt-2 border-t border-[#2F3336]">
              <div className="flex gap-1">
                {ACTIONS.map(({ icon: Icon, label }) => (
                  <Button
                    key={label}
                    variant="ghost"
                    size="icon"
                    className="text-[#6B46CC] hover:bg-foreground/10 h-8 w-8"
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-4">
                {content.length > 0 && (
                  <span className={`text-sm ${charCountColor}`}>
                    {content.length}/{maxLength}
                  </span>
                )}
                <Button
                  type="submit"
                  className="rounded-full bg-[#6B46CC] hover:bg-[#5A37A7] h-8 px-4 text-sm font-bold"
                  disabled={
                    isSubmitting || !content.trim() || content.length > maxLength || !session
                  }
                >
                  {isSubmitting ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>

      <div className="divide-y divide-[#2F3336]">
        {tweets.length > 0 ? (
          tweets.map(renderTweet)
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <p className="text-lg">No tweets yet</p>
            <p className="text-sm mt-2">Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="w-full max-w-[600px] mx-auto space-y-4">
      <div className="sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b border-[#2F3336] p-4">
        <div className="flex gap-8">
          <Skeleton className="h-8 flex-1 rounded-full" />
          <Skeleton className="h-8 flex-1 rounded-full" />
        </div>
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="p-4 border-b border-[#2F3336] space-y-4">
          <div className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
