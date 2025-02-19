import { Queue } from '@cloudflare/workers-types';
import { createClient } from '@supabase/supabase-js';
import { validateToken, sanitizeTweet, validateTweetContent } from './utils';

/**
 * Environment variables for the Worker
 */
interface Env {
  SUPABASE_URL: string; // Supabase project URL
  SUPABASE_ANON_KEY: string; // Supabase anon/public key
  TWEET_QUEUE: Queue; // Cloudflare Queue for async processing
  JWT_SECRET: string; // Secret for JWT verification
}

/**
 * Tweet data structure
 */
interface Tweet {
  content: string; // Tweet content
  user_id: string; // User ID of the tweet author
}

/**
 * Main Worker entry point
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle tweet creation
    if (request.method === 'POST' && url.pathname === '/tweet') {
      return handleTweetCreation(request, env);
    }

    // Return 404 for unknown routes
    return new Response('Not Found', { status: 404 });
  },
};

/**
 * Handles the creation of a new tweet
 */
async function handleTweetCreation(request: Request, env: Env): Promise<Response> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const user = await validateToken(token, env.JWT_SECRET);
    if (!user) {
      return new Response('Invalid token', { status: 401 });
    }

    const { content } = await request.json();
    if (!validateTweetContent(content)) {
      return new Response('Invalid content', { status: 400 });
    }

    const sanitizedContent = sanitizeTweet(content);

    // 3. Save the tweet to Supabase
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    const { data, error } = await supabase
      .from('tweets')
      .insert({ content: sanitizedContent, user_id: user.sub })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return new Response('Database error: Failed to create tweet', { status: 500 });
    }

    // 4. Enqueue the tweet for async processing
    await env.TWEET_QUEUE.send({
      tweetId: data.id,
      userId: user.sub,
      content: sanitizedContent,
      timestamp: Date.now(),
    });

    console.log(`Tweet ${data.id} enqueued for processing`);

    // 5. Return success response
    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response('Server Error', { status: 500 });
  }
}
