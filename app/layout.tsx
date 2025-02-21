import './globals.css'
import { Inter } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import { Providers } from '@/components/providers/auth-provider'
import { TweetInteractionsProvider } from '@/contexts/tweet-interactions-context'
import { ToastProvider } from "@/components/ui/toast"
import { Toaster } from "@/components/ui/toaster"
import { headers, cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Home/X Bio',
  description: 'The best place to connect and share with your community.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#16141D',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient({ cookies })

  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="dark light" />
      </head>
      <body className={`${inter.className} h-full bg-[#16141D]`}>
        <TweetInteractionsProvider>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </TweetInteractionsProvider>
      </body>
    </html>
  )
}
