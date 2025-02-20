'use client'

export const dynamic = 'force-static'

import React from 'react'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/contexts/auth-context'
import Link from 'next/link'
import {
  Home,
  Search,
  Bell,
  MessageSquare,
  List,
  User as UserIcon,
  Settings,
  Plus,
  LogOut,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import NewTweetDialog from '../app/dashboard/new-tweet-dialog'
import { Button } from '@/components/ui/button'

interface Profile {
  id: string
  full_name: string
  username: string
  avatar_url: string
  bio: string
}

export default function Sidebar() {
  const { session, signOut, loading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const fetchProfile = useCallback(async () => {
    if (!session?.user?.id) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (error) throw error
      if (data) setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }, [session?.user?.id, supabase])

  useEffect(() => {
    fetchProfile()

    const channel = supabase
      .channel('profile_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${session?.user?.id}`,
        },
        (payload) => {
          setProfile(payload.new as Profile)
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [session?.user?.id, supabase, fetchProfile])

  const handleSignOut = async () => {
    if (isLoggingOut) return

    try {
      setIsLoggingOut(true)

      // Clear local state
      setProfile(null)

      // Sign out from Supabase
      await supabase.auth.signOut()

      // Call context signOut
      await signOut()

      // Clear any cached data
      router.refresh()

      // Force navigation to login page
      router.push('/login')

      // Ensure the navigation completes
      setTimeout(() => {
        window.location.href = '/login'
      }, 100)
    } catch (error) {
      console.error('Error signing out:', error)
      // Force navigation on error
      window.location.href = '/login'
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex flex-col px-2 py-4 items-center justify-center">
        <div className="text-white/50">Loading...</div>
      </div>
    )
  }

  const navItems = [
    { icon: Home, label: 'Home', href: '/dashboard' },
    { icon: Search, label: 'Search', href: '#' },
    { icon: Bell, label: 'Notifications', href: '#' },
    { icon: MessageSquare, label: 'Chat', href: '#' },
    { icon: List, label: 'Feeds', href: '#' },
    { icon: List, label: 'Lists', href: '#' },
    {
      icon: UserIcon,
      label: 'Profile',
      href: profile ? `/profile/${profile.username}` : '/profile',
    },
    { icon: Settings, label: 'Settings', href: '#' },
  ]

  return (
    <div className="h-screen flex flex-col px-2 py-4">
      <nav className="flex-1 mt-4">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-4 p-4 rounded-full hover:bg-white/10 transition-all group"
          >
            <item.icon className="h-6 w-6 text-white group-hover:text-[#59F6E8] transition-colors" />
            <span className="hidden lg:inline text-lg text-white/90 group-hover:text-white transition-colors">
              {item.label}
            </span>
          </Link>
        ))}
      </nav>

      <div className="px-4 my-4">
        <NewTweetDialog>
          <Button className="w-full bg-[#6B46CC] hover:bg-[#5A37A7] rounded-full py-6 text-base font-bold transition-all hover:shadow-lg hover:shadow-purple-500/20">
            <Plus className="lg:hidden h-6 w-6" />
            <span className="hidden lg:inline">Post</span>
          </Button>
        </NewTweetDialog>
      </div>

      {profile && (
        <div className="mt-auto">
          <div className="w-full p-4 flex items-center gap-3 rounded-full hover:bg-white/10 transition-all group relative">
            <Link href={`/profile/${profile.username}`}>
              <Avatar className="h-12 w-12 border-2 border-transparent group-hover:border-[#59F6E8] transition-all">
                <AvatarImage src={profile.avatar_url} className="object-cover" />
                <AvatarFallback className="bg-[#352f4d] text-white text-lg">
                  {profile.full_name[0]}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="hidden lg:block flex-1 text-left">
              <Link href={`/profile/${profile.username}`} className="block">
                <div className="font-bold text-white truncate max-w-[150px]">
                  {profile.full_name}
                </div>
                <div className="text-gray-500 text-sm truncate max-w-[150px]">
                  @{profile.username}
                </div>
              </Link>
            </div>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="icon"
              disabled={isLoggingOut}
              className="ml-auto opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-all disabled:opacity-50"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
