import { createClient } from '@/lib/supabase/server'
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
              <Link href={`/checkout?book=${book.id}`} className="flex-1 bg-emerald-600 text-white font-semibold py-3 rounded-xl text-center hover:bg-emerald-700 transition-colors">
                Buy Now
              </Link>
              <Link href={`/messages?user=${book.seller_id}`} className="flex-1 bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white font-semibold py-3 rounded-xl text-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2">
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
}