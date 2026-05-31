'use client';

import { useTransition } from 'react';
import { ShoppingBag } from 'lucide-react';
import { addToCart } from '@/app/cart/actions';
import { useCart } from './CartContext';

export function AddToCartButton({ bookId }: { bookId: string }) {
  const [isPending, startTransition] = useTransition();
  const { refreshCart } = useCart();

  const handleAdd = () => {
    startTransition(async () => {
      try {
        await addToCart(bookId, 1);
        await refreshCart();
      } catch (error) {
        console.error('Failed to add to cart:', error);
        alert('Failed to add to cart. Are you logged in?');
      }
    });
  };

  return (
    <button
      onClick={handleAdd}
      disabled={isPending}
      className={`mt-4 w-full flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-70 ${isPending ? 'cursor-not-allowed' : ''}`}
    >
      <ShoppingBag className="h-4 w-4" />
      {isPending ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}
