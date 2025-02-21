import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'
import type { Tweet, TweetWithReplies } from '@/types/tweet'

const supabase = createClientComponentClient<Database>()
const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL

/**
 * Fetches tweets for the dashboard feed (e.g., 'For You' or 'Following' - currently all tweets).
 * Does not require a userId as it's intended for the main dashboard feed.
 * @returns {Promise<Tweet[]>} - An array of Tweet objects.
 */
export const fetchDashboardTweets = async (customSupabase = supabase): Promise<Tweet[]> => {
    try {
        const { data, error } = await supabase
            .from('tweets')
            .select('*, user:profiles(full_name, username, avatar_url)')
            .order('created_at', { ascending: false })

        if (error) {
            throw error
        }
        return (data as Tweet[]) || []
    } catch (error) {
        console.error('Error fetching tweets for dashboard:', error)
        throw error
    }
}

/**
 * Fetches tweets specifically for a user's profile page.
 * Requires a userId to filter tweets by that user.
 * @param {string} userId - The user ID to fetch tweets for.
 * @returns {Promise<Tweet[]>} - An array of Tweet objects for the specified user.
 */
export const fetchProfileTweets = async (userId: string): Promise<Tweet[]> => {
    try {
        const { data: tweetData, error: tweetError } = await supabase
            .from('tweets')
            .select('*, user:profiles(full_name, username, avatar_url)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (tweetError) {
            throw tweetError
        }
        return (tweetData as Tweet[]) || []
    } catch (error) {
        console.error('Error fetching tweets by user ID for profile:', error)
        throw error
    }
}

// Core tweet operations
export const insertTweet = async (
content: string, userId: string, p0: { retweetId: string },
): Promise<Tweet> => {
    if (content.length > 280) {
        throw new Error('Tweet exceeds 280 characters')
    }

    try {
        // Try worker first, fallback to direct DB
        if (WORKER_URL) {
            const result = await tryWorkerInsert('tweet', {
                content: content.trim(),
                user_id: userId,
            })
            if (result) return result
        }

        const { data: newTweet, error: insertError } = await supabase
            .from('tweets')
            .insert([{
                content: content.trim(),
                user_id: userId,
            }])
            .select(`
                *,
                profiles(*),
                likes_count:likes(count)
            `)
            .single()

        if (insertError) throw insertError

        return transformTweetResponse(newTweet)
    } catch (error) {
        console.error('Error in insertTweet:', error)
        throw new Error('Failed to create tweet')
    }
}

// Reply operations
export const insertReply = async (
    content: string,
    userId: string,
    parentTweetId: string
): Promise<Tweet> => {
    if (content.length > 280) {
        throw new Error('Reply exceeds 280 characters')
    }

    try {
        // Try worker first, fallback to direct DB
        if (WORKER_URL) {
            const result = await tryWorkerInsert('reply', {
                content: content.trim(),
                user_id: userId,
                reply_to: parentTweetId
            })
            if (result) return result
        }

        const { data: newReply, error: insertError } = await supabase
            .from('tweets')
            .insert([{
                content: content.trim(),
                user_id: userId,
                reply_to: parentTweetId
            }])
            .select(`
                *,
                profiles(*),
                likes_count:likes(count)
            `)
            .single()

        if (insertError) throw insertError

        return transformTweetResponse(newReply)
    } catch (error) {
        console.error('Error in insertReply:', error)
        throw new Error('Failed to create reply')
    }
}

// Worker helper
async function tryWorkerInsert(type: 'tweet' | 'reply', payload: any): Promise<Tweet | null> {
    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) return null

        const response = await fetch(`${WORKER_URL}/${type}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify(payload)
        })

        if (response.ok) {
            const data = await response.json()
            return transformTweetResponse(data)
        }
    } catch (error) {
        console.warn('Worker unavailable:', error)
    }
    return null
}

// Helper function to transform response
function transformTweetResponse(data: any): Tweet {
    return {
        ...data,
        user: data.profiles,
        likes_count: data.likes_count || [{ count: 0 }],
        user_has_liked: [],
        retweeted_tweet: data.retweeted_tweet ? {
            ...data.retweeted_tweet,
            user: data.retweeted_tweet.profiles
        } : null
    } as Tweet
}

// Update createReply to use insertTweet
export async function createReply(
    content: string,
    replyToTweetId: string,
    userId: string
): Promise<Tweet> {
    try {
        return await insertReply(content, userId, replyToTweetId)
    } catch (error) {
        console.error('Error creating reply:', error)
        throw error
    }
}

// Add retweet functionality
export async function createRetweet(
    tweetId: string,
    userId: string
): Promise<Tweet> {
    try {
        return await insertTweet('', userId, { retweetId: tweetId })
    } catch (error) {
        console.error('Error creating retweet:', error)
        throw error
    }
}

export const fetchTweetWithReplies = async (tweetId: string): Promise<TweetWithReplies> => {
    try {
        const [{ data: tweet }, { data: replies }] = await Promise.all([
            supabase
                .from('tweets')
                .select('*, user:profiles(full_name, username, avatar_url)')
                .eq('id', tweetId)
                .single(),
            supabase
                .from('tweets')
                .select('*, user:profiles(full_name, username, avatar_url)')
                .eq('reply_to', tweetId)
                .order('created_at', { ascending: true })
        ])

        if (!tweet) throw new Error('Tweet not found')

        return {
            ...tweet,
            replies: replies || []
        } as TweetWithReplies
    } catch (error) {
        console.error('Error fetching tweet with replies:', error)
        throw error
    }
}

export const deleteTweet = async (tweetId: string, userId: string): Promise<void> => {
    const supabase = createClientComponentClient<Database>()

    try {
        const { error } = await supabase
            .from('tweets')
            .delete()
            .match({ id: tweetId, user_id: userId })

        if (error) throw error
    } catch (error) {
        console.error('Error deleting tweet:', error)
        throw error
    }
}

export async function fetchTweetsWithProfiles() {
    const supabase = createClientComponentClient<Database>()

    try {
        const { data, error } = await supabase
            .from('tweets')
            .select(`
                *,
                profiles(*),
                likes_count:likes(count),
                user_has_liked:likes(user_id),
                reply_to_user:tweets!reply_to(profiles(*))
            `)
            .order('created_at', { ascending: false })

        if (error) throw error

        // Transform data to ensure consistent structure
        const transformedTweets = (data || []).map(tweet => ({
            ...tweet,
            user: tweet.profiles,
            profiles: tweet.profiles,
            reply_to_user: tweet.reply_to_user?.profiles,
            likes_count: tweet.likes_count || [{ count: 0 }],
            user_has_liked: tweet.user_has_liked || []
        })) as Tweet[]

        return transformedTweets
    } catch (error) {
        console.error('Error fetching tweets:', error)
        throw error
    }
}
