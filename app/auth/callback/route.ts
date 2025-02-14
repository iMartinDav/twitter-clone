import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.exchangeCodeForSession(code)

      if (authError) throw authError

      if (user) {
        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        // If no profile exists, create one using OAuth data
        if (!profile && !profileError) {
          // Get OAuth provider data
          const providerData = user.user_metadata
          const username =
            providerData.user_name ||
            providerData.username ||
            providerData.email?.split('@')[0] ||
            `user_${Math.random().toString(36).slice(2, 11)}`

          const { error: insertError } = await supabase.from('profiles').insert([
            {
              user_id: user.id,
              username: username,
              full_name: providerData.full_name || providerData.name || username,
              avatar_url: providerData.avatar_url || providerData.picture,
              created_at: new Date().toISOString(),
            },
          ])

          if (insertError) {
            console.error('Error creating profile:', insertError)
          }
        }
      }
    } catch (error) {
      console.error('Auth callback error:', error)
    }
  }

  // Redirect to the home page after auth
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
