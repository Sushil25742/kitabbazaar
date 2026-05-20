'use server'

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
}