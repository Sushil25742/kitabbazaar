'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteListing(bookId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // RLS ensures they can only delete their own books if we set it, 
  // but let's be explicit in the query too.
  const { error } = await supabase
    .from('books')
    .update({ status: 'deleted' }) // Soft delete
    .eq('id', bookId)
    .eq('seller_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/seller')
  return { success: true }
}