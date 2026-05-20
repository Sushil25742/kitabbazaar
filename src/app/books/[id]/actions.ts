'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleWishlist(bookId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: existing } = await supabase.from('wishlist').select('id').eq('user_id', user.id).eq('book_id', bookId).single()
  
  if (existing) {
    await supabase.from('wishlist').delete().eq('id', existing.id)
  } else {
    await supabase.from('wishlist').insert({ user_id: user.id, book_id: bookId })
  }
  revalidatePath(`/books/${bookId}`)
  revalidatePath('/wishlist')
}

export async function reportListing(bookId: string, reason: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { message: 'You must be logged in to report.' }

  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    reported_book_id: bookId,
    reason: reason
  })
  
  if (error) return { message: 'Failed to submit report. You may have already reported this.' }
  return { message: 'Report submitted successfully. Thank you.' }
}