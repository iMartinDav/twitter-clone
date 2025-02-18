'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { FaSquareXTwitter } from 'react-icons/fa6'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import type { Tweet } from '@/types/tweet'
import { fetchDashboardTweets } from '@/services/tweet-service'
import TweetItem from '@/components/tweet/TweetItem'
import TweetForm from '@/components/tweet/TweetForm'

import TweetLoadingSkeleton from '@/components/tweet/TweetLoadingSkeleton'
import { TweetInteractionsProvider, useTweetInteractionsContext } from '@/contexts/tweet-interactions-context'

function DashboardContent() {
    const { session } = useAuth()
    const { toast } = useToast()
    const supabase = createClientComponentClient<Database>()
    const { fetchTweetInteractionsInBulk } = useTweetInteractionsContext()

    const [tweets, setTweets] = useState<Tweet[]>([])
    const [isMounted, setIsMounted] = useState(false)
    const [profile, setProfile] = useState<Database['public']['Tables']['profiles']['Row'] | null>(null)

    const fetchInitialData = useCallback(async () => {
        setIsMounted(true)

        try {
            const initialTweets = await fetchDashboardTweets()
            setTweets(initialTweets)
            fetchTweetInteractionsInBulk(initialTweets.map((tweet) => tweet.id))

            const profileData = await fetchProfile()
            setProfile(profileData)
        } catch (error) {
            console.error('Error fetching initial data:', error)
            toast({ title: 'Error', description: 'Failed to load dashboard data', variant: 'destructive' })
        }
    }, [fetchTweetInteractionsInBulk, toast])

    const fetchProfile = useCallback(async () => {
        if (!session?.user?.id) return null
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single()
            if (error) throw error
            return data
        } catch (error) {
            console.error('Error fetching profile:', error)
            return null
        }
    }, [session?.user?.id, supabase])

    const handleTweetPosted = useCallback(async () => {
        const updatedTweets = await fetchDashboardTweets()
        setTweets(updatedTweets)
        fetchTweetInteractionsInBulk(updatedTweets.map((tweet) => tweet.id))
    }, [fetchTweetInteractionsInBulk])

    const handleRealtimeUpdate = useCallback(
        (payload: RealtimePostgresChangesPayload<Database['public']['Tables']['tweets']['Row']>) => {
            if (payload.eventType === 'INSERT') {
                fetchDashboardTweets().then((updatedTweets) => {
                    setTweets(updatedTweets)
                    fetchTweetInteractionsInBulk(updatedTweets.map((tweet) => tweet.id))
                })
            }
            if (payload.eventType === 'DELETE') {
                setTweets((prev) => prev.filter((t) => t.id !== payload.old.id))
            }
        },
        [fetchDashboardTweets, fetchTweetInteractionsInBulk]
    )

    const handleRealtimeLike = useCallback(
        (payload: RealtimePostgresChangesPayload<Database['public']['Tables']['likes']['Row']>) => {
            if ('tweet_id' in payload.new && payload.new.tweet_id) {
                fetchTweetInteractionsInBulk([payload.new.tweet_id])
            }
        },
        [fetchTweetInteractionsInBulk]
    )

    useEffect(() => {
        fetchInitialData()

        const tweetsChannel = supabase
            .channel('tweets_channel')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'tweets' },
                handleRealtimeUpdate
            )
            .subscribe()

        const likesChannel = supabase
            .channel('likes_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, handleRealtimeLike)
            .subscribe()

        return () => {
            supabase.removeChannel(tweetsChannel)
            supabase.removeChannel(likesChannel)
        }
    }, [fetchInitialData, handleRealtimeLike, handleRealtimeUpdate, supabase])

    useEffect(() => {
        if (!session?.user?.id) return

        fetchProfile().then((profileData) => {
            setProfile(profileData)
        })

        const profileChannel = supabase
            .channel('dashboard_profile')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'profiles',
                    filter: `user_id=eq.${session.user.id}`,
                },
                (payload) => {
                    setProfile(payload.new as Database['public']['Tables']['profiles']['Row'])
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(profileChannel)
        }
    }, [session?.user?.id, supabase, fetchProfile])

    if (!isMounted) return <TweetLoadingSkeleton />

    return (
        <div className="w-full max-w-[600px] mx-auto bg-background">
            <header className="sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b border-[#2F3336]">
                <div className="flex justify-center p-2">
                    <FaSquareXTwitter className="text-4xl text-[#59F6E8]" />
                </div>
                <nav className="flex px-4 py-3">
                    <Button variant="ghost" className="flex-1 font-semibold relative text-white/90">
                        For you
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#6B46CC] rounded-full" />
                    </Button>
                    <Button variant="ghost" className="flex-1 text-white/50 font-semibold">
                        Following
                    </Button>
                </nav>
            </header>

            <TweetForm onTweetPosted={handleTweetPosted} profile={profile} />

            <div className="divide-y divide-[#2F3336]">
                {tweets.length > 0 ? (
                    tweets.map((tweet) => <TweetItem key={tweet.id} tweet={tweet} />)
                ) : (
                    <div className="p-8 text-center text-muted-foreground">
                        <p className="text-lg">No tweets yet</p>
                        <p className="text-sm mt-2">Be the first to share your thoughts!</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function Dashboard() {
    return (
        <TweetInteractionsProvider>
            <DashboardContent />
        </TweetInteractionsProvider>
    )
}
