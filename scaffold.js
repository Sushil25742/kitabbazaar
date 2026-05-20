const fs = require('fs');
const path = require('path');

const files = {
  // -- COMPONENTS --
  'src/components/layout/Navbar.tsx': `import Link from 'next/link';
import { BookOpen, Search, User, ShoppingBag, Menu } from 'lucide-react';

export function Navbar() {
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
            <input type="search" placeholder="Search books, authors, or ISBN..." className="w-full rounded-full border border-zinc-300 bg-zinc-50 pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900" />
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/books" className="text-sm font-medium hover:text-emerald-600 transition-colors">Browse</Link>
          <Link href="/sell" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">Sell Book</Link>
          <Link href="/login"><User className="h-5 w-5" /></Link>
        </nav>
        <button className="md:hidden"><Menu className="h-6 w-6" /></button>
      </div>
    </header>
  );
}`,

  'src/components/layout/Footer.tsx': `export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200 py-6 dark:border-zinc-800 mt-auto">
      <div className="container mx-auto px-4 text-center text-sm text-zinc-500">
        © 2026 KitabBazaar. All rights reserved.
      </div>
    </footer>
  );
}`,

  'src/components/books/BookCard.tsx': `import Link from 'next/link';
import Image from 'next/image';

interface BookProps {
  id: string;
  title: string;
  author: string;
  originalPrice: number;
  sellingPrice: number;
  condition: string;
  location: string;
  imageUrl: string;
}

export function BookCard({ id, title, author, originalPrice, sellingPrice, condition, location, imageUrl }: BookProps) {
  const discount = Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);

  return (
    <div className="group relative flex flex-col rounded-2xl bg-white shadow-sm border border-zinc-100 hover:shadow-md transition-all dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <div className="absolute inset-0 flex items-center justify-center text-zinc-400">No Image</div>
        <div className="absolute top-2 right-2 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10">-{discount}%</div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full dark:bg-amber-900/20">{condition}</span>
          <span className="text-xs text-zinc-500">{location}</span>
        </div>
        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-emerald-600 transition-colors">{title}</h3>
        <p className="text-sm text-zinc-500 mb-2">{author}</p>
        <div className="mt-auto pt-2 flex items-end gap-2">
          <span className="text-xl font-bold text-zinc-900 dark:text-white">Rs. {sellingPrice}</span>
          <span className="text-sm text-zinc-400 line-through mb-0.5">Rs. {originalPrice}</span>
        </div>
        <Link href={\`/books/\${id}\`} className="mt-4 w-full block text-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200 transition-colors">
          View Details
        </Link>
      </div>
    </div>
  );
}`,

  'src/components/books/BookGrid.tsx': `export function BookGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {children}
    </div>
  );
}`,

  'src/components/forms/PriceCommissionBox.tsx': `export function PriceCommissionBox({ sellingPrice }: { sellingPrice: number }) {
  const commission = sellingPrice * 0.10;
  const earnings = sellingPrice - commission;
  
  return (
    <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800">
      <h4 className="text-sm font-medium text-emerald-800 dark:text-emerald-400 mb-2">Earnings Breakdown</h4>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-emerald-700/70 dark:text-emerald-400/70">Selling Price:</span>
        <span className="font-medium text-emerald-900 dark:text-emerald-300">Rs. {sellingPrice.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm mb-2 border-b border-emerald-200/50 pb-2">
        <span className="text-emerald-700/70 dark:text-emerald-400/70">Platform Fee (10%):</span>
        <span className="font-medium text-emerald-900 dark:text-emerald-300">- Rs. {commission.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm font-bold">
        <span className="text-emerald-800 dark:text-emerald-400">You will earn:</span>
        <span className="text-emerald-800 dark:text-emerald-400">Rs. {earnings.toFixed(2)}</span>
      </div>
    </div>
  );
}`,

  // -- PAGES --
  'src/app/books/page.tsx': `import { BookCard } from '@/components/books/BookCard';
import { BookGrid } from '@/components/books/BookGrid';

export default function BrowseBooksPage() {
  const MOCK_BOOKS = [
    { id: '1', title: 'Calculus: Early Transcendentals', author: 'James Stewart', originalPrice: 2000, sellingPrice: 800, condition: 'Good', location: 'Kathmandu', imageUrl: '' },
    { id: '2', title: 'Data Structures and Algorithms', author: 'Cormen', originalPrice: 3500, sellingPrice: 1500, condition: 'Like New', location: 'Lalitpur', imageUrl: '' },
    { id: '3', title: 'Principles of Physics', author: 'Resnick, Halliday', originalPrice: 1800, sellingPrice: 600, condition: 'Fair', location: 'Bhaktapur', imageUrl: '' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Browse Books</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Condition</h3>
              <div className="space-y-2 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" className="rounded" /> New</label>
                <label className="flex items-center gap-2"><input type="checkbox" className="rounded" /> Like New</label>
                <label className="flex items-center gap-2"><input type="checkbox" className="rounded" /> Good</label>
              </div>
            </div>
          </div>
        </aside>
        <main className="flex-1">
          <BookGrid>
            {MOCK_BOOKS.map(book => <BookCard key={book.id} {...book} />)}
          </BookGrid>
        </main>
      </div>
    </div>
  );
}`,

  'src/app/sell/page.tsx': `'use client';
import { useState } from 'react';
import { PriceCommissionBox } from '@/components/forms/PriceCommissionBox';

export default function SellBookPage() {
  const [price, setPrice] = useState(0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Sell a Book</h1>
      <p className="text-zinc-500 mb-8">List your book for sale to other students. We take a flat 10% commission only when it sells.</p>
      
      <form className="space-y-6 bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Book Title</label>
            <input type="text" className="w-full rounded-xl border-0 py-3 px-4 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-950 dark:ring-zinc-700" placeholder="e.g. Modern Physics 3rd Edition" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Author</label>
              <input type="text" className="w-full rounded-xl border-0 py-3 px-4 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-950 dark:ring-zinc-700" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Condition</label>
              <select className="w-full rounded-xl border-0 py-3 px-4 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-950 dark:ring-zinc-700">
                <option>New</option>
                <option>Like New</option>
                <option>Good</option>
                <option>Fair</option>
                <option>Poor</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Selling Price (Rs.)</label>
            <input type="number" onChange={(e) => setPrice(Number(e.target.value))} className="w-full rounded-xl border-0 py-3 px-4 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-950 dark:ring-zinc-700" placeholder="0" />
            {price > 0 && <PriceCommissionBox sellingPrice={price} />}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Photos</label>
            <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-8 text-center text-sm text-zinc-500">
              Drag and drop images here, or click to browse.
            </div>
          </div>
        </div>
        <button type="button" className="w-full rounded-full bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 transition-colors">
          Publish Listing
        </button>
      </form>
    </div>
  );
}`,

  'src/app/books/[id]/page.tsx': `export default function BookDetailsPage() { return <div className="p-8 text-center text-xl font-bold">Book Details Page Mock</div>; }`,
  'src/app/checkout/page.tsx': `export default function CheckoutPage() { return <div className="p-8 text-center text-xl font-bold">Checkout Page Mock</div>; }`,
  'src/app/dashboard/page.tsx': `export default function BuyerDashboardPage() { return <div className="p-8 text-center text-xl font-bold">Buyer Dashboard Mock</div>; }`,
  'src/app/seller/page.tsx': `export default function SellerDashboardPage() { return <div className="p-8 text-center text-xl font-bold">Seller Dashboard Mock</div>; }`,
  'src/app/admin/page.tsx': `export default function AdminDashboardPage() { return <div className="p-8 text-center text-xl font-bold">Admin Dashboard Mock</div>; }`,
  'src/app/messages/page.tsx': `export default function MessagesPage() { return <div className="p-8 text-center text-xl font-bold">Messages Mock</div>; }`,
  'src/app/wishlist/page.tsx': `export default function WishlistPage() { return <div className="p-8 text-center text-xl font-bold">Wishlist Mock</div>; }`,
  'src/app/profile/page.tsx': `export default function ProfilePage() { return <div className="p-8 text-center text-xl font-bold">Profile Mock</div>; }`,
  'src/app/notifications/page.tsx': `export default function NotificationsPage() { return <div className="p-8 text-center text-xl font-bold">Notifications Mock</div>; }`,
  'src/app/reports/page.tsx': `export default function ReportsPage() { return <div className="p-8 text-center text-xl font-bold">Reports Mock</div>; }`,
  'src/app/payment-verification/page.tsx': `export default function PaymentVerificationPage() { return <div className="p-8 text-center text-xl font-bold">Payment Verification Mock</div>; }`,
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filepath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}
console.log('Frontend scaffolding completed.');
