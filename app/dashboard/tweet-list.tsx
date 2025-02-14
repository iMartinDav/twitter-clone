import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Heart, MessageSquareIcon, Repeat } from 'lucide-react'

interface Profile {
  username: string
  full_name: string
  avatar_url?: string
}

interface Tweet {
  id: string
  content: string
  created_at: string
  profiles: Profile[]
  stats?: {
    replies: number
    retweets: number
    likes: number
  }
}

interface TweetCardProps {
  tweet: Tweet
  onLike?: (tweetId: string) => void
  onRetweet?: (tweetId: string) => void
  onReply?: (tweetId: string) => void
}

const TweetCard: React.FC<TweetCardProps> = ({ tweet, onLike, onRetweet, onReply }) => {
  const profile = useMemo(() => tweet.profiles[0], [tweet.profiles])
  const stats = tweet.stats ?? { replies: 0, retweets: 0, likes: 0 }

  if (!profile) return null

  const handleLike = () => onLike?.(tweet.id)
  const handleRetweet = () => onRetweet?.(tweet.id)
  const handleReply = () => onReply?.(tweet.id)

  const formattedDate = formatDistanceToNow(new Date(tweet.created_at), {
    addSuffix: true,
  })

  return (
    <div className="p-4 hover:bg-muted/10 transition-colors group/tweet">
      <div className="flex gap-4">
        <Avatar className="h-11 w-11 shrink-0">
          {profile.avatar_url ? (
            <AvatarImage
              src={profile.avatar_url}
              alt={`${profile.full_name}'s avatar`}
              loading="lazy"
            />
          ) : (
            <AvatarFallback className="text-sm font-semibold">
              {profile.full_name?.charAt(0) ?? 'U'}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold truncate">{profile.full_name}</span>
            <span className="text-muted-foreground truncate">@{profile.username}</span>
            <span className="text-muted-foreground">·</span>
            <time className="text-sm text-muted-foreground" dateTime={tweet.created_at}>
              {formattedDate}
            </time>
          </div>
          <p className="text-lg leading-relaxed break-words">{tweet.content}</p>
          <div className="flex items-center gap-8 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReply}
              className="text-muted-foreground group flex items-center gap-1"
              aria-label={`Reply to tweet by ${profile.username}`}
            >
              <MessageSquareIcon className="h-4 w-4 group-hover:text-primary transition-colors" />
              <span className="group-hover:text-primary transition-colors">{stats.replies}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetweet}
              className="text-muted-foreground group flex items-center gap-1"
              aria-label={`Retweet tweet by ${profile.username}`}
            >
              <Repeat className="h-4 w-4 group-hover:text-green-500 transition-colors" />
              <span className="group-hover:text-green-500 transition-colors">{stats.retweets}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className="text-muted-foreground group flex items-center gap-1"
              aria-label={`Like tweet by ${profile.username}`}
            >
              <Heart className="h-4 w-4 group-hover:text-red-500 transition-colors" />
              <span className="group-hover:text-red-500 transition-colors">{stats.likes}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TweetList() {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const supabase = createClientComponentClient()

  const loadTweets = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('tweets')
        .select('*, profiles:user_id (*)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTweets(data || [])
    } catch (error: any) {
      console.error('Error loading tweets:', error.message)
    }
  }, [supabase])

  useEffect(() => {
    loadTweets()

    const channel = supabase
      .channel('realtime-tweets')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tweets',
        },
        (payload) => {
          setTweets((prev) => [payload.new as Tweet, ...prev])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, loadTweets])

  const handleLike = useCallback(async (tweetId: string) => {
    // Implement like functionality
    console.log('Like tweet:', tweetId)
  }, [])

  const handleRetweet = useCallback(async (tweetId: string) => {
    // Implement retweet functionality
    console.log('Retweet:', tweetId)
  }, [])

  const handleReply = useCallback(async (tweetId: string) => {
    // Implement reply functionality
    console.log('Reply to tweet:', tweetId)
  }, [])

  if (!tweets.length) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No tweets yet. Be the first to tweet!
      </div>
    )
  }

  return (
    <div className="divide-y divide-border">
      {tweets.map((tweet) => (
        <TweetCard
          key={tweet.id}
          tweet={tweet}
          onLike={handleLike}
          onRetweet={handleRetweet}
          onReply={handleReply}
        />
      ))}
    </div>
  )
}
