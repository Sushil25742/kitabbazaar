'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Send } from 'lucide-react'
import { sendMessage } from './actions'

export function MessageClient({ currentUserId, conversations, activeUserId, initialMessages }: any) {
  const router = useRouter()
  const [text, setText] = useState('')
  const [isPending, startTransition] = useTransition()

  const activeConv = conversations.find((c: any) => c.partner.id === activeUserId)

  const handleSend = () => {
    if (!text.trim() || !activeUserId) return
    const msg = text
    setText('')
    startTransition(() => {
      sendMessage(activeUserId, msg)
    })
  }

  return (
    <>
      {/* Sidebar */}
      <div className={`w-full md:w-80 border-r border-zinc-200 dark:border-zinc-800 flex flex-col ${activeUserId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 font-semibold text-lg">Conversations</div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-sm">No conversations yet.</div>
          ) : (
            conversations.map((conv: any) => (
              <button 
                key={conv.partner.id}
                onClick={() => router.push(`/messages?user=${conv.partner.id}`)}
                className={`w-full text-left p-4 border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors flex items-center gap-3 ${activeUserId === conv.partner.id ? 'bg-zinc-50 dark:bg-zinc-800/80' : ''}`}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0 uppercase">
                  {conv.partner.full_name.charAt(0)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="font-semibold truncate flex justify-between">
                    {conv.partner.full_name}
                    {conv.unread > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{conv.unread}</span>}
                  </div>
                  <div className="text-xs text-zinc-500 truncate">{conv.lastMessage?.content || 'New conversation'}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!activeUserId ? 'hidden md:flex items-center justify-center bg-zinc-50 dark:bg-zinc-950/50' : ''}`}>
        {!activeUserId ? (
          <div className="text-zinc-400 text-sm">Select a conversation to start messaging</div>
        ) : (
          <>
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3 bg-white dark:bg-zinc-900 sticky top-0">
              <button onClick={() => router.push('/messages')} className="md:hidden text-zinc-500 mr-2">← Back</button>
              <div className="font-bold">{activeConv?.partner?.full_name}</div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50 dark:bg-zinc-950/30 flex flex-col">
              {initialMessages.length === 0 ? (
                <div className="text-center text-zinc-400 text-sm my-auto">Start the conversation!</div>
              ) : (
                initialMessages.map((msg: any) => {
                  const isMe = msg.sender_id === currentUserId;
                  return (
                    <div key={msg.id} className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-emerald-600 text-white self-end rounded-br-none' : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 self-start rounded-bl-none'}`}>
                      {msg.content}
                    </div>
                  )
                })
              )}
              {isPending && <div className="self-end text-xs text-zinc-400">Sending...</div>}
            </div>

            <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex gap-2 relative">
                <input 
                  type="text" 
                  value={text} 
                  onChange={e => setText(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..." 
                  className="flex-1 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-12"
                />
                <button 
                  onClick={handleSend}
                  disabled={isPending || !text.trim()}
                  className="absolute right-1.5 top-1.5 w-10 h-10 flex items-center justify-center bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4 -ml-0.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}