'use server'
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
}