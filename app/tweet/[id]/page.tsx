'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { fetchTweetWithReplies } from '@/services/tweet-service'
import { TweetDetailCard } from '@/components/tweet/TweetDetailCard'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/contexts/auth-context'
import type { Tweet, TweetWithReplies } from '@/types/tweet'
import { ReplyThread } from '@/components/tweet/ReplyThread'
import { ReplyTweetForm } from '@/components/tweet/ReplyTweetForm'


export default function TweetPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = React.use(params)
    const [tweet, setTweet] = useState<TweetWithReplies | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const router = useRouter()
    const { profile } = useAuth()

    useEffect(() => {
        async function loadTweet() {
            try {
                setIsLoading(true)
                setError(null)
                const data = await fetchTweetWithReplies(resolvedParams.id)
                setTweet(data)
            } catch (err) {
                console.error('Error loading tweet:', err)
                setError(err instanceof Error ? err : new Error('Failed to load tweet'))
            } finally {
                setIsLoading(false)
            }
        }

        loadTweet()
    }, [resolvedParams.id])

    const handleNewReply = async (reply: Tweet) => {
        if (tweet) {
            setTweet({
                ...tweet,
                replies: [...tweet.replies, reply],
                replies_count: tweet.replies_count + 1
            })
        }
    }

    if (error) {
        return (
            <Alert variant="destructive" className="m-4">
                <AlertDescription>
                    {error.message}
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="min-h-screen">
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-[#2F3336] p-4">
                <div className="flex items-center gap-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-[#2F3336]"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold">Tweet</h1>
                </div>
            </header>

            {isLoading ? (
                <TweetSkeleton />
            ) : tweet ? (
                <>
                    <div className="border-b border-[#2F3336]">
                        <TweetDetailCard tweet={tweet} />
                    </div>

                    <div className="p-4 border-b border-[#2F3336]">
                        <ReplyTweetForm
                            profile={profile}
                            parentTweetId={tweet.id}
                            onSuccess={handleNewReply}
                        />
                    </div>

                    <ReplyThread replies={tweet.replies || []} />
                </>
            ) : (
                <div className="p-4 text-center text-gray-500">
                    Tweet not found
                </div>
            )}
        </div>
    )
}

function TweetSkeleton() {
    return (
        <div className="p-4 space-y-4 animate-pulse">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-700/20" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700/20 rounded w-1/4" />
                    <div className="h-4 bg-gray-700/20 rounded w-1/3" />
                    <div className="h-24 bg-gray-700/20 rounded w-full mt-4" />
                </div>
            </div>
        </div>
    )
}
