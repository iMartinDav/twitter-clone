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
        // Redirect to login page with error message or error page
        return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin))
      }

      if (user) {
        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id') // Select only ID to optimize query
          .eq('user_id', user.id)
          .single()

        if (profileError && profileError.message !== 'No rows found') {
          // Handle actual profile query errors
          console.error('Error checking profile:', profileError)
          return NextResponse.redirect(
            new URL('/login?error=profile_check_failed', requestUrl.origin),
          )
        }

        // If no profile exists, create one using OAuth data
        if (!profile) {
          const providerData = user.user_metadata
          // Simplified username generation - consider making it more robust and unique on backend if needed.
          const defaultUsername = `user_${Math.random().toString(36).slice(2, 11)}`
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
              new URL('/login?error=profile_creation_failed', requestUrl.origin),
            )
          }
        }
      }
    } catch (error) {
      console.error('Unexpected auth callback error:', error)
      return NextResponse.redirect(new URL('/login?error=unexpected_auth_error', requestUrl.origin))
    }
  }

  // Redirect to the home page after successful auth or if no code is present (consider different handling for no code?)
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
