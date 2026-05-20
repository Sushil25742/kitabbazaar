'use server'
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
}