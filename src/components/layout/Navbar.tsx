import Link from 'next/link';
import { BookOpen, Search, User, ShoppingBag, Menu, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { logout } from '@/app/auth/actions';
import { CartIcon } from '@/components/cart/CartIcon';

export async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-black/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
          <span className="text-xl font-bold tracking-tight">KitabBazaar</span>
        </Link>
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
            <input type="search" placeholder="Search books..." className="w-full rounded-full border border-zinc-300 bg-zinc-50 pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900" />
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/books" className="text-sm font-medium hover:text-emerald-600 transition-colors">Browse</Link>
          <Link href="/sell" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">Sell Book</Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              <CartIcon />
              <Link href="/profile" className="text-zinc-600 hover:text-emerald-600 dark:text-zinc-400">
                <User className="h-5 w-5" />
              </Link>
              <form action={logout}>
                <button type="submit" className="text-zinc-600 hover:text-red-600 dark:text-zinc-400">
                  <LogOut className="h-5 w-5" />
                </button>
              </form>
            </div>
          ) : (
            <Link href="/login" className="text-sm font-medium hover:text-emerald-600 transition-colors">Log In</Link>
          )}
        </nav>
        <button className="md:hidden"><Menu className="h-6 w-6" /></button>
      </div>
    </header>
  );
}