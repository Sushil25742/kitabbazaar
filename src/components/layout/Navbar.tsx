import Link from 'next/link';
import { BookOpen, Search, User, ShoppingBag, Menu, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { logout } from '@/app/auth/actions';
import { CartIcon } from '@/components/cart/CartIcon';

export async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 glass-panel">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 group-hover:scale-110 transition-transform">
            <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">KitabBazaar</span>
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
              <div className="hover:scale-110 transition-transform">
                <CartIcon />
              </div>
              <Link href="/profile" className="text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 hover:scale-110 transition-transform">
                <User className="h-5 w-5" />
              </Link>
              <form action={logout}>
                <button type="submit" className="text-zinc-600 hover:text-red-600 dark:text-zinc-400 hover:scale-110 transition-transform">
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