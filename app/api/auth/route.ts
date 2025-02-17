import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod' // Import Zod for validation

// Define a schema for request body validation
const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'), // Adjust min length as needed
  action: z.enum(['signin', 'signup']), // Removed invalid errorMap option from z.enum
})

export async function POST(request: Request) {
  try {
    const reqBody = await request.json()
    const { email, password, action } = authSchema.parse(reqBody) // Validate request body

    const supabase = createRouteHandlerClient({ cookies })

    if (action === 'signin') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        console.error('Sign-in error:', error) // Log full error on server
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      return NextResponse.json({ user: data.user })
    } else if (action === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
      })
      if (error) {
        console.error('Sign-up error:', error) // Log full error on server
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      return NextResponse.json({ user: data.user })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 }) // Should not reach here due to schema validation
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Handle Zod validation errors specifically
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('API POST error:', error) // Log unexpected errors
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
