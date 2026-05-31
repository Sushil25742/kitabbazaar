'use client';

import Link from 'next/link';
import { ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '@/components/cart/CartContext';
import { CartItem } from '@/components/cart/CartItem';

export default function CartPage() {
  const { items, isLoading, itemCount } = useCart();

  const subtotal = items.reduce((sum, item) => sum + (item.books.price * item.quantity), 0);
  const commission = subtotal * 0.10; // 10% commission as per schema
  const total = subtotal + commission;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
        <div className="bg-emerald-50 dark:bg-emerald-950/30 w-24 h-24 rounded-full flex items-center justify-center mb-6 text-emerald-600">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-zinc-500 mb-8 max-w-md">
          Looks like you haven&apos;t added any books to your cart yet. Browse our collection to find your next great read.
        </p>
        <Link 
          href="/books" 
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full font-medium transition-colors inline-flex items-center gap-2"
        >
          Browse Books
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Shopping Cart ({itemCount} items)</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 flex flex-col gap-2">
          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>
        
        <div>
          <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Service Fee (10%)</span>
                <span>Rs. {commission.toFixed(2)}</span>
              </div>
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-emerald-600 dark:text-emerald-500">Rs. {total.toFixed(2)}</span>
              </div>
            </div>
            
            <Link 
              href="/checkout"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-lg"
            >
              Proceed to Checkout
            </Link>
            
            <div className="mt-6 flex items-start gap-3 text-sm text-zinc-500 bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-lg">
              <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <p>Secure checkout provided by Khalti and eSewa. Buyer protection included.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
