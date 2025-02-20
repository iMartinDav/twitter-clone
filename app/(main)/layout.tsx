import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import RightSidebar from '@/components/RightSidebar'

export default async function MainLayout({
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
          {children}
        </main>
        <aside className="sticky top-0 h-screen w-[350px] flex-shrink-0 hidden lg:block">
          <RightSidebar />
        </aside>
      </div>
    </div>
  )
}
