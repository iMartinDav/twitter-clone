// app/dashboard/tweet-form.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { useUser } from '@/lib/user-hook'
import { ImageIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function TweetForm() {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useUser()
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/tweets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (!res.ok) throw new Error('Failed to post tweet')
      setContent('')
      router.refresh()
      toast({ title: 'Tweet posted!', description: 'Your tweet was shared successfully' })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to post tweet',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="border-b border-gray-800 p-4">
      <form onSubmit={handleSubmit} className="flex gap-4">
        <Avatar className="size-10 rounded-md">
          {user?.user_metadata?.avatar_url ? (
            <AvatarImage src={user.user_metadata.avatar_url} className="rounded-md" />
          ) : (
            <AvatarFallback className="rounded-md">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder="What's happening?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-transparent border-none text-xl resize-none focus:ring-0"
            rows={2}
            required
          />
          <div className="flex justify-between items-center mt-2">
            <Button variant="ghost" size="icon" className="hover:bg-gray-700 rounded-full">
              <ImageIcon className="h-5 w-5 text-blue-500" />
            </Button>
            <Button
              type="submit"
              className="rounded-full px-6 py-2 font-bold bg-blue-500 hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? 'Posting...' : 'Tweet'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
