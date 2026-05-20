'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function sendMessage(receiverId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  if (!content.trim()) return { error: 'Message empty' }

  await supabase.from('messages').insert({
    sender_id: user.id,
    receiver_id: receiverId,
    content: content.trim()
  })
  
  // Create notification for receiver
  await supabase.from('notifications').insert({
    user_id: receiverId,
    type: 'new_message',
    content: 'You have a new message.',
    link: `/messages?user=${user.id}`
  })

  revalidatePath('/messages')
  return { success: true }
}