import React from 'react'
import { Heart, Repeat2, Share } from 'lucide-react'
import { TweetActionButton } from './tweet-action-button'
import { ConversationButton } from './ConversationDialog'
import { useTweetInteractions } from '@/contexts'
import { useToast } from '@/components/ui/use-toast'
import { toggleLike, toggleRetweet } from '@/services/tweet-interactions'
import { useAuth } from '@/contexts/auth-context'

interface TweetActionsProps {
  tweetId: string
  className?: string
  variant?: 'default' | 'compact'
  onClick?: (e: React.MouseEvent) => void
}

export const TweetActions: React.FC<TweetActionsProps> = ({
  tweetId,
  className = '',
  variant = 'default',
  onClick
}) => {
  const { toast } = useToast()
  const { user } = useAuth()
  const {
    currentInteractions,
    isLiked,
    isRetweeted,
    fetchTweetInteractions
  } = useTweetInteractions(tweetId)

  const handleInteraction = async (
    action: 'like' | 'retweet',
    callback: () => Promise<void>
  ) => {
    if (!user?.id) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to interact with tweets',
        variant: 'destructive',
      })
      return
    }

    try {
      await callback()
      await fetchTweetInteractions(tweetId)
      toast({ 
        title: 'Success', 
        description: `${action.charAt(0).toUpperCase() + action.slice(1)} updated` 
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Action failed',
        variant: 'destructive',
      })
    }
  }

  const handleLike = () => handleInteraction('like', async () => { await toggleLike(tweetId, user!.id) })
  const handleRetweet = () => handleInteraction('retweet', async () => { await toggleRetweet(tweetId, user!.id) })

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/tweet/${tweetId}`)
      toast({ title: 'Copied!', description: 'Tweet link copied to clipboard' })
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to copy link', variant: 'destructive' })
    }
  }

  return (
    <div 
      className={`flex items-center justify-between ${className}`}
      onClick={onClick}
    >
      <ConversationButton
        tweetId={tweetId}
        replyCount={currentInteractions?.replies?.length ?? 0}
        variant={variant}
      />
      <TweetActionButton
        icon={<Repeat2 className="h-5 w-5" />}
        label="Retweet"
        count={currentInteractions?.retweets?.length ?? 0}
        isActive={isRetweeted}
        hoverColor="hover:text-green-400"
        activeColor="text-green-400"
        onClick={handleRetweet}
        variant={variant}
      />
      <TweetActionButton
        icon={<Heart className="h-5 w-5" />}
        label="Like"
        count={currentInteractions?.likes?.length ?? 0}
        isActive={isLiked}
        hoverColor="hover:text-red-400"
        activeColor="text-red-400"
        onClick={handleLike}
        variant={variant}
      />
      <TweetActionButton
        icon={<Share className="h-5 w-5" />}
        label="Share"
        hoverColor="hover:text-blue-400"
        onClick={handleShare}
        variant={variant}
      />
    </div>
  )
}
