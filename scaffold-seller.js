const fs = require('fs');
const path = require('path');

const files = {
  'src/app/seller/actions.ts': `'use server'

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
}`,

  'src/app/seller/page.tsx': `import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Edit2, Trash2, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { DeleteButton } from './DeleteButton'

export default async function SellerDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: books } = await supabase
    .from('books')
    .select('*, book_images(image_url)')
    .eq('seller_id', user.id)
    .neq('status', 'deleted')
    .order('created_at', { ascending: false })

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved': return <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full"><CheckCircle2 className="w-3 h-3"/> Active</span>
      case 'pending_approval': return <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded-full"><Clock className="w-3 h-3"/> Pending</span>
      case 'rejected': return <span className="flex items-center gap-1 text-xs text-red-700 bg-red-100 px-2 py-1 rounded-full"><XCircle className="w-3 h-3"/> Rejected</span>
      case 'sold': return <span className="flex items-center gap-1 text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded-full">Sold</span>
      default: return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Seller Dashboard</h1>
          <p className="text-zinc-500">Manage your active and pending listings.</p>
        </div>
        <Link href="/sell" className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-full font-medium hover:bg-emerald-700">
          <Plus className="w-4 h-4" /> Add Book
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Book</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {books?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                    You haven't listed any books yet.
                  </td>
                </tr>
              )}
              {books?.map((book: any) => (
                <tr key={book.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-base">{book.title}</div>
                    <div className="text-zinc-500">{book.author}</div>
                  </td>
                  <td className="px-6 py-4 font-medium">Rs. {book.price}</td>
                  <td className="px-6 py-4">{getStatusBadge(book.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button className="text-zinc-400 hover:text-emerald-600 transition-colors" title="Edit coming soon">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <DeleteButton bookId={book.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}`,

  'src/app/seller/DeleteButton.tsx': `'use client'
import { Trash2 } from 'lucide-react'
import { deleteListing } from './actions'
import { useTransition } from 'react'

export function DeleteButton({ bookId }: { bookId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button 
      onClick={() => {
        if(confirm('Are you sure you want to delete this listing?')) {
          startTransition(() => {
            deleteListing(bookId)
          })
        }
      }}
      disabled={isPending}
      className="text-zinc-400 hover:text-red-600 transition-colors disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filepath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}
console.log('Seller Dashboard completed.');
