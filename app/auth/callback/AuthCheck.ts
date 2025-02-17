'use server'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * Server action to check authentication status and redirect authenticated users.
 * This is typically used on the callback page to redirect already logged-in users away.
 */
export async function authCheck() {
  try {
    const supabase = createServerComponentClient({ cookies })
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('Error during session retrieval in authCheck:', sessionError)
      // Decide how to handle session retrieval error. Maybe redirect to login?
      // For now, we'll just let it fall through - no redirect in case of error.
      return // Important: Exit if session retrieval fails to prevent unexpected redirects.
    }

    if (session) {
      redirect('/') // Redirect authenticated users to the home page.
    }
    // If no session, do nothing - let the callback page handle unauthenticated users.
  } catch (error) {
    console.error('Unexpected error in authCheck:', error)
    // Handle unexpected errors gracefully, maybe redirect to an error page.
    // For now, just log and do nothing to avoid breaking the flow.
  }
}
