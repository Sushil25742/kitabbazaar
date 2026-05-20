import Link from 'next/link';
import { BookCard } from '@/components/books/BookCard';
import { BookGrid } from '@/components/books/BookGrid';
import { getBooks } from './actions';
import { Search } from 'lucide-react';

export default async function BrowseBooksPage({ searchParams }: { searchParams: any }) {
  const params = await searchParams; // Next.js 15 requires awaiting searchParams
  const books = await getBooks(params);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Browse Books</h1>
          <p className="text-zinc-500">Find cheap used textbooks from students near you.</p>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 flex-shrink-0">
          <form className="sticky top-24 space-y-8 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <div>
              <h3 className="font-semibold mb-3">Search</h3>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <input type="text" name="q" defaultValue={params.q || ''} placeholder="Keywords..." className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 text-sm" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Condition</h3>
              <div className="space-y-2 text-sm">
                {['New-like', 'Good', 'Fair', 'Old'].map(cond => (
                  <label key={cond} className="flex items-center gap-2">
                    <input type="radio" name="condition" value={cond} defaultChecked={params.condition === cond} className="rounded-full text-emerald-600 focus:ring-emerald-600" /> 
                    {cond}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Sort By</h3>
              <select name="sort" defaultValue={params.sort || 'latest'} className="w-full p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 text-sm">
                <option value="latest">Latest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black py-2 rounded-lg text-sm font-medium">Apply Filters</button>
            <Link href="/books" className="block text-center w-full bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white py-2 rounded-lg text-sm font-medium mt-2">Clear</Link>
          </form>
        </aside>
        
        <main className="flex-1">
          {books.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-xl font-bold mb-2">No books found</h3>
              <p className="text-zinc-500">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <BookGrid>
              {books.map((book: any) => {
                const primaryImage = book.book_images?.find((img: any) => img.is_primary)?.image_url 
                                  || book.book_images?.[0]?.image_url 
                                  || '';
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
                );
              })}
            </BookGrid>
          )}
        </main>
      </div>
    </div>
  );
}