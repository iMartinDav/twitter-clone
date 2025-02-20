'use client'

export const dynamic = 'force-static'

import { useState, useEffect } from 'react'
import { Search, Database, TrendingUp, BookMarked, FlaskConical, Sparkles } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TrendingTopic {
  hashtag: string
  posts: string
  category: 'research' | 'tools' | 'conference'
}

interface SuggestedUser {
  id: string
  name: string
  username: string
  avatarUrl?: string
  specialty: string
  citations: number
}

const TRENDING_TOPICS: TrendingTopic[] = [
  { hashtag: '#SingleCellSeq', posts: '12.5K posts', category: 'research' },
  { hashtag: '#BioconductorUpdate', posts: '8.2K posts', category: 'tools' },
  { hashtag: '#ISMB2025', posts: '6.7K posts', category: 'conference' },
  { hashtag: '#AlphaFold3', posts: '5.9K posts', category: 'tools' },
  { hashtag: '#GenomicsAI', posts: '4.8K posts', category: 'research' },
]

const SUGGESTED_USERS: SuggestedUser[] = [
  {
    id: '1',
    name: 'Lior Pachter',
    username: 'lpachter',
    specialty: 'Building genomics tools with ❤️',
    citations: 52000,
  },
  {
    id: '2',
    name: 'Bioconductor Team',
    username: 'Bioconductor',
    specialty: 'Empowering bio-data analysis 🧬',
    citations: 85000,
  },
  {
    id: '3',
    name: 'Galaxy Project',
    username: 'galaxyproject',
    specialty: 'Making science accessible 🌌',
    citations: 45000,
  },
]

const TRENDING_TOOLS: string[] = [
  'Nextflow',
  'Scanpy',
  'Seurat',
  'DESeq2',
  'ggplot2'
]

function UserSuggestion({ user, index }: { user: SuggestedUser; index: number }) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 150)
    return () => clearTimeout(timer)
  }, [index])

  return (
    <div 
      className={`group flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg transition-all duration-300 ease-out
        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
        hover:shadow-[0_0_15px_rgba(89,246,232,0.1)] hover:bg-white/5`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="relative">
          <Avatar className="h-10 w-10 flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback className="bg-[#59F6E8]/10 text-[#59F6E8]">
              {user.name.split(' ').map((word) => word[0]).join('')}
            </AvatarFallback>
          </Avatar>
          {isHovered && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-white truncate">{user.name}</p>
            <Badge 
              variant="secondary" 
              className="text-xs whitespace-nowrap animate-fade-in"
            >
              {(user.citations/1000).toFixed(1)}k citations
            </Badge>
          </div>
          <p className="text-white/60 text-sm truncate">@{user.username}</p>
          <p className="text-white/40 text-sm">{user.specialty}</p>
        </div>
      </div>
      <button
        onClick={() => setIsFollowing(!isFollowing)}
        className={`self-start sm:self-center whitespace-nowrap rounded-full text-sm px-4 py-1.5 transition-all duration-300
          ${isFollowing
            ? 'bg-transparent border border-white/20 text-white hover:border-red-500 hover:text-red-500 hover:bg-red-500/10'
            : 'bg-[#59F6E8] text-black hover:bg-[#59F6E8]/90 hover:shadow-[0_0_15px_rgba(89,246,232,0.3)]'
          }`}
      >
        <span className="flex items-center gap-2">
          {isFollowing ? 'Following' : 'Follow'}
          {!isFollowing && <Sparkles className="w-3 h-3" />}
        </span>
      </button>
    </div>
  )
}

function TrendingTopic({ topic, index }: { topic: TrendingTopic; index: number }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 100)
    return () => clearTimeout(timer)
  }, [index])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'research': return <FlaskConical className="h-4 w-4 text-purple-400" />
      case 'tools': return <Database className="h-4 w-4 text-blue-400" />
      case 'conference': return <TrendingUp className="h-4 w-4 text-green-400" />
      default: return null
    }
  }

  return (
    <div 
      className={`group cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-lg transition-all duration-300
        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
        hover:shadow-[0_0_15px_rgba(89,246,232,0.1)]`}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <span className="transform group-hover:scale-110 transition-transform duration-300">
              {getCategoryIcon(topic.category)}
            </span>
            <p className="font-medium group-hover:text-[#59F6E8] text-white transition-colors">
              {topic.hashtag}
            </p>
          </div>
          <p className="text-white/60 text-sm">{topic.posts}</p>
        </div>
      </div>
    </div>
  )
}

function PopularTools() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className={`flex flex-wrap gap-2 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {TRENDING_TOOLS.map((tool, index) => (
        <Badge 
          key={tool} 
          variant="secondary" 
          className="cursor-pointer transition-all duration-300 hover:bg-[#59F6E8]/20 hover:scale-110 hover:shadow-[0_0_10px_rgba(89,246,232,0.2)]"
          style={{
            transitionDelay: `${index * 100}ms`
          }}
        >
          {tool}
        </Badge>
      ))}
    </div>
  )
}

export default function RightSidebar() {
  return (
    <aside className="h-full p-4 bg-background overflow-y-auto border-l border-border w-[380px] scrollbar-thin scrollbar-thumb-[#59F6E8]/20 scrollbar-track-transparent hover:scrollbar-thumb-[#59F6E8]/30">
      {/* Search Bar */}
      <div className="mb-6 relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60 transition-transform duration-300 group-hover:scale-110" />
        <Input
          type="text"
          placeholder="Search papers, tools, or researchers"
          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/60 rounded-full w-full transition-all duration-300
            focus-visible:ring-[#59F6E8] focus-visible:bg-white/10 hover:bg-white/8
            hover:shadow-[0_0_15px_rgba(89,246,232,0.1)]"
        />
      </div>

      {/* Popular Tools */}
      <Card className="mb-6 bg-white/5 border-white/10 rounded-xl transition-transform duration-300 hover:shadow-[0_0_20px_rgba(89,246,232,0.1)] hover:scale-[1.01]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg text-white">Popular Tools</CardTitle>
          <BookMarked className="h-5 w-5 text-[#59F6E8]" />
        </CardHeader>
        <CardContent>
          <PopularTools />
        </CardContent>
      </Card>

      {/* Community Members */}
      <Card className="mb-6 bg-white/5 border-white/10 rounded-xl transition-transform duration-300 hover:shadow-[0_0_20px_rgba(89,246,232,0.1)] hover:scale-[1.01]">
        <CardHeader>
          <CardTitle className="text-lg text-white">Community Highlights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {SUGGESTED_USERS.map((user, index) => (
            <UserSuggestion key={user.id} user={user} index={index} />
          ))}
        </CardContent>
      </Card>

      {/* Trending Now */}
      <Card className="bg-white/5 border-white/10 rounded-xl transition-transform duration-300 hover:shadow-[0_0_20px_rgba(89,246,232,0.1)] hover:scale-[1.01]">
        <CardHeader>
          <CardTitle className="text-lg text-white">Trending in Bioinformatics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {TRENDING_TOPICS.map((topic, index) => (
            <TrendingTopic key={topic.hashtag} topic={topic} index={index} />
          ))}
        </CardContent>
      </Card>
    </aside>
  )
}
