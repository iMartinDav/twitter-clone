'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { FaSquareXTwitter } from 'react-icons/fa6'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import FeedTweetList from '@/components/feed/FeedTweetList'
import type { Database } from '@/types/supabase'
import type { Tweet } from '@/types/tweet'
import { useTweetsStore } from '@/hooks/use-tweets-store'
import { fetchTweetsWithProfiles } from '@/services/tweet-service'
import { MainTweetForm } from '@/components/tweet/MainTweetForm'

export default function Page() {
    const { tweets, setTweets } = useTweetsStore()
    const [isLoading, setIsLoading] = useState(true)
    const { profile } = useAuth()

    useEffect(() => {
        async function loadTweets() {
            try {
                const data = await fetchTweetsWithProfiles()
                setTweets(data)
            } catch (error) {
                console.error('Error loading tweets:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadTweets()
    }, [setTweets])

    const handleNewTweet = async (newTweet: Tweet) => {
        useTweetsStore.getState().addTweet(newTweet)
    }

    return (
        <main className="w-full max-w-[600px] mx-auto bg-background">
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

            <MainTweetForm
                profile={profile}
                onSuccess={handleNewTweet}
            />
            <FeedTweetList tweets={tweets} isLoading={isLoading} />
        </main>
    )
}
