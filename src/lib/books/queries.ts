import { unstable_cache } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

// Get a cached list of books, revalidating every 1 hour (3600 seconds)
export const getCachedBooks = unstable_cache(
  async (limit: number = 20) => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('books')
      .select(`
        id,
        title,
        author,
        original_price,
        price,
        condition,
        location,
        book_images (image_url)
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching cached books:', error);
      return [];
    }

    return data;
  },
  ['approved-books-list'], // Cache key tags
  { revalidate: 3600, tags: ['books'] }
);

// Get a cached single book
export const getCachedBookById = unstable_cache(
  async (id: string) => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('books')
      .select(`
        *,
        book_images (*)
      `)
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  },
  ['single-book'],
  { revalidate: 3600, tags: ['book-details'] }
);
