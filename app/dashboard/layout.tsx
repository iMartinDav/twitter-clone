// app/dashboard/layout.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies() // Get the cookie store
  const supabase = createServerComponentClient({ cookies: () => cookieStore }) // Pass a function to access cookies

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return children
}
