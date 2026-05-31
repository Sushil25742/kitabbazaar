'use client';

import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useTransition } from 'react';
import { updateCartItemQuantity, removeFromCart } from '@/app/cart/actions';
import { CartItemType, useCart } from './CartContext';

export function CartItem({ item }: { item: CartItemType }) {
  const [isPending, startTransition] = useTransition();
  const { refreshCart } = useCart();
  
  const book = item.books;
  const imageUrl = book.book_images?.[0]?.image_url || '/placeholder-book.png';

  const handleUpdateQuantity = (newQuantity: number) => {
    if (newQuantity < 1) return;
    startTransition(async () => {
      await updateCartItemQuantity(item.id, newQuantity);
      await refreshCart();
    });
  };

  const handleRemove = () => {
    startTransition(async () => {
      await removeFromCart(item.id);
      await refreshCart();
    });
  };

  return (
    <div className={`flex items-start md:items-center gap-4 py-4 border-b border-zinc-200 dark:border-zinc-800 ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="relative w-20 h-28 bg-zinc-100 rounded-md overflow-hidden flex-shrink-0">
        <Image
          src={imageUrl}
          alt={book.title}
          fill
          className="object-cover"
          unoptimized // Remove this in prod if using optimized next/image domains
        />
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">{book.title}</h3>
          <p className="text-zinc-500 text-sm">{book.author}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
              {book.condition}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1">
            <button 
              onClick={() => handleUpdateQuantity(item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-zinc-500 disabled:opacity-50"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="font-medium w-6 text-center">{item.quantity}</span>
            <button 
              onClick={() => handleUpdateQuantity(item.quantity + 1)}
              className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-zinc-500"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          
          <div className="text-right w-24">
            <p className="font-bold">Rs. {book.price * item.quantity}</p>
            {item.quantity > 1 && (
              <p className="text-xs text-zinc-500">Rs. {book.price} each</p>
            )}
          </div>
          
          <button 
            onClick={handleRemove}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
            title="Remove item"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
