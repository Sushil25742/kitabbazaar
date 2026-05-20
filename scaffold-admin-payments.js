const fs = require('fs');
const path = require('path');

const files = {
  // --- ACTIONS ---
  'src/app/admin/actions.ts': `'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Helper to check admin
async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') throw new Error('Unauthorized')
  return supabase
}

export async function verifyPayment(paymentId: string, orderId: string) {
  try {
    const supabase = await requireAdmin()

    // 1. Update Payment Status
    const { error: paymentError } = await supabase
      .from('payments')
      .update({ status: 'verified' })
      .eq('id', paymentId)
    if (paymentError) return { error: paymentError.message }

    // 2. Update Order Status to Confirmed
    const { error: orderError } = await supabase
      .from('orders')
      .update({ status: 'confirmed' })
      .eq('id', orderId)
    if (orderError) return { error: orderError.message }

    revalidatePath('/admin')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function approveBook(bookId: string) {
  try {
    const supabase = await requireAdmin()
    const { error } = await supabase
      .from('books')
      .update({ status: 'approved' })
      .eq('id', bookId)
    if (error) return { error: error.message }
    revalidatePath('/admin')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function rejectBook(bookId: string) {
  try {
    const supabase = await requireAdmin()
    const { error } = await supabase
      .from('books')
      .update({ status: 'rejected' })
      .eq('id', bookId)
    if (error) return { error: error.message }
    revalidatePath('/admin')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}
`,

  // --- PAGES ---
  'src/app/admin/page.tsx': `import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckCircle2, XCircle, ShieldCheck } from 'lucide-react'
import { VerifyPaymentButton, ApproveBookButton, RejectBookButton } from './AdminActionButtons'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  // Fetch pending payments
  const { data: payments } = await supabase
    .from('payments')
    .select('*, orders(id, total_price, commission_amount), profiles!payer_id(full_name, phone_number)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  // Fetch pending books
  const { data: pendingBooks } = await supabase
    .from('books')
    .select('*, profiles!seller_id(full_name)')
    .eq('status', 'pending_approval')
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-emerald-100 p-3 rounded-full text-emerald-700">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-zinc-500">Verify payments and approve listings.</p>
        </div>
      </div>

      <div className="space-y-12">
        {/* Payments Section */}
        <section>
          <h2 className="text-xl font-bold mb-4">Pending Payments</h2>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 font-medium">Payment ID</th>
                    <th className="px-6 py-4 font-medium">Payer</th>
                    <th className="px-6 py-4 font-medium">Method</th>
                    <th className="px-6 py-4 font-medium">Total Price</th>
                    <th className="px-6 py-4 font-medium">Platform Fee (10%)</th>
                    <th className="px-6 py-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {payments?.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-zinc-500">No pending payments.</td></tr>
                  )}
                  {payments?.map((payment: any) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 font-mono text-xs">{payment.id.split('-')[0]}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{payment.profiles?.full_name}</div>
                        <div className="text-xs text-zinc-500">{payment.profiles?.phone_number}</div>
                      </td>
                      <td className="px-6 py-4"><span className="bg-zinc-100 px-2 py-1 rounded-md">{payment.method}</span></td>
                      <td className="px-6 py-4 font-medium">Rs. {payment.amount}</td>
                      <td className="px-6 py-4 font-bold text-emerald-600">Rs. {payment.orders?.commission_amount || (payment.amount * 0.10)}</td>
                      <td className="px-6 py-4">
                        <VerifyPaymentButton paymentId={payment.id} orderId={payment.order_id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Books Section */}
        <section>
          <h2 className="text-xl font-bold mb-4">Pending Book Listings</h2>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 font-medium">Book</th>
                    <th className="px-6 py-4 font-medium">Seller</th>
                    <th className="px-6 py-4 font-medium">Price</th>
                    <th className="px-6 py-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {pendingBooks?.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-zinc-500">No pending books.</td></tr>
                  )}
                  {pendingBooks?.map((book: any) => (
                    <tr key={book.id}>
                      <td className="px-6 py-4 font-medium">{book.title}</td>
                      <td className="px-6 py-4">{book.profiles?.full_name}</td>
                      <td className="px-6 py-4 font-medium">Rs. {book.price}</td>
                      <td className="px-6 py-4 flex gap-2">
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
      </div>
    </div>
  )
}`,

  'src/app/admin/AdminActionButtons.tsx': `'use client'
import { CheckCircle2, XCircle } from 'lucide-react'
import { verifyPayment, approveBook, rejectBook } from './actions'
import { useTransition } from 'react'

export function VerifyPaymentButton({ paymentId, orderId }: { paymentId: string, orderId: string }) {
  const [isPending, startTransition] = useTransition()
  return (
    <button 
      onClick={() => {
        if(confirm('Verify this payment?')) startTransition(() => { verifyPayment(paymentId, orderId) })
      }}
      disabled={isPending}
      className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-full hover:bg-emerald-700 transition-colors disabled:opacity-50"
    >
      {isPending ? 'Verifying...' : 'Verify Payment'}
    </button>
  )
}

export function ApproveBookButton({ bookId }: { bookId: string }) {
  const [isPending, startTransition] = useTransition()
  return (
    <button 
      onClick={() => startTransition(() => { approveBook(bookId) })}
      disabled={isPending}
      className="text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
      title="Approve"
    >
      <CheckCircle2 className="w-5 h-5" />
    </button>
  )
}

export function RejectBookButton({ bookId }: { bookId: string }) {
  const [isPending, startTransition] = useTransition()
  return (
    <button 
      onClick={() => {
        if(confirm('Reject this listing?')) startTransition(() => { rejectBook(bookId) })
      }}
      disabled={isPending}
      className="text-red-600 hover:text-red-700 disabled:opacity-50"
      title="Reject"
    >
      <XCircle className="w-5 h-5" />
    </button>
  )
}`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filepath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}
console.log('Admin Payments scaffolded.');
