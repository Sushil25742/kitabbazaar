import Link from 'next/link';
import { createClient } from '@/lib/supabase/server'
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
          <Link href="/books" className="text-emerald-600 font-medium hover:underline">Browse Books</Link>
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
}