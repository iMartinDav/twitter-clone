import './globals.css'
import { Inter } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import { Providers } from '@/components/providers/auth-provider'
import { TweetInteractionsProvider } from '@/contexts/tweet-interactions-context'

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
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-[#16141D]`}>
        <TweetInteractionsProvider>
          <Providers>
            {children}
          </Providers>
        </TweetInteractionsProvider>
      </body>
    </html>
  )
}
