import { MessageBatch } from '@cloudflare/workers-types';
import { createClient } from '@supabase/supabase-js';

/**
 * Environment variables for the Queue Consumer
 */
interface Env {
  SUPABASE_URL: string; // Supabase project URL
  SUPABASE_ANON_KEY: string; // Supabase anon/public key
}

/**
 * Message structure for the Queue
 */
interface QueueMessage {
  tweetId: string; // ID of the tweet
  userId: string; // ID of the user who created the tweet
  content: string; // Content of the tweet
  timestamp: number; // Timestamp of the tweet
}

/**
 * Queue Consumer for processing tweets
 */
export default {
  async queue(batch: MessageBatch<QueueMessage>, env: Env): Promise<void> {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

    for (const message of batch.messages) {
      try {
        const { tweetId, userId, content } = message.body;

        // 1. Process mentions in the tweet
        const mentions = extractMentions(content);
        if (mentions.length > 0) {
          await supabase
            .from('notifications')
            .insert(mentions.map((username) => ({
              type: 'mention',
              user_id: userId,
              target_user: username,
              tweet_id: tweetId,
            })));
        }

        // 2. Update analytics (e.g., tweet count)
        await supabase
          .from('analytics')
          .insert({ tweet_id: tweetId, event: 'created', timestamp: new Date().toISOString() });

        console.log(`Processed tweet ${tweetId}`);

        // Acknowledge the message to remove it from the queue
        message.ack();
      } catch (error) {
        console.error('Queue processing error:', error);
        message.retry(); // Retry the message if processing fails
      }
    }
  },
};

/**
 * Extracts mentions from tweet content
 */
function extractMentions(content: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const matches = content.match(mentionRegex);
  return matches ? matches.map((m) => m.slice(1)) : []; // Remove '@' from mentions
}
