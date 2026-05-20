'use server'

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
      const fileName = `${book.id}/${i}-${Math.random()}.${fileExt}`
      
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
}