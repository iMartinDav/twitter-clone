'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { EditProfileDialog } from '@/components/edit-profile-dialog'
import type { Database } from '@/types/supabase'
import type { Tweet } from '@/types/tweet'
import ProfileHeader from '@/components/profile/ProfileHeader'
import ProfileCover from '@/components/profile/ProfileCover'
import ProfileAvatar from '@/components/profile/ProfileAvatar'
import ProfileInfo from '@/components/profile/ProfileInfo'
import ProfileTabs from '@/components/profile/ProfileTabs'
import ProfileSkeleton from '@/components/profile/ProfileSkeleton'
import { TweetCard } from '@/components/tweet/TweetCard'
import { TweetInteractionsProvider } from '@/contexts/tweet-interactions-context'
import { motion, AnimatePresence } from 'framer-motion'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

export default function ProfilePage({ params }: { params: { username?: string } }) {
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('tweets')
  const [isEditing, setIsEditing] = useState(false)
  const [session, setSession] = useState<any>(null)

  const supabase = createClientComponentClient<Database>()
  const router = useRouter()
  const { toast } = useToast()

  const fetchProfileData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
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

        const { data: tweetData, error: tweetError } = await supabase
          .from('tweets')
          .select('*, user:profiles(full_name, username, avatar_url)')
          .eq('user_id', profileData.user_id)
          .order('created_at', { ascending: false })

        if (tweetError) {
          throw tweetError
        }

        setTweets((tweetData as Tweet[]) || [])
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
  }, [params.username, router, supabase, toast])

  useEffect(() => {
    fetchProfileData()
  }, [fetchProfileData])

  const handleProfileUpdate = async (updatedProfile: Partial<ProfileRow>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
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

  if (isLoading) return <ProfileSkeleton />

  const canEdit = profile?.user_id === session?.user?.id

  return (
    <TweetInteractionsProvider>
      <div className="min-h-screen bg-background">
        <div className="max-w-[600px] mx-auto">
          <ProfileHeader 
            fullName={profile?.full_name} 
            tweetCount={tweets.length} 
          />

          <ProfileCover coverUrl={profile?.cover_url} />

          <ProfileAvatar 
            profile={profile}
            canEdit={canEdit}
            onEditClick={() => setIsEditing(true)}
          />

          <ProfileInfo 
            profile={profile}
            className="px-4"
          />

          <ProfileTabs 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="divide-y divide-[#2F3336]"
            >
              {tweets.map((tweet) => (
                <TweetCard
                  key={tweet.id}
                  tweet={tweet}
                  variant="default"
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <EditProfileDialog
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          profile={profile}
          onSave={handleProfileUpdate}
        />
      </div>
    </TweetInteractionsProvider>
  )
}
