import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import Sidebar from '@/components/Sidebar'
import RightSidebar from '@/components/RightSidebar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tweet | Your App',
  description: 'View and interact with tweets',
}

export default async function TweetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="h-screen w-screen bg-background text-foreground flex justify-center">
      <div className="flex w-full max-w-[1200px] h-full">
        <aside className="sticky top-0 h-screen w-[88px] lg:w-[240px] flex-shrink-0">
          <Sidebar />
        </aside>
        <main className="w-full max-w-[600px] h-full overflow-y-auto border-x border-border flex-grow">
          <Suspense fallback={<TweetLoading />}>
            {children}
          </Suspense>
        </main>
        <aside className="sticky top-0 h-screen w-[350px] flex-shrink-0 hidden lg:block">
          <RightSidebar />
        </aside>
      </div>
    </div>
  )
}

function TweetLoading() {
  return (
    <div className="animate-pulse p-4 space-y-4">
      <div className="h-8 bg-gray-700/20 rounded w-1/4" />
      <div className="space-y-3">
        <div className="h-4 bg-gray-700/20 rounded w-3/4" />
        <div className="h-4 bg-gray-700/20 rounded w-1/2" />
      </div>
    </div>
  )
}
