import Link from 'next/link';
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { CheckoutForm } from './CheckoutForm'

export default async function CheckoutPage({ searchParams }: { searchParams: any }) {
  const params = await searchParams;
  if (!params.book) redirect('/books')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: book, error } = await supabase
    .from('books')
    .select('*, profiles(full_name)')
    .eq('id', params.book)
    .single()

  if (error || !book) notFound()
  if (book.seller_id === user.id) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">You cannot buy your own book.</h1>
        <Link href="/books" className="text-emerald-600 hover:underline">Go back to Browse</Link>
      </div>
    )
  }

  const platformCommission = book.price * 0.10
  const sellerPayout = book.price - platformCommission

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Checkout</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Order Summary</h2>
            <div className="flex gap-4">
              <div className="w-20 h-28 bg-zinc-100 rounded-lg flex items-center justify-center text-xs text-zinc-400">Image</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{book.title}</h3>
                <p className="text-sm text-zinc-500 mb-1">by {book.author}</p>
                <p className="text-xs text-zinc-400 mb-4">Seller: {book.profiles?.full_name}</p>
                <div className="text-xl font-bold text-emerald-600">Rs. {book.price}</div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-700 space-y-2 text-sm text-zinc-500">
              <p>Platform Commission (10%): Rs. {platformCommission}</p>
              <p>Seller Payout: Rs. {sellerPayout}</p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-96">
          <CheckoutForm bookId={book.id} />
        </div>
      </div>
    </div>
  )
}