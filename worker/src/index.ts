import { createClient } from '@supabase/supabase-js'
import { Queue, ExecutionContext } from '@cloudflare/workers-types'

interface Env {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  TWEET_QUEUE: Queue
  JWT_SECRET: string // Consider setting this for JWT verification in production
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 })
    }
    if (request.url.endsWith('/api/tweet')) {
      return handleTweetCreation(request, env, ctx)
    }
    return new Response('Not Found', { status: 404 })
  },
}

async function handleTweetCreation(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  try {
    // 1. Authentication (Simplified JWT verification - IMPROVE IN PRODUCTION)
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 })
    }
    const token = authHeader.substring(7)

    const jwtPayload = decodeJWTPayload(token)
    const userId = jwtPayload?.sub

    if (!userId) {
      return new Response('Unauthorized - Invalid JWT', { status: 401 })
    }

    // 2. Input Validation & Sanitization
    const { content } = (await request.json()) as { content: string }
    if (!content || content.trim() === '') {
      return new Response('Invalid input: Content is required', { status: 400 })
    }
    if (content.length > 280) {
      return new Response('Invalid input: Content too long (max 280 chars)', { status: 400 })
    }

    const sanitizedContent = sanitizeInput(content)

    // 3. Supabase Client Setup
    const supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)

    // 4. Insert Tweet into Supabase
    const { data: tweetData, error: tweetError } = await supabaseClient
      .from('tweets')
      .insert({ content: sanitizedContent, user_id: userId })
      .select()
      .single()

    if (tweetError) {
      console.error('Supabase Tweet Insert Error:', tweetError)
      return new Response('Failed to create tweet in database', { status: 500 })
    }

    // 5. Send message to Cloudflare Queue
    await env.TWEET_QUEUE.send({ tweetId: tweetData.id, userId })
    console.log(`Message sent to queue for tweet ID: ${tweetData.id}`)

    return new Response(
      JSON.stringify({ message: 'Tweet created successfully', tweet: tweetData }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  } catch (error: any) {
    console.error('Tweet Creation Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', details: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}

function sanitizeInput(text: string): string {
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function decodeJWTPayload(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        })
        .join(''),
    )

    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('JWT Decode Error:', error)
    return null
  }
}
