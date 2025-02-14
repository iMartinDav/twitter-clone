'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TrendingTopic {
  hashtag: string
  posts: string
}

interface SuggestedUser {
  id: string
  name: string
  username: string
  avatarUrl?: string
}

const TRENDING_TOPICS: TrendingTopic[] = [
  { hashtag: '#DiaDoiSottero', posts: '8,899 posts' },
  { hashtag: '#SexcSeguroSiempre', posts: '8,899 posts' },
  { hashtag: 'Cártel de Sinaloa', posts: '8,899 posts' },
]

const SUGGESTED_USERS: SuggestedUser[] = [
  {
    id: '1',
    name: 'Campus Health Tech',
    username: 'CHealth_Tech',
    avatarUrl: undefined,
  },
  {
    id: '2',
    name: 'Digital Health',
    username: 'DigitalHealth',
    avatarUrl: undefined,
  },
  {
    id: '3',
    name: 'Health Innovation',
    username: 'HealthInno',
    avatarUrl: undefined,
  },
]

function UserSuggestion({ user }: { user: SuggestedUser }) {
  const [isFollowing, setIsFollowing] = useState(false)

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback className="bg-[#59F6E8]/10 text-[#59F6E8]">
            {user.name
              .split(' ')
              .map((word) => word[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-white">{user.name}</p>
          <p className="text-white/60 text-sm">@{user.username}</p>
        </div>
      </div>
      <button
        onClick={() => setIsFollowing(!isFollowing)}
        className={`rounded-full text-sm px-4 py-1.5 transition-colors ${
          isFollowing
            ? 'bg-transparent border border-white/20 text-white hover:border-red-500 hover:text-red-500 hover:bg-red-500/10'
            : 'btn-outline'
        }`}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  )
}

function TrendingTopic({ topic }: { topic: TrendingTopic }) {
  return (
    <div className="group cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-lg transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium group-hover:text-[#59F6E8] text-white transition-colors">
            {topic.hashtag}
          </p>
          <p className="text-white/60 text-sm">{topic.posts}</p>
        </div>
      </div>
    </div>
  )
}

export default function RightSidebar() {
  return (
    <aside className="h-full p-4 bg-background overflow-y-auto border-l border-border w-[350px]">
      {/* Search Bar */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
        <Input
          type="text"
          placeholder="Search"
          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/60 rounded-full w-full focus-visible:ring-[#59F6E8]"
        />
      </div>

      {/* Who to Follow */}
      <Card className="mb-6 bg-white/5 border-white/10 rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg text-white">Who to follow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {SUGGESTED_USERS.map((user) => (
            <UserSuggestion key={user.id} user={user} />
          ))}
        </CardContent>
      </Card>

      {/* Trending Now */}
      <Card className="bg-white/5 border-white/10 rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg text-white">Trending now</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {TRENDING_TOPICS.map((topic) => (
            <TrendingTopic key={topic.hashtag} topic={topic} />
          ))}
        </CardContent>
      </Card>
    </aside>
  )
}
