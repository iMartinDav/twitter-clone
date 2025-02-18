'use client'

import React, { useCallback } from 'react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Heart, Repeat2, Share } from 'lucide-react'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/auth-context'
import { useTweetInteractionsContext } from '@/contexts/tweet-interactions-context'
import { useToast } from '@/components/ui/use-toast'
import { handleLikeTweet, handleRetweetAction } from '@/services/interaction-service'
import { ConversationButton } from './ConversationDialog'
import { TweetActionButton } from './tweet-action-button'
import type { Tweet } from '@/types/tweet'

const TweetItem = ({ tweet }: { tweet: Tweet }) => {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { interactions, fetchTweetInteractions } = useTweetInteractionsContext()

  const tweetInteractions = interactions[tweet.id] || { likes: [], retweets: [], replies: [] }

  const handleInteraction = async (action: () => Promise<void>, successMessage: string) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to interact with tweets',
        variant: 'destructive',
      })
      return
    }

    try {
      await action()
      await fetchTweetInteractions(tweet.id)
      toast({ title: 'Success', description: successMessage })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Action failed',
        variant: 'destructive'
      })
    }
  }

  const handleLike = () => {
    handleInteraction(
      () => handleLikeTweet(tweet.id, user!.id),
      'Like updated successfully'
    )
  }

  const handleRetweet = () => {
    handleInteraction(
      () => handleRetweetAction(tweet.id, user!.id),
      'Retweet successful'
    )
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/tweet/${tweet.id}`)
      toast({ title: 'Copied!', description: 'Tweet link copied to clipboard' })
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to copy link', variant: 'destructive' })
    }
  }

  const getAvatarFallback = useCallback((name?: string) => {
    if (!name) return '?'
    return name.charAt(0).toUpperCase()
  }, [])

  const renderAvatar = useCallback(
    (avatarUrl: string | null | undefined, fullName?: string, className = 'h-12 w-12') => (
      <Avatar className={`${className} border-2 border-transparent hover:border-[#59F6E8] transition-all`}>
        <AvatarImage
          src={avatarUrl || undefined}
          alt={fullName || 'Profile picture'}
          className="object-cover"
        />
        <AvatarFallback className="bg-[#352f4d] text-white">
          {fullName?.[0]?.toUpperCase() || '?'} {/* Simplified AvatarFallback */}
        </AvatarFallback>
      </Avatar>
    ),
    [getAvatarFallback] // Still keep useCallback for memoization if props don't change frequently
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 hover:bg-white/5 border-b border-[#2F3336] cursor-pointer"
      onClick={() => router.push(`/tweet/${tweet.id}`)}
    >
      <div className="flex gap-4">
        {renderAvatar(tweet.user.avatar_url, tweet.user.full_name)}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-white truncate">{tweet.user.full_name}</span>
            <span className="text-gray-500 truncate">@{tweet.user.username}</span>
            <span className="text-gray-500">·</span>
            <time className="text-gray-500" dateTime={tweet.created_at}>
              {format(new Date(tweet.created_at), 'MMM d')}
            </time>
          </div>

          <p className="text-white mt-1 break-words">{tweet.content}</p>

          <div className="flex items-center justify-between mt-3" onClick={e => e.stopPropagation()}>
            <ConversationButton
              tweetId={tweet.id}
              replyCount={tweetInteractions.replies.length}
            />
            <TweetActionButton
              icon={<Repeat2 className="h-5 w-5" />}
              label="Retweet"
              count={tweetInteractions.retweets.length}
              isActive={tweetInteractions.retweets.some(r => r.user_id === user?.id)}
              hoverColor="hover:text-green-400"
              activeColor="text-green-400"
              onClick={handleRetweet}
            />
            <TweetActionButton
              icon={<Heart className="h-5 w-5" />}
              label="Like"
              count={tweetInteractions.likes.length}
              isActive={tweetInteractions.likes.some(l => l.user_id === user?.id)}
              hoverColor="hover:text-red-400"
              activeColor="text-red-400"
              onClick={handleLike}
            />
            <TweetActionButton
              icon={<Share className="h-5 w-5" />}
              label="Share"
              hoverColor="hover:text-blue-400"
              onClick={handleShare}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default TweetItem
