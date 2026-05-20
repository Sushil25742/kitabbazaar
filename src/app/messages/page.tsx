import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MessageSquare } from 'lucide-react'
import { MessageClient } from './MessageClient'

export default async function MessagesPage({ searchParams }: { searchParams: any }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  
  const params = await searchParams;
  const activeUserId = params.user;

  // Fetch unique users we've chatted with
  const { data: messages } = await supabase
    .from('messages')
    .select('*, sender:profiles!sender_id(id, full_name, avatar_url), receiver:profiles!receiver_id(id, full_name, avatar_url)')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  // Group into conversations
  const conversationsMap = new Map();
  
  // If active user is passed via URL but no messages yet, fetch their profile and inject an empty conversation
  if (activeUserId) {
    const { data: activeProfile } = await supabase.from('profiles').select('id, full_name, avatar_url').eq('id', activeUserId).single()
    if (activeProfile && activeProfile.id !== user.id) {
      conversationsMap.set(activeProfile.id, {
        partner: activeProfile,
        lastMessage: null,
        unread: 0
      })
    }
  }

  messages?.forEach((msg: any) => {
    const isSentByMe = msg.sender_id === user.id
    const partner = isSentByMe ? msg.receiver : msg.sender
    
    if (!conversationsMap.has(partner.id)) {
      conversationsMap.set(partner.id, {
        partner,
        lastMessage: msg,
        unread: (!isSentByMe && !msg.is_read) ? 1 : 0
      })
    } else {
      const conv = conversationsMap.get(partner.id)
      if (!isSentByMe && !msg.is_read) conv.unread += 1
    }
  })

  const conversations = Array.from(conversationsMap.values())
  
  let activeConversationMessages = []
  if (activeUserId) {
    // Mark as read
    await supabase.from('messages').update({ is_read: true }).eq('sender_id', activeUserId).eq('receiver_id', user.id).eq('is_read', false)
    
    const { data: activeMsgs } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${activeUserId}),and(sender_id.eq.${activeUserId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true })
      
    activeConversationMessages = activeMsgs || []
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-3 rounded-full text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          <MessageSquare className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
      </div>

      <div className="flex-1 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        <MessageClient 
          currentUserId={user.id} 
          conversations={conversations} 
          activeUserId={activeUserId} 
          initialMessages={activeConversationMessages} 
        />
      </div>
    </div>
  )
}