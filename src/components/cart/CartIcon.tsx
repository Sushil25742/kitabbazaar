'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCart } from './CartContext';

export function CartIcon() {
  const { itemCount } = useCart();

  return (
    <Link href="/cart" className="relative p-2 text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 transition-colors">
      <ShoppingBag className="h-5 w-5" />
      {itemCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-emerald-600 rounded-full">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
