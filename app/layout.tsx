// app/layout.tsx
import './globals.css'
import { Inter } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import { Providers } from '@/components/providers/auth-provider'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

import RightSidebar from '../components/RightSidebar'
import Sidebar from '@/components/Sidebar'
import { TweetInteractionsProvider } from '@/contexts/tweet-interactions-context'; // Import TweetInteractionsProvider

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Home/X Bio',
  description: 'The best place to connect and share with your community.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-[#16141D]`}>
        <TweetInteractionsProvider> {/* Wrap the content with TweetInteractionsProvider */}
          <Providers>
            {session ? (
              <div className="h-screen w-screen bg-background text-foreground flex justify-center">
                <div className="flex w-full max-w-[1200px] h-full">
                  <aside className="sticky top-0 h-screen w-[88px] lg:w-[240px] flex-shrink-0">
                    <Sidebar />
                  </aside>
                  <main className="w-full max-w-[600px] h-full overflow-y-auto border-x border-border flex-grow">
                    {children}
                  </main>
                  <aside className="sticky top-0 h-screen w-[350px] flex-shrink-0 hidden lg:block">
                    <RightSidebar />
                  </aside>
                </div>
              </div>
            ) : (
              children
            )}
          </Providers>
        </TweetInteractionsProvider>
      </body>
    </html>
  )
}
