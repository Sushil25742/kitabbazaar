import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from './ProfileForm'

export default async function ProfilePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Your Profile</h1>
      
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 md:p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-2xl uppercase">
            {profile?.full_name?.charAt(0) || user.email?.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile?.full_name || 'Anonymous User'}</h2>
            <p className="text-sm text-zinc-500">{user.email}</p>
            <div className="mt-1 flex gap-2">
              <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">{profile?.role}</span>
              <span className="text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">Wallet: Rs. {profile?.wallet_balance}</span>
            </div>
          </div>
        </div>

        <ProfileForm profile={profile} />
      </div>
    </div>
  )
}