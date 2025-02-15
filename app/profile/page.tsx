// app/profile/page.tsx
'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, Link as LinkIcon, MapPin, Share2, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'
import { EditProfileDialog } from '@/components/edit-profile-dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import type { Database } from '@/types/supabase'
import ProfileTweetList from '@/components/tweet-list'
import { Tweet } from '@/types/tweet'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

export default function ProfilePage({ params }: { params: { username?: string } }) {
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [tweets, setTweets] = useState<Tweet[]>([]) // Use your Tweet type
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('tweets')
  const [isEditing, setIsEditing] = useState(false)
  const [session, setSession] = useState<any>(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  const headerRef = useRef<HTMLDivElement>(null)

  const supabase = createClientComponentClient<Database>()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fetchProfileData = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(session)

      if (!session) {
        router.push('/login')
        return
      }

      let profileQuery = supabase.from('profiles').select('*')

      if (params.username) {
        profileQuery = profileQuery.eq('username', params.username)
      } else if (session?.user?.id) {
        profileQuery = profileQuery.eq('user_id', session.user.id)
      } else {
        return
      }

      const { data: profileData, error: profileError } = await profileQuery.single()

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          router.push('/404')
          return
        }
        throw profileError
      }

      if (profileData) {
        setProfile(profileData)

        // Fetch tweets, joining with profiles to get user data - Adjusted query
        const { data: tweetData, error: tweetError } = await supabase
          .from('tweets')
          .select('*, user:profiles(full_name, username, avatar_url)') // Fetch nested user profile
          .eq('user_id', profileData.user_id)
          .order('created_at', { ascending: false })

        if (tweetError) {
          throw tweetError
        }

        // No transformation needed now, data should match Tweet type closely
        setTweets((tweetData as Tweet[]) || []) // Directly use tweetData with type assertion
      }
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [params.username, router, supabase, toast, session?.user?.id])

  useEffect(() => {
    fetchProfileData()
  }, [fetchProfileData])

  const handleProfileUpdate = async (updatedProfile: Partial<ProfileRow>) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) return

      const { data: updatedData, error } = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('user_id', session.user.id)
        .select()
        .single()

      if (error) throw error

      if (updatedData) {
        setProfile(updatedData)
        toast({
          title: 'Success',
          description: 'Profile updated successfully',
        })
        router.refresh()
      }

      setIsEditing(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      })
    }
  }

  const formatJoinDate = (dateString?: string) =>
    dateString ? format(new Date(dateString), 'MMMM') : 'Unknown date'

  if (isLoading) return <ProfileSkeleton />

  const canEdit = profile?.user_id === session?.user?.id

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[600px] mx-auto">
        {/* Updated Header */}
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm flex items-center gap-2 px-2 h-[52px] border-b border-[#2F3336]">
          <Button
            onClick={() => router.push('/dashboard')}
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-white" />
          </Button>
          <div className="flex flex-col justify-center">
            <h1 className="text-lg font-bold text-white leading-5">
              {profile?.full_name || 'Profile'}
            </h1>
            <p className="text-xs text-gray-500 leading-4">{tweets.length} posts</p>
          </div>
        </div>

        {/* Cover Image Section with Gradient Overlay */}
        <div className="relative h-[200px] w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
          {profile?.cover_url ? (
            <img
              src={profile.cover_url}
              alt="Cover"
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#2F3336] to-[#1F2937]" />
          )}
        </div>

        {/* Profile Section with Enhanced Avatar */}
        <div className="relative px-4 -mt-16 z-20">
          <motion.div
            className="relative inline-block"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Elegant ring effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600/30 via-purple-500/30 to-fuchsia-500/30 rounded-full blur-sm opacity-75" />
            <div
              className="absolute -inset-0.5 bg-gradient-to-r from-violet-600/30 via-purple-500/30 to-fuchsia-500/30 rounded-full animate-tilt"
              style={{ animationDuration: '3s' }}
            />
            <div className="relative rounded-full p-0.5 bg-background">
              <Avatar className="w-32 h-32 ring-1 ring-white/10 relative group transition-transform duration-300 hover:scale-105">
                <AvatarImage src={profile?.avatar_url} className="object-cover rounded-full" />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-[#352f4d] to-[#6B46CC] text-white">
                  {profile?.full_name?.[0]}
                </AvatarFallback>
                <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Avatar>
            </div>
          </motion.div>

          {/* Profile Content with Glass Effect */}
          <div className="mt-4 space-y-4 relative">
            {/* Stylized Edit Button */}
            <div className="flex justify-end -mt-12">
              {canEdit && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="group relative px-6 py-2 overflow-hidden rounded-full border-2 border-white/20 bg-background/50 backdrop-blur-md transition-all hover:border-white/40 hover:bg-background/70"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-purple-500/20 to-fuchsia-500/30 opacity-0 transition-opacity group-hover:opacity-100" />
                    <span className="relative flex items-center gap-2 text-sm font-medium text-white">
                      <span className="relative">Edit profile</span>
                    </span>
                    <motion.div
                      className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100"
                      style={{
                        background:
                          'radial-gradient(circle at center, rgba(89, 246, 232, 0.1) 0%, transparent 70%)',
                      }}
                      initial={false}
                      animate={{ scale: [0.9, 1], opacity: [0, 1] }}
                      transition={{ duration: 0.3 }}
                    />
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Profile Info with Animations */}
            <motion.div
              className="space-y-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="space-y-1">
                <h1 className="text-xl font-bold text-white">{profile?.full_name}</h1>
                <p className="text-gray-500">@{profile?.username}</p>
              </div>

              {profile?.bio && (
                <p className="text-white whitespace-pre-wrap break-words">{profile.bio}</p>
              )}

              <div className="flex flex-wrap gap-4 text-gray-500">
                {profile?.location && (
                  <motion.div
                    className="flex items-center gap-1 hover:text-white transition-colors"
                    whileHover={{ scale: 1.05 }}
                  >
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </motion.div>
                )}
                {profile?.website && (
                  <motion.a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[#6B46CC] hover:underline"
                    whileHover={{ scale: 1.05 }}
                  >
                    <LinkIcon className="h-4 w-4" />
                    <span>{profile.website.replace(/(^\w+:|^)\/\//, '')}</span>
                  </motion.a>
                )}
                <motion.div
                  className="flex items-center gap-1 hover:text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatJoinDate(profile?.created_at)}</span>
                </motion.div>
              </div>

              <div className="flex gap-4 mt-3">
                <Button className="hover:underline">
                  <span className="font-bold text-white">0</span>{' '}
                  <span className="text-gray-500">Following</span>
                </Button>
                <Button className="hover:underline">
                  <span className="font-bold text-white">0</span>{' '}
                  <span className="text-gray-500">Followers</span>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-4 sticky top-16 z-40 bg-background/80 backdrop-blur-md"
        >
          <TabsList className="w-full justify-start border-b border-[#2F3336] bg-transparent">
            {['Tweets', 'Replies', 'Highlights', 'Media', 'Likes'].map((tab) => (
              <TabsTrigger
                key={tab.toLowerCase()}
                value={tab.toLowerCase()}
                className="flex-1 text-gray-500 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#6B46CC]"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Tweets */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="divide-y divide-[#2F3336]"
          >
            <ProfileTweetList initialTweets={tweets} userId={profile?.id} />{' '}
            {/* Use ProfileTweetList here */}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        profile={profile}
        onSave={handleProfileUpdate}
      />
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[600px] mx-auto">
        <div className="relative">
          <Skeleton className="h-[200px] w-full bg-[#2F3336]" />
          <div className="absolute -bottom-16 left-4">
            <Skeleton className="w-32 h-32 rounded-full bg-[#2F3336]" />
          </div>
        </div>
        <div className="pt-20 px-4 space-y-4">
          <div className="flex justify-end">
            <Skeleton className="w-32 h-9 rounded-full bg-[#2F3336]" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 bg-[#2F3336]" />
            <Skeleton className="h-4 w-32 bg-[#2F3336]" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-[#2F3336]" />
            <Skeleton className="h-4 w-3/4 bg-[#2F3336]" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-4 w-24 bg-[#2F3336]" />
            <Skeleton className="h-4 w-24 bg-[#2F3336]" />
            <Skeleton className="h-4 w-24 bg-[#2F3336]" />
          </div>
        </div>
      </div>
    </div>
  )
}
