import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Bell, Check } from 'lucide-react'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Auto mark all as read when visited
  await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full text-emerald-600">
          <Bell className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-zinc-500">Your recent alerts and updates.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {notifications?.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
            <p>You&apos;re all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {notifications?.map((notif: any) => (
              <div key={notif.id} className={"p-4 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors flex items-start gap-4 " + (!notif.is_read ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : '')}>
                <div className={"mt-1 w-2 h-2 rounded-full flex-shrink-0 " + (notif.is_read ? 'bg-zinc-200 dark:bg-zinc-700' : 'bg-emerald-500')}></div>
                <div className="flex-1">
                  <p className="text-sm text-zinc-900 dark:text-zinc-100">{notif.content}</p>
                  <p className="text-xs text-zinc-500 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                  {notif.link && (
                    <Link href={notif.link} className="inline-block mt-2 text-xs font-medium text-emerald-600 hover:underline">
                      View Details →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}