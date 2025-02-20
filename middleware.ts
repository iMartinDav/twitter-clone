import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const publicPaths = ['/login', '/auth/callback']
  const isPublicPath = publicPaths.includes(req.nextUrl.pathname)

  // Store the current URL for post-login redirect
  if (!session && !isPublicPath) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If logged in and trying to access login page, redirect to home
  if (session && isPublicPath) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Update response headers to prevent caching
  res.headers.set('Cache-Control', 'no-store, max-age=0')
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
