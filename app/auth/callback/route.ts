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

      if (authError) {
        console.error('Auth code exchange error:', authError)
        return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin))
      }

      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (profileError && profileError.message !== 'No rows found') {
          console.error('Error checking profile:', profileError)
          return NextResponse.redirect(
            new URL('/login?error=profile_check_failed', requestUrl.origin)
          )
        }

        if (!profile) {
          const providerData = user.user_metadata
          const defaultUsername = `user_${Date.now().toString(36)}`
          const username =
            providerData.user_name ||
            providerData.username ||
            providerData.email?.split('@')[0] ||
            defaultUsername

          const profileDataToInsert = {
            user_id: user.id,
            username: username,
            full_name: providerData.full_name || providerData.name || username,
            avatar_url: providerData.avatar_url || providerData.picture,
            created_at: new Date().toISOString(),
          }

          const { error: insertError } = await supabase
            .from('profiles')
            .insert([profileDataToInsert])

          if (insertError) {
            console.error('Error creating profile:', insertError)
            return NextResponse.redirect(
              new URL('/login?error=profile_creation_failed', requestUrl.origin)
            )
          }
        }
      }
    } catch (error) {
      console.error('Unexpected auth callback error:', error)
      return NextResponse.redirect(new URL('/login?error=unexpected_auth_error', requestUrl.origin))
    }
  }

  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
