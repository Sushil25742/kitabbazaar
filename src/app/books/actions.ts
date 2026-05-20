'use server'

import { createClient } from '@/lib/supabase/server'

export async function getBooks(searchParams: any) {
  const supabase = await createClient()
  
  let query = supabase
    .from('books')
    .select('*, book_images(image_url, is_primary)')
    .eq('status', 'approved')

  if (searchParams.q) {
    query = query.or(`title.ilike.%${searchParams.q}%,author.ilike.%${searchParams.q}%,subject.ilike.%${searchParams.q}%`)
  }
  if (searchParams.category) {
    query = query.eq('subject', searchParams.category)
  }
  if (searchParams.condition) {
    query = query.eq('condition', searchParams.condition)
  }
  if (searchParams.location) {
    query = query.ilike('location', `%${searchParams.location}%`)
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
}