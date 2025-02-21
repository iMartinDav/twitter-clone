import type { Tweet } from '@/types/tweet'

export function organizeTweetsIntoThreads(tweets: Tweet[]) {
  const threadMap = new Map<string, Tweet[]>()
  const topLevelTweets: Tweet[] = []

  // First pass: organize tweets by parent
  tweets.forEach(tweet => {
    if (tweet.reply_to) {
      const replies = threadMap.get(tweet.reply_to) || []
      threadMap.set(tweet.reply_to, [...replies, tweet])
    } else {
      topLevelTweets.push(tweet)
    }
  })

  return { topLevelTweets, threadMap }
}
