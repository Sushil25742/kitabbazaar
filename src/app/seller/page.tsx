import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Edit2, Clock, CheckCircle2, XCircle, Package, Book, DollarSign } from 'lucide-react'
import { DeleteButton } from './DeleteButton'

export default async function SellerDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: books } = await supabase
    .from('books')
    .select('*, book_images(image_url)')
    .eq('seller_id', user.id)
    .neq('status', 'deleted')
    .order('created_at', { ascending: false })

  const { data: orders } = await supabase
    .from('orders')
    .select('*, books(title), profiles!buyer_id(full_name, phone_number)')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  // Aggregates
  const listedBooks = books?.length || 0
  const approvedBooks = books?.filter(b => b.status === 'approved').length || 0
  const pendingApproval = books?.filter(b => b.status === 'pending_approval').length || 0
  const soldBooks = books?.filter(b => b.status === 'sold').length || 0
  
  const pendingOrders = orders?.filter(o => o.status === 'pending' || o.status === 'confirmed').length || 0
  const totalSales = orders?.reduce((acc, order) => acc + (Number(order.total_price) || 0), 0) || 0
  const totalCommission = orders?.reduce((acc, order) => acc + (Number(order.commission_amount) || 0), 0) || 0
  const totalPayout = orders?.reduce((acc, order) => acc + (Number(order.payout_amount) || 0), 0) || 0

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved': return <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full w-max"><CheckCircle2 className="w-3 h-3"/> Active</span>
      case 'pending_approval': return <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded-full w-max"><Clock className="w-3 h-3"/> Pending Approval</span>
      case 'rejected': return <span className="flex items-center gap-1 text-xs text-red-700 bg-red-100 px-2 py-1 rounded-full w-max"><XCircle className="w-3 h-3"/> Rejected</span>
      case 'sold': return <span className="flex items-center gap-1 text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded-full w-max">Sold</span>
      default: return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Seller Dashboard</h1>
          <p className="text-zinc-500">Track your active listings and earnings.</p>
        </div>
        <Link href="/sell" className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-emerald-700 transition-colors shadow-md">
          <Plus className="w-4 h-4" /> Add New Book
        </Link>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-2 text-zinc-500 mb-2"><Book className="w-4 h-4"/> Your Books</div>
          <div className="text-3xl font-bold">{listedBooks}</div>
          <div className="text-xs text-zinc-400 mt-1">{approvedBooks} Active • {soldBooks} Sold</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-2 text-zinc-500 mb-2"><Package className="w-4 h-4"/> Pending Orders</div>
          <div className="text-3xl font-bold">{pendingOrders}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-2 text-zinc-500 mb-2"><DollarSign className="w-4 h-4"/> Total Sales</div>
          <div className="text-3xl font-bold">Rs. {totalSales}</div>
          <div className="text-xs text-red-500 mt-1">- Rs. {totalCommission} (10% Fee)</div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 mb-2 font-medium">Total Payout Earnings</div>
          <div className="text-3xl font-bold text-emerald-600">Rs. {totalPayout}</div>
        </div>
      </div>

      <div className="space-y-12">
        {/* Sales Section */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">My Sales & Orders</h2>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 font-medium">Order ID</th>
                    <th className="px-6 py-4 font-medium">Book</th>
                    <th className="px-6 py-4 font-medium">Buyer</th>
                    <th className="px-6 py-4 font-medium">Your Payout</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {orders?.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500">You haven&apos;t made any sales yet.</td></tr>
                  )}
                  {orders?.map((order: any) => (
                    <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-zinc-500">{order.id.split('-')[0]}</td>
                      <td className="px-6 py-4 font-medium">{order.books?.title}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{order.profiles?.full_name}</div>
                        <div className="text-xs text-zinc-500">{order.profiles?.phone_number}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-600">Rs. {order.payout_amount}</td>
                      <td className="px-6 py-4">
                        <span className={"text-xs px-2 py-1 rounded-full uppercase tracking-wider font-semibold " + (order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Listings Section */}
        <section>
          <h2 className="text-xl font-bold mb-4">My Listed Books</h2>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 font-medium">Book</th>
                    <th className="px-6 py-4 font-medium">Price</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {books?.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-zinc-500">You haven&apos;t listed any books yet.</td></tr>
                  )}
                  {books?.map((book: any) => (
                    <tr key={book.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-base">{book.title}</div>
                        <div className="text-zinc-500 text-xs">{book.author}</div>
                      </td>
                      <td className="px-6 py-4 font-medium">Rs. {book.price}</td>
                      <td className="px-6 py-4">{getStatusBadge(book.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <button className="text-zinc-400 hover:text-emerald-600 transition-colors" title="Edit Listing">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <DeleteButton bookId={book.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}