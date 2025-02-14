import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { HeartIcon, MessageCircleIcon, RepeatIcon } from 'lucide-react'

interface TweetCardProps {
  tweet: {
    id: string
    content: string
    created_at: string
    user: {
      name: string
      username: string
    }
  }
}

export default function TweetCard({ tweet }: TweetCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar>
          <AvatarImage src={`https://avatar.vercel.sh/${tweet.user.username}`} />
          <AvatarFallback>{tweet.user.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-bold">{tweet.user.name}</p>
          <p className="text-sm text-gray-500">@{tweet.user.username}</p>
        </div>
      </CardHeader>
      <CardContent>
        <p>{tweet.content}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost" size="sm">
          <MessageCircleIcon className="w-4 h-4 mr-2" />
          Reply
        </Button>
        <Button variant="ghost" size="sm">
          <RepeatIcon className="w-4 h-4 mr-2" />
          Retweet
        </Button>
        <Button variant="ghost" size="sm">
          <HeartIcon className="w-4 h-4 mr-2" />
          Like
        </Button>
      </CardFooter>
    </Card>
  )
}
