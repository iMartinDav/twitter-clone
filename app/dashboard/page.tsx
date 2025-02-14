'use client'

import { useEffect, useState } from 'react'
import NewTweetDialog from './new-tweet-dialog'
import TweetList from './tweet-list'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function Dashboard() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="w-full max-w-[600px] mx-auto p-4 space-y-4 rounded-2xl">
        <div className="sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <Skeleton className="h-9 w-20 rounded-full" />
              <Skeleton className="h-9 w-20 rounded-full" />
            </div>
            <Skeleton className="h-9 w-20 rounded-full" />
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 space-y-4">
            <Skeleton className="h-4 w-[200px] rounded-full" />
            <Skeleton className="h-4 w-[250px] rounded-full" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-16 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full max-w-[600px] mx-auto p-4 space-y-4 rounded-2xl">
      <div className="sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b border-border p-4 flex items-center justify-between">
        <div className="flex gap-4">
          <Button
            variant="ghost"
            className="text-white/90 rounded-full hover:bg-white/10 transition-colors font-semibold"
          >
            For You
          </Button>
          <Button
            variant="ghost"
            className="text-white/90 rounded-full hover:bg-white/10 transition-colors font-semibold"
          >
            Following
          </Button>
        </div>
        <NewTweetDialog>
          <Button
            variant="ghost"
            className="text-white/90 rounded-full hover:bg-white/10 transition-colors font-semibold"
          >
            Tweet
          </Button>
        </NewTweetDialog>
      </div>
      <TweetList />
    </div>
  )
}
