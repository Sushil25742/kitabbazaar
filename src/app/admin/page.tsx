import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ShieldCheck, Users, BookOpen, DollarSign, Activity, AlertTriangle } from 'lucide-react'
import { VerifyPaymentButton, ApproveBookButton, RejectBookButton, CancelOrderButton, ResolveReportButton, DeleteBookButton } from './AdminActionButtons'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  // Fetch all necessary data for analytics
  const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  const { data: allBooks } = await supabase.from('books').select('status')
  const { data: allOrders } = await supabase.from('orders').select('status, total_price, commission_amount')
  
  const { data: pendingPayments } = await supabase
    .from('payments')
    .select('*, orders(id, total_price, commission_amount), profiles!payer_id(full_name, phone_number)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  const { data: pendingBooks } = await supabase
    .from('books')
    .select('*, profiles!seller_id(full_name)')
    .eq('status', 'pending_approval')
    .order('created_at', { ascending: false })

  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*, books(title), profiles!buyer_id(full_name), profiles!seller_id(full_name)')
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: topSellers } = await supabase
    .from('profiles')
    .select('full_name, seller_rating, total_books_sold')
    .order('total_books_sold', { ascending: false })
    .limit(5)

  const { data: reports } = await supabase
    .from('reports')
    .select('*, profiles!reporter_id(full_name), books(title)')
    .eq('status', 'pending')

  // Calculate Aggregates
  const totalBooks = allBooks?.length || 0
  const approvedBooks = allBooks?.filter(b => b.status === 'approved').length || 0
  const pendingListings = allBooks?.filter(b => b.status === 'pending_approval').length || 0
  
  const totalOrdersCount = allOrders?.length || 0
  const totalSalesVolume = allOrders?.reduce((sum, order) => sum + (Number(order.total_price) || 0), 0) || 0
  const totalCommission = allOrders?.reduce((sum, order) => sum + (Number(order.commission_amount) || 0), 0) || 0

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-emerald-100 p-3 rounded-full text-emerald-700">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Master Dashboard</h1>
          <p className="text-zinc-500">Platform overview and moderation tools.</p>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-500 mb-2"><Users className="w-4 h-4"/> Total Users</div>
          <div className="text-3xl font-bold">{usersCount || 0}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-500 mb-2"><BookOpen className="w-4 h-4"/> Books Listed</div>
          <div className="text-3xl font-bold">{totalBooks}</div>
          <div className="text-xs text-zinc-400 mt-1">{approvedBooks} Approved • {pendingListings} Pending</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-500 mb-2"><Activity className="w-4 h-4"/> Total Orders</div>
          <div className="text-3xl font-bold">{totalOrdersCount}</div>
        </div>
        <div className="bg-emerald-600 p-6 rounded-2xl text-white shadow-md">
          <div className="flex items-center gap-2 text-emerald-100 mb-2"><DollarSign className="w-4 h-4"/> Platform Revenue</div>
          <div className="text-3xl font-bold">Rs. {totalCommission.toLocaleString()}</div>
          <div className="text-xs text-emerald-200 mt-1">From Rs. {totalSalesVolume.toLocaleString()} total volume</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-12">
          
          {/* Pending Books */}
          <section>
            <h2 className="text-xl font-bold mb-4">Pending Listings ({pendingListings})</h2>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                    <tr><th className="px-4 py-3">Book</th><th className="px-4 py-3">Seller</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Action</th></tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {pendingBooks?.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-zinc-500">No pending listings.</td></tr>}
                    {pendingBooks?.map((book: any) => (
                      <tr key={book.id}>
                        <td className="px-4 py-3 font-medium">{book.title}</td>
                        <td className="px-4 py-3">{book.profiles?.full_name}</td>
                        <td className="px-4 py-3 font-bold text-emerald-600">Rs. {book.price}</td>
                        <td className="px-4 py-3 flex gap-2">
                          <ApproveBookButton bookId={book.id} />
                          <RejectBookButton bookId={book.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Pending Payments */}
          <section>
            <h2 className="text-xl font-bold mb-4">Pending Payments</h2>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                    <tr><th className="px-4 py-3">Order/Payer</th><th className="px-4 py-3">Method</th><th className="px-4 py-3">Platform Fee</th><th className="px-4 py-3">Action</th></tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {pendingPayments?.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-zinc-500">No pending payments.</td></tr>}
                    {pendingPayments?.map((payment: any) => (
                      <tr key={payment.id}>
                        <td className="px-4 py-3">
                          <div className="font-medium">{payment.profiles?.full_name}</div>
                          <div className="text-xs text-zinc-500">Order: {payment.order_id.split('-')[0]}</div>
                        </td>
                        <td className="px-4 py-3"><span className="bg-zinc-100 px-2 py-1 rounded-md">{payment.method}</span></td>
                        <td className="px-4 py-3 font-bold text-emerald-600">Rs. {payment.orders?.commission_amount || (payment.amount * 0.1)}</td>
                        <td className="px-4 py-3"><VerifyPaymentButton paymentId={payment.id} orderId={payment.order_id} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Reported Listings */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-600"><AlertTriangle className="w-5 h-5"/> Reported Listings</h2>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-red-50 dark:bg-red-950/20 border-b border-zinc-200 dark:border-zinc-800">
                    <tr><th className="px-4 py-3">Report</th><th className="px-4 py-3">Target</th><th className="px-4 py-3">Action</th></tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {reports?.length === 0 && <tr><td colSpan={3} className="p-4 text-center text-zinc-500">No pending reports.</td></tr>}
                    {reports?.map((report: any) => (
                      <tr key={report.id}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-red-600">{report.reason}</div>
                          <div className="text-xs text-zinc-500">By: {report.profiles?.full_name}</div>
                        </td>
                        <td className="px-4 py-3">{report.books?.title || 'User Profile'}</td>
                        <td className="px-4 py-3 flex gap-2">
                          <ResolveReportButton reportId={report.id} />
                          {report.reported_book_id && <DeleteBookButton bookId={report.reported_book_id} />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

        </div>

        {/* Sidebar Data */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
            <h3 className="font-bold mb-4">Top Sellers</h3>
            <div className="space-y-4">
              {topSellers?.map((seller: any, i: number) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-700 text-xs">{seller.full_name.charAt(0)}</div>
                    <div>
                      <div className="font-medium text-sm">{seller.full_name}</div>
                      <div className="text-xs text-amber-500">★ {seller.seller_rating}</div>
                    </div>
                  </div>
                  <div className="text-sm font-bold">{seller.total_books_sold} sold</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
            <h3 className="font-bold mb-4">Recent Orders</h3>
            <div className="space-y-4">
              {recentOrders?.map((order: any) => (
                <div key={order.id} className="border-b border-zinc-100 dark:border-zinc-800 pb-3 last:border-0">
                  <div className="text-sm font-medium truncate">{order.books?.title}</div>
                  <div className="text-xs text-zinc-500 mt-1 flex justify-between">
                    <span>{order.profiles?.buyer_id?.full_name || 'Buyer'}</span>
                    <span className="font-bold text-emerald-600">Rs. {order.total_price}</span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <CancelOrderButton orderId={order.id} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}