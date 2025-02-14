import Link from 'next/link'
import { Home, Search, Bell, MessageSquare, List, User, Settings, Plus } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { FaSquareXTwitter } from 'react-icons/fa6'
import NewTweetDialog from './new-tweet-dialog'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  user: {
    email?: string
    user_metadata?: {
      avatar_url?: string
      full_name?: string
      username?: string
    }
  }
}

const navItems = [
  { icon: Home, label: 'Home', href: '#' },
  { icon: Search, label: 'Search', href: '#' },
  { icon: Bell, label: 'Notifications', href: '#' },
  { icon: MessageSquare, label: 'Chat', href: '#' },
  { icon: List, label: 'Feeds', href: '#' },
  { icon: List, label: 'Lists', href: '#' },
  { icon: User, label: 'Profile', href: '/profile' },
  { icon: Settings, label: 'Settings', href: '#' },
]

export default function Sidebar({ user }: SidebarProps) {
  return (
    <aside className="w-[88px] lg:w-[275px] h-full p-2 flex flex-col gap-4">
      {/* Twitter/X Logo */}
      <div className="hidden lg:flex justify-center p-4">
        <FaSquareXTwitter className="text-3xl text-[#59F6E8]" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-4 p-3 rounded-full hover:bg-white/5 transition-colors"
          >
            <item.icon className="h-6 w-6 text-white" />
            <span className="hidden lg:inline text-white/90 text-sm">
              {item.label}
            </span>
          </Link>
        ))}
      </nav>

      {/* New Post Button */}
      <div className="hidden lg:block p-2">
        <NewTweetDialog>
          <Button className="w-24 bg-[#1D9BF0] hover:bg-[#1A8CD8] rounded-full py-2 text-sm font-bold">
            <Plus className="mr-2 h-4 w-4" />
            Post
          </Button>
        </NewTweetDialog>
      </div>

      {/* Profile Section */}
      <Link
        href="/profile"
        className="mt-auto p-2 flex items-center gap-3 rounded-full hover:bg-white/5 transition-colors"
      >
        <Avatar className="h-10 w-10">
          <AvatarImage 
            src={user?.user_metadata?.avatar_url} 
            alt="Profile" 
          />
          <AvatarFallback className="bg-[#59F6E8] text-[#16141D]">
            {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        
        <div className="hidden lg:block">
          <p className="text-white font-semibold truncate text-sm">
            {user?.user_metadata?.full_name || user?.email}
          </p>
          <p className="text-sm text-white/60 truncate">
            @{user?.user_metadata?.username || 'user'}
          </p>
        </div>
      </Link>
    </aside>
  )
}
