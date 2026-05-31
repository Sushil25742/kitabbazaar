'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getCartItems() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      id,
      quantity,
      books (
        id,
        title,
        author,
        price,
        condition,
        book_images (image_url)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching cart items:', error);
    return [];
  }

  return data;
}

export async function addToCart(bookId: string, quantity: number = 1) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('User must be logged in to add to cart.');

  // Check if item already exists in cart
  const { data: existingItem } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('user_id', user.id)
    .eq('book_id', bookId)
    .single();

  if (existingItem) {
    // Update quantity
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: existingItem.quantity + quantity })
      .eq('id', existingItem.id);

    if (error) throw new Error(error.message);
  } else {
    // Insert new item
    const { error } = await supabase
      .from('cart_items')
      .insert({ user_id: user.id, book_id: bookId, quantity });

    if (error) throw new Error(error.message);
  }

  revalidatePath('/cart');
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('User must be logged in.');
  if (quantity < 1) throw new Error('Quantity must be at least 1.');

  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', cartItemId)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);

  revalidatePath('/cart');
}

export async function removeFromCart(cartItemId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('User must be logged in.');

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);

  revalidatePath('/cart');
}
