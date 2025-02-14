import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Sidebar from './sidebar'
import RightSidebar from './right-sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="h-screen w-screen bg-background text-foreground flex justify-center">
      {/* Centered container */}
      <div className="flex w-full max-w-[1200px] h-full">
        {/* Left Sidebar */}
        <aside className="sticky top-0 h-screen w-[88px] lg:w-[240px] flex-shrink-0">
          <Sidebar user={user} />
        </aside>

        {/* Main Content - Centered Column */}
        <main className="w-full max-w-[600px] h-full overflow-y-auto border-x border-border flex-grow">
          {children}
        </main>

        {/* Right Sidebar */}
        <aside className="sticky top-0 h-screen w-[350px] flex-shrink-0 hidden lg:block">
          <RightSidebar />
        </aside>
      </div>
    </div>
  )
}
