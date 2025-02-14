import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import TweetList from '@/components/tweet-list'

export default async function Profile() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  const { data: tweets, error } = await supabase
    .from('tweets')
    .select('*, user:users(name, username)')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error fetching tweets:', error)
  }

  return (
    <div className="space-y-6 py-8">
      <div className="flex items-center space-x-4">
        <Avatar className="w-20 h-20">
          <AvatarImage src={`https://avatar.vercel.sh/${profile.username}`} />
          <AvatarFallback>{profile.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          <p className="text-gray-500">@{profile.username}</p>
        </div>
      </div>
      <h2 className="text-xl font-semibold">Your Tweets</h2>
      <TweetList initialTweets={tweets || []} userId={session.user.id} />
    </div>
  )
}
