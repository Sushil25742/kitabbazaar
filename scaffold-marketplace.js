const fs = require('fs');
const path = require('path');

const files = {
  // --- ACTIONS ---
  'src/app/sell/actions.ts': `'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createListing(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to sell a book.' }
  }

  const title = formData.get('title') as string
  const author = formData.get('author') as string
  const subject = formData.get('subject') as string
  const class_level = formData.get('class_level') as string
  const description = formData.get('description') as string
  const condition = formData.get('condition') as string
  const original_price = Number(formData.get('original_price'))
  const price = Number(formData.get('price'))
  const location = formData.get('location') as string
  const contact_number = formData.get('contact_number') as string
  const imageFiles = formData.getAll('images') as File[]

  if (!title || !author || !condition || !price || !location || !contact_number) {
    return { error: 'Please fill in all required fields.' }
  }

  // 1. Insert Book
  const { data: book, error: bookError } = await supabase
    .from('books')
    .insert({
      seller_id: user.id,
      title,
      author,
      subject,
      class_level,
      description,
      condition,
      original_price,
      price,
      location,
      contact_number,
      status: 'pending_approval'
    })
    .select()
    .single()

  if (bookError) return { error: bookError.message }

  // 2. Upload Images (simplified for mockup, in reality we map and Promise.all)
  // For now, if no images provided, we just skip.
  if (imageFiles.length > 0 && imageFiles[0].size > 0) {
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const fileExt = file.name.split('.').pop()
      const fileName = \`\${book.id}/\${i}-\${Math.random()}.\${fileExt}\`
      
      const { error: uploadError } = await supabase.storage
        .from('book-images')
        .upload(fileName, file)
        
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('book-images').getPublicUrl(fileName)
        await supabase.from('book_images').insert({
          book_id: book.id,
          image_url: publicUrl,
          is_primary: i === 0
        })
      }
    }
  }

  revalidatePath('/books')
  redirect('/seller') // Redirect to seller dashboard to see pending listings
}`,

  'src/app/books/actions.ts': `'use server'

import { createClient } from '@/lib/supabase/server'

export async function getBooks(searchParams: any) {
  const supabase = await createClient()
  
  let query = supabase
    .from('books')
    .select('*, book_images(image_url, is_primary)')
    .eq('status', 'approved')

  if (searchParams.q) {
    query = query.or(\`title.ilike.%\${searchParams.q}%,author.ilike.%\${searchParams.q}%,subject.ilike.%\${searchParams.q}%\`)
  }
  if (searchParams.category) {
    query = query.eq('subject', searchParams.category)
  }
  if (searchParams.condition) {
    query = query.eq('condition', searchParams.condition)
  }
  if (searchParams.location) {
    query = query.ilike('location', \`%\${searchParams.location}%\`)
  }
  
  // Sorting
  if (searchParams.sort === 'price_asc') {
    query = query.order('price', { ascending: true })
  } else if (searchParams.sort === 'price_desc') {
    query = query.order('price', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false }) // Default: Latest
  }

  const { data, error } = await query
  
  if (error) {
    console.error(error)
    return []
  }
  
  return data
}`,

  // --- PAGES ---
  'src/app/sell/page.tsx': `'use client';
import { useState, useActionState } from 'react';
import { PriceCommissionBox } from '@/components/forms/PriceCommissionBox';
import { createListing } from './actions';
import { AlertCircle } from 'lucide-react';

export default function SellBookPage() {
  const [price, setPrice] = useState(0);
  const [state, formAction, isPending] = useActionState(createListing, null);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Sell a Book</h1>
      <p className="text-zinc-500 mb-8">List your book for sale. We take a flat 10% commission only when it sells.</p>
      
      <form action={formAction} className="space-y-8 bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        {state?.error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm border border-red-100">
            <AlertCircle className="w-5 h-5" />
            <span>{state.error}</span>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Book Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Book Title *</label>
              <input type="text" name="title" required className="w-full rounded-xl border-0 py-3 px-4 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-950 dark:ring-zinc-700" placeholder="e.g. Modern Physics 3rd Edition" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Author *</label>
              <input type="text" name="author" required className="w-full rounded-xl border-0 py-3 px-4 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-950 dark:ring-zinc-700" placeholder="e.g. Resnick Halliday" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subject/Category</label>
              <input type="text" name="subject" className="w-full rounded-xl border-0 py-3 px-4 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-950 dark:ring-zinc-700" placeholder="e.g. Engineering, Medicine" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Class/Level</label>
              <input type="text" name="class_level" className="w-full rounded-xl border-0 py-3 px-4 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-950 dark:ring-zinc-700" placeholder="e.g. Bachelor 1st Year" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Condition *</label>
              <select name="condition" required className="w-full rounded-xl border-0 py-3 px-4 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-950 dark:ring-zinc-700">
                <option value="New-like">New-like</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Old">Old</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea name="description" rows={3} className="w-full rounded-xl border-0 py-3 px-4 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-950 dark:ring-zinc-700" placeholder="Any highlights, missing pages, or extra notes?"></textarea>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Original Price (Rs.)</label>
              <input type="number" name="original_price" className="w-full rounded-xl border-0 py-3 px-4 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-950 dark:ring-zinc-700" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Selling Price (Rs.) *</label>
              <input type="number" name="price" required onChange={(e) => setPrice(Number(e.target.value))} className="w-full rounded-xl border-0 py-3 px-4 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-950 dark:ring-zinc-700" placeholder="0" />
            </div>
          </div>
          {price > 0 && <PriceCommissionBox sellingPrice={price} />}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Contact & Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Location *</label>
              <input type="text" name="location" required className="w-full rounded-xl border-0 py-3 px-4 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-950 dark:ring-zinc-700" placeholder="e.g. Pulchowk, Lalitpur" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact Number *</label>
              <input type="text" name="contact_number" required className="w-full rounded-xl border-0 py-3 px-4 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-950 dark:ring-zinc-700" placeholder="+977 " />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Photos</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Upload Images (Max 3)</label>
            <input type="file" name="images" multiple accept="image/*" className="w-full rounded-xl border-0 py-3 px-4 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-950 dark:ring-zinc-700" />
          </div>
        </div>

        <button type="submit" disabled={isPending} className="w-full rounded-full bg-emerald-600 px-4 py-4 font-semibold text-lg text-white hover:bg-emerald-700 transition-all disabled:opacity-70">
          {isPending ? 'Publishing...' : 'Submit Listing'}
        </button>
      </form>
    </div>
  );
}`,

  'src/app/books/page.tsx': `import { BookCard } from '@/components/books/BookCard';
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
            <a href="/books" className="block text-center w-full bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white py-2 rounded-lg text-sm font-medium mt-2">Clear</a>
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
}`,

  'src/app/books/[id]/page.tsx': `import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, User, Phone, ShieldAlert } from 'lucide-react'

export default async function BookDetailsPage({ params }: { params: any }) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: book, error } = await supabase
    .from('books')
    .select('*, profiles(full_name, avatar_url, college_name, seller_rating), book_images(image_url, is_primary)')
    .eq('id', id)
    .single();

  if (error || !book) notFound();

  const discount = Math.round(((book.original_price - book.price) / book.original_price) * 100);
  const primaryImage = book.book_images?.find((img: any) => img.is_primary)?.image_url 
                    || book.book_images?.[0]?.image_url 
                    || null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
        
        {/* Images */}
        <div className="w-full md:w-1/2 lg:w-5/12 space-y-4">
          <div className="aspect-[3/4] w-full rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden relative flex items-center justify-center">
            {primaryImage ? (
              <img src={primaryImage} alt={book.title} className="object-cover w-full h-full" />
            ) : (
              <span className="text-zinc-400">No Image Available</span>
            )}
            {discount > 0 && (
              <div className="absolute top-4 right-4 bg-emerald-600 text-white font-bold px-3 py-1 rounded-full text-sm shadow-md">
                -{discount}% OFF
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="w-full md:w-1/2 lg:w-7/12 flex flex-col">
          <div className="mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full dark:bg-amber-900/30 dark:text-amber-400 uppercase tracking-wider">{book.condition}</span>
              <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full dark:bg-blue-900/30 dark:text-blue-400 uppercase tracking-wider">{book.subject || 'General'}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{book.title}</h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-4">by {book.author}</p>
            
            <div className="flex items-end gap-3 mt-4">
              <span className="text-4xl font-bold text-zinc-900 dark:text-white">Rs. {book.price}</span>
              {book.original_price > 0 && (
                <span className="text-xl text-zinc-400 line-through mb-1">Rs. {book.original_price}</span>
              )}
            </div>
          </div>

          <div className="space-y-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                {book.description || 'No description provided.'}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div>
                <p className="text-sm text-zinc-500 mb-1">Class/Level</p>
                <p className="font-medium">{book.class_level || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 mb-1">Location</p>
                <p className="font-medium flex items-center gap-1"><MapPin className="w-4 h-4 text-emerald-600"/> {book.location}</p>
              </div>
            </div>
          </div>

          {/* Seller Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 mt-auto">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Sold By</h3>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 font-bold text-xl">
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
              <a href={\`tel:\${book.contact_number}\`} className="flex-1 bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white font-semibold py-3 rounded-xl text-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" /> Contact
              </a>
            </div>
            
            <button className="mt-4 text-xs text-red-500 flex items-center justify-center gap-1 w-full hover:underline">
              <ShieldAlert className="w-3 h-3" /> Report this listing
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filepath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}
console.log('Marketplace implementation completed.');
