'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import TweetCard from './tweet-card'

interface Tweet {
  id: string
  content: string
  created_at: string
  user: {
    name: string
    username: string
  }
}

interface TweetListProps {
  initialTweets: Tweet[]
  userId?: string
}

export default function TweetList({ initialTweets, userId }: TweetListProps) {
  return (
    <div className="divide-y divide-[#2F3336]">
      {initialTweets.map((tweet) => (
        <div key={tweet.id} className="p-4">
          <div className="font-medium">{tweet.user.name}</div>
          <div className="text-gray-500">@{tweet.user.username}</div>
          <p className="mt-2">{tweet.content}</p>
        </div>
      ))}
      {initialTweets.length === 0 && (
        <div className="p-4 text-center text-gray-500">No tweets yet</div>
      )}
    </div>
  )
}
