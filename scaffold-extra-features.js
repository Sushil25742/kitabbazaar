const fs = require('fs');
const path = require('path');

const files = {
  // -------------------------------------------------------------
  // WISHLIST & BOOK DETAILS BUTTONS
  // -------------------------------------------------------------
  'src/app/books/[id]/WishlistButton.tsx': `'use client'
import { Heart } from 'lucide-react'
import { toggleWishlist } from './actions'
import { useTransition, useState } from 'react'

export function WishlistButton({ bookId, isSavedInitial }: { bookId: string, isSavedInitial: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [isSaved, setIsSaved] = useState(isSavedInitial)

  return (
    <button 
      onClick={() => {
        setIsSaved(!isSaved)
        startTransition(() => { toggleWishlist(bookId) })
      }}
      disabled={isPending}
      className={\`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-colors border \${isSaved ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800'}\`}
    >
      <Heart className={\`w-5 h-5 \${isSaved ? 'fill-red-600 text-red-600' : ''}\`} /> 
      {isSaved ? 'Saved' : 'Save'}
    </button>
  )
}`,

  'src/app/books/[id]/ReportButton.tsx': `'use client'
import { ShieldAlert } from 'lucide-react'
import { reportListing } from './actions'
import { useTransition } from 'react'

export function ReportButton({ bookId }: { bookId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button 
      onClick={() => {
        const reason = prompt('Please enter the reason for reporting this listing (e.g. fake, spam, inappropriate):')
        if (reason) startTransition(() => { reportListing(bookId, reason).then(res => alert(res.message)) })
      }}
      disabled={isPending}
      className="mt-4 text-xs text-red-500 flex items-center justify-center gap-1 w-full hover:underline disabled:opacity-50"
    >
      <ShieldAlert className="w-3 h-3" /> {isPending ? 'Reporting...' : 'Report this listing'}
    </button>
  )
}`,

  'src/app/books/[id]/actions.ts': `'use server'
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
  revalidatePath(\`/books/\${bookId}\`)
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
}`,

  'src/app/books/[id]/page.tsx': `import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, User, Phone, ShieldAlert } from 'lucide-react'
import { WishlistButton } from './WishlistButton'
import { ReportButton } from './ReportButton'

export default async function BookDetailsPage({ params }: { params: any }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: book, error } = await supabase
    .from('books')
    .select('*, profiles(full_name, avatar_url, college_name, seller_rating), book_images(image_url, is_primary)')
    .eq('id', id)
    .single();

  if (error || !book) notFound();

  let isSaved = false;
  if (user) {
    const { data } = await supabase.from('wishlist').select('id').eq('user_id', user.id).eq('book_id', id).single()
    if (data) isSaved = true;
  }

  const discount = book.original_price > 0 ? Math.round(((book.original_price - book.price) / book.original_price) * 100) : 0;
  const primaryImage = book.book_images?.find((img: any) => img.is_primary)?.image_url || book.book_images?.[0]?.image_url || null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
        {/* Images */}
        <div className="w-full md:w-1/2 lg:w-5/12 space-y-4">
          <div className="aspect-[3/4] w-full rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden relative flex items-center justify-center">
            {primaryImage ? (
              <img src={primaryImage} alt={book.title} className="object-cover w-full h-full" />
            ) : (
              <span className="text-zinc-400">No Image Available</span>
            )}
            {discount > 0 && <div className="absolute top-4 right-4 bg-emerald-600 text-white font-bold px-3 py-1 rounded-full text-sm shadow-md">-{discount}% OFF</div>}
          </div>
        </div>

        {/* Details */}
        <div className="w-full md:w-1/2 lg:w-7/12 flex flex-col">
          <div className="mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full dark:bg-amber-900/30 uppercase tracking-wider">{book.condition}</span>
              <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full dark:bg-blue-900/30 uppercase tracking-wider">{book.subject || 'General'}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{book.title}</h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-4">by {book.author}</p>
            
            <div className="flex items-end gap-3 mt-4">
              <span className="text-4xl font-bold text-zinc-900 dark:text-white">Rs. {book.price}</span>
              {book.original_price > 0 && <span className="text-xl text-zinc-400 line-through mb-1">Rs. {book.original_price}</span>}
            </div>
          </div>

          <div className="space-y-6 mb-8 flex-1">
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">{book.description || 'No description provided.'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div><p className="text-sm text-zinc-500 mb-1">Class/Level</p><p className="font-medium">{book.class_level || 'N/A'}</p></div>
              <div><p className="text-sm text-zinc-500 mb-1">Location</p><p className="font-medium flex items-center gap-1"><MapPin className="w-4 h-4 text-emerald-600"/> {book.location}</p></div>
            </div>
          </div>

          {/* Seller Card & Actions */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 mt-4">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Sold By</h3>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 font-bold text-xl uppercase">
                  {book.profiles?.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-bold">{book.profiles?.full_name}</p>
                  <p className="text-sm text-zinc-500">{book.profiles?.college_name || 'Independent Student'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-zinc-500 mb-1">Rating</p>
                <p className="font-bold text-amber-500">★ {book.profiles?.seller_rating || 'New'}</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={\`/checkout?book=\${book.id}\`} className="flex-1 bg-emerald-600 text-white font-semibold py-3 rounded-xl text-center hover:bg-emerald-700 transition-colors">
                Buy Now
              </Link>
              <Link href={\`/messages?user=\${book.seller_id}\`} className="flex-1 bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white font-semibold py-3 rounded-xl text-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" /> Message
              </Link>
              <WishlistButton bookId={book.id} isSavedInitial={isSaved} />
            </div>
            
            <ReportButton bookId={book.id} />
          </div>
        </div>
      </div>
    </div>
  );
}`,

  // -------------------------------------------------------------
  // WISHLIST PAGE
  // -------------------------------------------------------------
  'src/app/wishlist/page.tsx': `import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BookCard } from '@/components/books/BookCard'
import { BookGrid } from '@/components/books/BookGrid'
import { Heart } from 'lucide-react'

export default async function WishlistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: wishlist } = await supabase
    .from('wishlist')
    .select('*, books(*, book_images(image_url, is_primary))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full text-red-600">
          <Heart className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Wishlist</h1>
          <p className="text-zinc-500">Books you have saved for later.</p>
        </div>
      </div>

      {wishlist?.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <Heart className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Your wishlist is empty</h3>
          <p className="text-zinc-500 mb-6">Save books you're interested in to find them easily later.</p>
          <a href="/books" className="text-emerald-600 font-medium hover:underline">Browse Books</a>
        </div>
      ) : (
        <BookGrid>
          {wishlist?.map((item: any) => {
            const book = item.books;
            const primaryImage = book.book_images?.find((img: any) => img.is_primary)?.image_url || book.book_images?.[0]?.image_url || '';
            return (
              <BookCard 
                key={book.id} 
                id={book.id}
                title={book.title}
                author={book.author}
                originalPrice={book.original_price}
                sellingPrice={book.price}
                condition={book.condition}
                location={book.location}
                imageUrl={primaryImage}
              />
            )
          })}
        </BookGrid>
      )}
    </div>
  )
}`,

  // -------------------------------------------------------------
  // MESSAGES PAGE
  // -------------------------------------------------------------
  'src/app/messages/page.tsx': `import { createClient } from '@/lib/supabase/server'
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
    .or(\`sender_id.eq.\${user.id},receiver_id.eq.\${user.id}\`)
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
      .or(\`and(sender_id.eq.\${user.id},receiver_id.eq.\${activeUserId}),and(sender_id.eq.\${activeUserId},receiver_id.eq.\${user.id})\`)
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
}`,

  'src/app/messages/actions.ts': `'use server'
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
    link: \`/messages?user=\${user.id}\`
  })

  revalidatePath('/messages')
  return { success: true }
}`,

  'src/app/messages/MessageClient.tsx': `'use client'
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
      <div className={\`w-full md:w-80 border-r border-zinc-200 dark:border-zinc-800 flex flex-col \${activeUserId ? 'hidden md:flex' : 'flex'}\`}>
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 font-semibold text-lg">Conversations</div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-sm">No conversations yet.</div>
          ) : (
            conversations.map((conv: any) => (
              <button 
                key={conv.partner.id}
                onClick={() => router.push(\`/messages?user=\${conv.partner.id}\`)}
                className={\`w-full text-left p-4 border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors flex items-center gap-3 \${activeUserId === conv.partner.id ? 'bg-zinc-50 dark:bg-zinc-800/80' : ''}\`}
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
      <div className={\`flex-1 flex flex-col \${!activeUserId ? 'hidden md:flex items-center justify-center bg-zinc-50 dark:bg-zinc-950/50' : ''}\`}>
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
                    <div key={msg.id} className={\`max-w-[75%] rounded-2xl px-4 py-2 text-sm \${isMe ? 'bg-emerald-600 text-white self-end rounded-br-none' : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 self-start rounded-bl-none'}\`}>
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
}`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filepath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}
console.log('Extra features (Wishlist, Reports, Messaging, Trigger) scaffolded.');
