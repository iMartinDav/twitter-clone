'use client'

import React, { useCallback } from 'react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Heart, Repeat2, Share } from 'lucide-react'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { TweetActionButton } from '@/components/tweet/tweet-action-button'
import { ConversationButton } from '@/components/tweet/ConversationDialog'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/components/ui/use-toast' // Ensure this hook is correctly set up
import type { Tweet } from '@/types/tweet'
import { useTweetInteractions } from '@/hooks/use-tweet-interactions'
import { handleRetweetAction } from '@/services/interaction-service' // Ensure this is imported

interface TweetCardProps {
  tweet: Tweet
  className?: string
}

const TweetAvatar: React.FC<{ avatarUrl?: string | null; fullName?: string; className?: string }> = React.memo(
  ({ avatarUrl, fullName, className = 'h-12 w-12' }) => {
    const fallback = fullName ? fullName.charAt(0).toUpperCase() : '?'

    return (
      <Avatar className={`${className} border-2 border-transparent hover:border-[#59F6E8] transition-all`}>
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={`${fullName || 'User'}'s avatar`} className="object-cover" />
        ) : (
          <AvatarFallback className="bg-[#352f4d] text-white">{fallback}</AvatarFallback>
        )}
      </Avatar>
    )
  }
)

TweetAvatar.displayName = 'TweetAvatar'

const TweetHeader: React.FC<{ tweet: Tweet }> = React.memo(({ tweet }) => (
  <div className="flex items-center gap-2 text-sm">
    <span className="font-bold text-white truncate">{tweet.user.full_name}</span>
    <span className="text-gray-500 truncate">@{tweet.user.username}</span>
    <span className="text-gray-500">·</span>
    <time className="text-gray-500" dateTime={tweet.created_at}>
      {format(new Date(tweet.created_at), 'MMM d')}
    </time>
  </div>
))

TweetHeader.displayName = 'TweetHeader'

const TweetActions: React.FC<{ tweet: Tweet }> = React.memo(({ tweet }) => {
  const { user } = useAuth()
  const { interactions, likeTweet, fetchTweetInteractions } = useTweetInteractions()
  const { toast } = useToast()
  const tweetInteraction = interactions[tweet.id] || { likes: [], retweets: [], replies: [] }

  const handleLike = useCallback(async () => {
    if (!user?.id) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to interact with tweets',
        variant: 'destructive',
      })
      return
    }
    try {
      await likeTweet(tweet.id, user.id)
      await fetchTweetInteractions(tweet.id)
      toast({ title: 'Success', description: 'Like updated successfully' })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Action failed',
        variant: 'destructive',
      })
    }
  }, [tweet.id, user?.id, likeTweet, fetchTweetInteractions, toast])

  const handleRetweet = useCallback(async () => {
    if (!user?.id) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to interact with tweets',
        variant: 'destructive',
      })
      return
    }
    try {
      await handleRetweetAction(tweet.id, user.id)
      await fetchTweetInteractions(tweet.id)
      toast({ title: 'Success', description: 'Retweet successful' })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Action failed',
        variant: 'destructive',
      })
    }
  }, [tweet.id, user?.id, fetchTweetInteractions, toast])

  return (
    <div className="flex items-center justify-between mt-3">
      <ConversationButton tweetId={tweet.id} replyCount={tweetInteraction.replies.length} />
      <TweetActionButton
        icon={<Repeat2 className="h-5 w-5" />}
        label="Retweet"
        count={tweetInteraction.retweets.length}
        isActive={tweetInteraction.retweets.some((r) => r.user_id === user?.id)}
        hoverColor="hover:text-green-400"
        activeColor="text-green-400"
        onClick={handleRetweet}
      />
      <TweetActionButton
        icon={<Heart className="h-5 w-5" />}
        label="Like"
        count={tweetInteraction.likes.length}
        isActive={tweetInteraction.likes.some((l) => l.user_id === user?.id)}
        hoverColor="hover:text-red-400"
        activeColor="text-red-400"
        onClick={handleLike}
      />
      <TweetActionButton
        icon={<Share className="h-5 w-5" />}
        label="Share"
        hoverColor="hover:text-blue-400"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(`${window.location.origin}/tweet/${tweet.id}`)
            toast({ title: 'Copied!', description: 'Tweet link copied to clipboard' })
          } catch (error) {
            toast({ title: 'Error', description: 'Failed to copy link', variant: 'destructive' })
          }
        }}
      />
    </div>
  )
})

TweetActions.displayName = 'TweetActions'

export const TweetCard = React.memo<TweetCardProps>(({ tweet, className = '' }) => {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 hover:bg-white/5 border-b border-[#2F3336] cursor-pointer ${className}`}
      onClick={() => router.push(`/tweet/${tweet.id}`)}
    >
      <div className="flex gap-4">
        <TweetAvatar avatarUrl={tweet.user.avatar_url} fullName={tweet.user.full_name} />
        <div className="flex-1 min-w-0">
          <TweetHeader tweet={tweet} />
          <p className="text-white mt-1 break-words">{tweet.content}</p>
          <TweetActions tweet={tweet} />
        </div>
      </div>
    </motion.div>
  )
})

TweetCard.displayName = 'TweetCard'
