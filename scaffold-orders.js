const fs = require('fs');
const path = require('path');

const files = {
  // --- ACTIONS ---
  'src/app/checkout/actions.ts': `'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function placeOrder(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const bookId = formData.get('book_id') as string
  const paymentMethod = formData.get('payment_method') as string

  // 1. Fetch book details
  const { data: book, error: bookError } = await supabase
    .from('books')
    .select('*')
    .eq('id', bookId)
    .single()

  if (bookError || !book) return { error: 'Book not found' }
  if (book.seller_id === user.id) return { error: 'You cannot buy your own book.' }
  if (book.status !== 'approved') return { error: 'This book is not available for purchase.' }

  // 2. Create Order
  // The database triggers/generated columns automatically compute commission (10%) and payout (90%).
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      book_id: book.id,
      buyer_id: user.id,
      seller_id: book.seller_id,
      total_price: book.price,
      status: 'pending'
    })
    .select()
    .single()

  if (orderError) return { error: orderError.message }

  // 3. Create initial payment record
  const { error: paymentError } = await supabase
    .from('payments')
    .insert({
      order_id: order.id,
      payer_id: user.id,
      amount: book.price,
      method: paymentMethod as any,
      status: paymentMethod === 'COD' ? 'pending' : 'pending' // Default to pending until verified
    })

  if (paymentError) {
    // Note: In production we'd want a transaction or rollback here
    console.error('Payment record failed:', paymentError)
  }

  // Redirect to buyer dashboard
  redirect('/dashboard')
}`,

  'src/app/dashboard/actions.ts': `'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function completeOrder(orderId: string, bookId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // 1. Verify user is buyer
  const { data: order } = await supabase.from('orders').select('buyer_id').eq('id', orderId).single()
  if (order?.buyer_id !== user.id) return { error: 'Unauthorized' }

  // 2. Mark order as completed
  const { error: orderError } = await supabase
    .from('orders')
    .update({ status: 'completed' })
    .eq('id', orderId)

  if (orderError) return { error: orderError.message }

  // 3. Mark book as sold
  await supabase
    .from('books')
    .update({ status: 'sold' })
    .eq('id', bookId)

  revalidatePath('/dashboard')
  return { success: true }
}`,

  // --- PAGES ---
  'src/app/checkout/page.tsx': `import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { CheckoutForm } from './CheckoutForm'

export default async function CheckoutPage({ searchParams }: { searchParams: any }) {
  const params = await searchParams;
  if (!params.book) redirect('/books')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: book, error } = await supabase
    .from('books')
    .select('*, profiles(full_name)')
    .eq('id', params.book)
    .single()

  if (error || !book) notFound()
  if (book.seller_id === user.id) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">You cannot buy your own book.</h1>
        <a href="/books" className="text-emerald-600 hover:underline">Go back to Browse</a>
      </div>
    )
  }

  const platformCommission = book.price * 0.10
  const sellerPayout = book.price - platformCommission

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Checkout</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Order Summary</h2>
            <div className="flex gap-4">
              <div className="w-20 h-28 bg-zinc-100 rounded-lg flex items-center justify-center text-xs text-zinc-400">Image</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{book.title}</h3>
                <p className="text-sm text-zinc-500 mb-1">by {book.author}</p>
                <p className="text-xs text-zinc-400 mb-4">Seller: {book.profiles?.full_name}</p>
                <div className="text-xl font-bold text-emerald-600">Rs. {book.price}</div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-700 space-y-2 text-sm text-zinc-500">
              <p>Platform Commission (10%): Rs. {platformCommission}</p>
              <p>Seller Payout: Rs. {sellerPayout}</p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-96">
          <CheckoutForm bookId={book.id} />
        </div>
      </div>
    </div>
  )
}`,

  'src/app/checkout/CheckoutForm.tsx': `'use client'

import { useActionState } from 'react'
import { placeOrder } from './actions'
import { AlertCircle } from 'lucide-react'

export function CheckoutForm({ bookId }: { bookId: string }) {
  const [state, formAction, isPending] = useActionState(placeOrder, null)

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm sticky top-24">
      <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
      
      <form action={formAction} className="space-y-6">
        <input type="hidden" name="book_id" value={bookId} />
        
        {state?.error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{state.error}</span>
          </div>
        )}

        <div className="space-y-3">
          <label className="flex items-center gap-3 p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <input type="radio" name="payment_method" value="COD" defaultChecked className="w-4 h-4 text-emerald-600 focus:ring-emerald-600" />
            <span className="font-medium">Cash on Delivery</span>
          </label>
          <label className="flex items-center gap-3 p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <input type="radio" name="payment_method" value="eSewa" className="w-4 h-4 text-emerald-600 focus:ring-emerald-600" />
            <span className="font-medium">eSewa (Mock)</span>
          </label>
          <label className="flex items-center gap-3 p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <input type="radio" name="payment_method" value="Khalti" className="w-4 h-4 text-emerald-600 focus:ring-emerald-600" />
            <span className="font-medium">Khalti (Mock)</span>
          </label>
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          className="w-full bg-emerald-600 text-white font-bold py-4 rounded-full hover:bg-emerald-700 transition-all disabled:opacity-70"
        >
          {isPending ? 'Processing...' : 'Confirm Order'}
        </button>
      </form>
    </div>
  )
}`,

  'src/app/dashboard/page.tsx': `import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Clock, CheckCircle2, Box } from 'lucide-react'
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tight mb-2">My Orders</h1>
      <p className="text-zinc-500 mb-8">Books you have bought or requested.</p>

      <div className="space-y-4">
        {orders?.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-12 text-center border border-zinc-200 dark:border-zinc-800">
            <Box className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-zinc-500 mb-4">You haven't purchased any books.</p>
            <Link href="/books" className="text-emerald-600 font-medium hover:underline">Start Browsing</Link>
          </div>
        ) : (
          orders?.map((order: any) => (
            <div key={order.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-mono text-zinc-400">Order #{order.id.split('-')[0]}</span>
                  {order.status === 'completed' 
                    ? <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full"><CheckCircle2 className="w-3 h-3"/> Completed</span>
                    : <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3"/> {order.status}</span>
                  }
                </div>
                <h3 className="font-bold text-lg mb-1">{order.books?.title}</h3>
                <p className="text-sm text-zinc-500">Seller: {order.profiles?.full_name} ({order.profiles?.phone_number})</p>
                <div className="mt-4 flex gap-4 text-sm font-medium">
                  <span>Price: Rs. {order.total_price}</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 min-w-[200px]">
                {order.status === 'pending' && (
                  <CompleteOrderButton orderId={order.id} bookId={order.book_id} />
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
}`,

  'src/app/dashboard/CompleteOrderButton.tsx': `'use client'
import { CheckCircle2 } from 'lucide-react'
import { completeOrder } from './actions'
import { useTransition } from 'react'

export function CompleteOrderButton({ orderId, bookId }: { orderId: string, bookId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button 
      onClick={() => {
        if(confirm('Are you sure you have received the book and want to mark this complete?')) {
          startTransition(() => {
            completeOrder(orderId, bookId)
          })
        }
      }}
      disabled={isPending}
      className="w-full bg-emerald-600 text-white font-semibold py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors disabled:opacity-50"
    >
      <CheckCircle2 className="w-4 h-4" /> {isPending ? 'Saving...' : 'Mark Received'}
    </button>
  )
}`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filepath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}
console.log('Orders and Checkout scaffolded.');
