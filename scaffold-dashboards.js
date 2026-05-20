const fs = require('fs');
const path = require('path');

const files = {
  // -------------------------------------------------------------
  // ADMIN DASHBOARD
  // -------------------------------------------------------------
  'src/app/admin/page.tsx': `import { createClient } from '@/lib/supabase/server'
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
}`,

  'src/app/admin/AdminActionButtons.tsx': `'use client'
import { CheckCircle2, XCircle, Trash2, ShieldCheck, X } from 'lucide-react'
import { verifyPayment, approveBook, rejectBook, cancelOrder, resolveReport, deleteBook } from './actions'
import { useTransition } from 'react'

export function VerifyPaymentButton({ paymentId, orderId }: { paymentId: string, orderId: string }) {
  const [isPending, startTransition] = useTransition()
  return (
    <button onClick={() => { if(confirm('Verify this payment?')) startTransition(() => { verifyPayment(paymentId, orderId) }) }} disabled={isPending} className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-full hover:bg-emerald-700 transition-colors disabled:opacity-50">
      {isPending ? 'Verifying...' : 'Verify'}
    </button>
  )
}

export function ApproveBookButton({ bookId }: { bookId: string }) {
  const [isPending, startTransition] = useTransition()
  return (
    <button onClick={() => startTransition(() => { approveBook(bookId) })} disabled={isPending} className="text-emerald-600 hover:text-emerald-700 disabled:opacity-50" title="Approve">
      <CheckCircle2 className="w-5 h-5" />
    </button>
  )
}

export function RejectBookButton({ bookId }: { bookId: string }) {
  const [isPending, startTransition] = useTransition()
  return (
    <button onClick={() => { if(confirm('Reject this listing?')) startTransition(() => { rejectBook(bookId) }) }} disabled={isPending} className="text-amber-600 hover:text-amber-700 disabled:opacity-50" title="Reject">
      <XCircle className="w-5 h-5" />
    </button>
  )
}

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition()
  return (
    <button onClick={() => { if(confirm('Cancel this order?')) startTransition(() => { cancelOrder(orderId) }) }} disabled={isPending} className="text-xs text-red-600 hover:underline">
      {isPending ? 'Cancelling...' : 'Cancel Order'}
    </button>
  )
}

export function ResolveReportButton({ reportId }: { reportId: string }) {
  const [isPending, startTransition] = useTransition()
  return (
    <button onClick={() => startTransition(() => { resolveReport(reportId) })} disabled={isPending} className="text-xs bg-zinc-200 text-zinc-700 px-2 py-1 rounded hover:bg-zinc-300">
      Dismiss
    </button>
  )
}

export function DeleteBookButton({ bookId }: { bookId: string }) {
  const [isPending, startTransition] = useTransition()
  return (
    <button onClick={() => { if(confirm('DELETE this reported listing entirely?')) startTransition(() => { deleteBook(bookId) }) }} disabled={isPending} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200">
      <Trash2 className="w-3 h-3 inline mr-1" /> Delete Listing
    </button>
  )
}`,

  'src/app/admin/actions.ts': `'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Unauthorized')
  return supabase
}

export async function verifyPayment(paymentId: string, orderId: string) {
  try {
    const supabase = await requireAdmin()
    await supabase.from('payments').update({ status: 'verified' }).eq('id', paymentId)
    await supabase.from('orders').update({ status: 'confirmed' }).eq('id', orderId)
    revalidatePath('/admin')
    return { success: true }
  } catch (error: any) { return { error: error.message } }
}

export async function approveBook(bookId: string) {
  try {
    const supabase = await requireAdmin()
    await supabase.from('books').update({ status: 'approved' }).eq('id', bookId)
    revalidatePath('/admin')
    return { success: true }
  } catch (error: any) { return { error: error.message } }
}

export async function rejectBook(bookId: string) {
  try {
    const supabase = await requireAdmin()
    await supabase.from('books').update({ status: 'rejected' }).eq('id', bookId)
    revalidatePath('/admin')
    return { success: true }
  } catch (error: any) { return { error: error.message } }
}

export async function cancelOrder(orderId: string) {
  try {
    const supabase = await requireAdmin()
    await supabase.from('orders').update({ status: 'cancelled' }).eq('id', orderId)
    revalidatePath('/admin')
    return { success: true }
  } catch (error: any) { return { error: error.message } }
}

export async function resolveReport(reportId: string) {
  try {
    const supabase = await requireAdmin()
    await supabase.from('reports').update({ status: 'dismissed' }).eq('id', reportId)
    revalidatePath('/admin')
    return { success: true }
  } catch (error: any) { return { error: error.message } }
}

export async function deleteBook(bookId: string) {
  try {
    const supabase = await requireAdmin()
    await supabase.from('books').update({ status: 'deleted' }).eq('id', bookId)
    revalidatePath('/admin')
    return { success: true }
  } catch (error: any) { return { error: error.message } }
}`,


  // -------------------------------------------------------------
  // SELLER DASHBOARD
  // -------------------------------------------------------------
  'src/app/seller/page.tsx': `import { createClient } from '@/lib/supabase/server'
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
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500">You haven't made any sales yet.</td></tr>
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
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-zinc-500">You haven't listed any books yet.</td></tr>
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
}`,


  // -------------------------------------------------------------
  // BUYER DASHBOARD
  // -------------------------------------------------------------
  'src/app/dashboard/page.tsx': `import { createClient } from '@/lib/supabase/server'
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
            <p className="text-zinc-500 mb-4">You haven't purchased any books.</p>
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
                <Link href={\`/messages?user=\${order.seller_id}\`} className="text-center w-full bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white font-semibold py-2 rounded-xl hover:bg-zinc-200 transition-colors">
                  Contact Seller
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filepath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}
console.log('Dashboards aggressively enhanced.');
