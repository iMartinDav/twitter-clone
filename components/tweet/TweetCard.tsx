'use client'
import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { TweetActions } from './TweetActions'
import { useTweetInteractions } from '@/contexts/tweet-interactions-context'
import type { Tweet } from '@/types/tweet'
import { Trash2, Repeat2, MessageCircle } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { deleteTweet } from '@/services/tweet-service'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '../ui/button'
import { useToast } from "@/hooks/use-toast"
import { useTweetStore } from '@/stores/use-tweet-store'
import { useTimeAgo } from '@/hooks/use-time-ago'
import { getFullDateTime } from '@/utils/format-date'
import type { TweetVariant } from './types'
import { cn } from '@/lib/utils'


interface TweetCardProps {
  tweet: Tweet
  className?: string
  variant?: Extract<TweetVariant, 'default' | 'compact'>
}

export const TweetCard: React.FC<TweetCardProps> = React.memo(({ 
  tweet, 
  className = '',
  variant = 'default'
}) => {
  const router = useRouter()
  const { fetchTweetInteractions } = useTweetInteractions()
  const { user } = useAuth()
  const { toast } = useToast()
  const isOwner = user?.id === tweet.user_id
  const [isOpen, setIsOpen] = React.useState(false)
  const removeTweet = useTweetStore((state) => state.removeTweet)
  const timeInfo = useTimeAgo(tweet.created_at)
  const fullDateTime = getFullDateTime(tweet.created_at)

  // Prefetch interactions when card mounts
  useEffect(() => {
    fetchTweetInteractions(tweet.id)
  }, [tweet.id, fetchTweetInteractions])

  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on an action button
    if ((e.target as HTMLElement).closest('button')) {
      e.stopPropagation()
      return
    }
    router.push(`/tweet/${tweet.id}`)
  }

  const handleDelete = async () => {
    try {
      await deleteTweet(tweet.id, user!.id)
      removeTweet(tweet.id) // Use Zustand store to remove tweet
      setIsOpen(false)
      toast({
        title: 'Success',
        description: 'Tweet deleted successfully'
      })
      // The useRealtimeTweets hook will automatically update the UI
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete tweet',
        variant: 'destructive'
      })
    }
  }

  // Get the correct tweet data
  const tweetToDisplay = tweet.retweeted_tweet || tweet
  const isRetweet = !!tweet.retweeted_tweet
  
  // Get user data with proper fallback
  const userData = tweetToDisplay.user || tweetToDisplay.profiles
  if (!userData) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 hover:bg-white/5 cursor-pointer",
        variant === 'compact' && "py-2",
        !tweet.reply_to && "border-b border-[#2F3336]",
        className
      )}
      onClick={handleClick}
    >
      {tweet.reply_to && (
        <div className="text-sm text-gray-500 mb-2 pl-12 flex items-center gap-1">
          <MessageCircle className="h-4 w-4" />
          <span>
            Replying to{' '}
            {tweet.reply_to_user ? (
              <span 
                className="text-[#6B46CC] hover:underline cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/profile/${tweet.reply_to_user?.username}`)
                }}
              >
                @{tweet.reply_to_user.username}
              </span>
            ) : (
              <span className="text-[#6B46CC]">tweet</span>
            )}
          </span>
        </div>
      )}
      {isRetweet && (
        <div className="text-sm text-gray-500 mb-2 pl-12 flex items-center gap-1">
          <Repeat2 className="h-4 w-4" />
          <span>Retweeted by {tweet.user?.username || tweet.profiles?.username}</span>
        </div>
      )}
      
      <div className="flex gap-4">
        <Avatar className="h-12 w-12 border-2 border-transparent hover:border-[#59F6E8] transition-all">
          <AvatarImage 
            src={userData.avatar_url || undefined} 
            alt={`${userData.full_name}'s avatar`}
            className="object-cover" 
          />
          <AvatarFallback className="bg-[#352f4d] text-white">
            {userData.full_name?.[0]?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-bold text-white truncate">
                {userData.full_name}
              </span>
              <span className="text-gray-500 truncate">
                @{userData.username}
              </span>
              <span className="text-gray-500">·</span>
              <time 
                className="text-gray-500 hover:underline cursor-help group relative"
                dateTime={tweetToDisplay.created_at}
                title={fullDateTime}
              >
                <span>{timeInfo.timeAgo}</span>
                <span className="text-xs absolute -bottom-6 left-0 bg-gray-800 px-2 py-1 rounded 
                  opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {timeInfo.date}
                </span>
              </time>
            </div>
            {isOwner && (
              <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 rounded-full hover:bg-red-500/10 hover:text-red-500"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Tweet?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This tweet will be removed from your profile and timeline permanently.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <Button
                      variant="ghost"
                      onClick={() => setIsOpen(false)}
                      className="text-[#9898c5] hover:text-[#9898c5]/70 hover:bg-[#2F3336]/50"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      className="bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    >
                      Delete
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          <p className="text-white mt-1 break-words">{tweetToDisplay.content}</p>

          <TweetActions
            tweetId={tweetToDisplay.id}
            className="mt-3"
            variant={variant}
            onClick={(e) => e.stopPropagation()} // Prevent event bubbling
          />
        </div>
      </div>
      {tweet.replies_count > 0 && (
        <div className="mt-2 text-sm text-gray-500 pl-16">
          {tweet.replies_count} {tweet.replies_count === 1 ? 'reply' : 'replies'}
        </div>
      )}
    </motion.div>
  )
})

TweetCard.displayName = 'TweetCard'
