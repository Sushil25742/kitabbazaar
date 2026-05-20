import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Clock, CheckCircle2, Box, Heart, MessageSquare, Star } from 'lucide-react'
import { CompleteOrderButton } from './CompleteOrderButton'

export default async function BuyerDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: orders } = await supabase
    .from('orders')
    .select('*, books(title, author, condition, status), profiles!seller_id(full_name, phone_number)')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })

  const { data: wishlist } = await supabase.from('wishlist').select('*, books(title, price)').eq('user_id', user.id)
  const { data: reviews } = await supabase.from('reviews').select('*').eq('reviewer_id', user.id)
  const { data: messages } = await supabase.from('messages').select('*').eq('receiver_id', user.id).eq('is_read', false)

  const pendingOrders = orders?.filter(o => o.status === 'pending' || o.status === 'confirmed').length || 0
  const completedOrders = orders?.filter(o => o.status === 'completed').length || 0

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">My Buyer Dashboard</h1>
        <p className="text-zinc-500">Track your purchases, wishlist, and messages.</p>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-500 mb-2"><Box className="w-4 h-4"/> Active Orders</div>
          <div className="text-3xl font-bold">{pendingOrders}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-500 mb-2"><CheckCircle2 className="w-4 h-4"/> Completed Books</div>
          <div className="text-3xl font-bold">{completedOrders}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-500 mb-2"><Heart className="w-4 h-4"/> Saved Books</div>
          <div className="text-3xl font-bold">{wishlist?.length || 0}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 relative">
          <div className="flex items-center gap-2 text-zinc-500 mb-2"><MessageSquare className="w-4 h-4"/> Unread Messages</div>
          <div className="text-3xl font-bold">{messages?.length || 0}</div>
          {(messages?.length || 0) > 0 && <div className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold mb-4">My Orders</h2>
        {orders?.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-12 text-center border border-zinc-200 dark:border-zinc-800">
            <Box className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-zinc-500 mb-4">You haven&apos;t purchased any books.</p>
            <Link href="/books" className="text-emerald-600 font-medium hover:underline">Start Browsing</Link>
          </div>
        ) : (
          orders?.map((order: any) => (
            <div key={order.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between shadow-sm">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-mono text-zinc-400">Order #{order.id.split('-')[0]}</span>
                  <span className={"flex items-center gap-1 text-xs px-2 py-0.5 rounded-full uppercase font-bold " + (order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>
                    {order.status === 'completed' ? <CheckCircle2 className="w-3 h-3"/> : <Clock className="w-3 h-3"/>}
                    {order.status}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-1">{order.books?.title}</h3>
                <p className="text-sm text-zinc-500">Seller: {order.profiles?.full_name} ({order.profiles?.phone_number})</p>
                <div className="mt-4 text-sm font-medium">Price: <span className="font-bold text-lg">Rs. {order.total_price}</span></div>
              </div>
              
              <div className="flex flex-col gap-2 min-w-[200px]">
                {order.status === 'confirmed' && (
                  <CompleteOrderButton orderId={order.id} bookId={order.book_id} />
                )}
                {order.status === 'pending' && (
                  <div className="text-xs text-center text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100">Waiting for seller verification</div>
                )}
                {order.status === 'completed' && (
                  <button className="text-center w-full bg-zinc-100 text-zinc-700 font-semibold py-2 rounded-xl border border-zinc-200 flex justify-center items-center gap-2">
                    <Star className="w-4 h-4"/> Leave Review
                  </button>
                )}
                <Link href={`/messages?user=${order.seller_id}`} className="text-center w-full bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white font-semibold py-2 rounded-xl hover:bg-zinc-200 transition-colors">
                  Contact Seller
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}