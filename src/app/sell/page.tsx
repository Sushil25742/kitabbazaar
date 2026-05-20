'use client';
import { useState, useActionState } from 'react';
import { PriceCommissionBox } from '@/components/forms/PriceCommissionBox';
import { createListing } from './actions';
import { AlertCircle } from 'lucide-react';

export default function SellBookPage() {
  const [price, setPrice] = useState(0);
  const [state, formAction, isPending] = useActionState(createListing, null);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Sell a Book</h1>
      <p className="text-zinc-500 mb-8">List your book for sale. We take a flat 10% commission only when it sells.</p>
      
      <form action={formAction} className="space-y-8 bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        {state?.error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm border border-red-100">
            <AlertCircle className="w-5 h-5" />
            <span>{state.error}</span>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Book Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Book Title *</label>
              <input type="text" name="title" required className="w-full rounded-xl border-0 py-3 px-4 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-950 dark:ring-zinc-700" placeholder="e.g. Modern Physics 3rd Edition" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Author *</label>
              <input type="text" name="author" required className="w-full rounded-xl border-0 py-3 px-4 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-950 dark:ring-zinc-700" placeholder="e.g. Resnick Halliday" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subject/Category</label>
              <input type="text" name="subject" className="w-full rounded-xl border-0 py-3 px-4 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-950 dark:ring-zinc-700" placeholder="e.g. Engineering, Medicine" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Class/Level</label>
              <input type="text" name="class_level" className="w-full rounded-xl border-0 py-3 px-4 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-950 dark:ring-zinc-700" placeholder="e.g. Bachelor 1st Year" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Condition *</label>
              <select name="condition" required className="w-full rounded-xl border-0 py-3 px-4 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-950 dark:ring-zinc-700">
                <option value="New-like">New-like</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Old">Old</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea name="description" rows={3} className="w-full rounded-xl border-0 py-3 px-4 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-950 dark:ring-zinc-700" placeholder="Any highlights, missing pages, or extra notes?"></textarea>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Original Price (Rs.)</label>
              <input type="number" name="original_price" className="w-full rounded-xl border-0 py-3 px-4 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-950 dark:ring-zinc-700" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Selling Price (Rs.) *</label>
              <input type="number" name="price" required onChange={(e) => setPrice(Number(e.target.value))} className="w-full rounded-xl border-0 py-3 px-4 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-950 dark:ring-zinc-700" placeholder="0" />
            </div>
          </div>
          {price > 0 && <PriceCommissionBox sellingPrice={price} />}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Contact & Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Location *</label>
              <input type="text" name="location" required className="w-full rounded-xl border-0 py-3 px-4 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-950 dark:ring-zinc-700" placeholder="e.g. Pulchowk, Lalitpur" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact Number *</label>
              <input type="text" name="contact_number" required className="w-full rounded-xl border-0 py-3 px-4 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-950 dark:ring-zinc-700" placeholder="+977 " />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Photos</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Upload Images (Max 3)</label>
            <input type="file" name="images" multiple accept="image/*" className="w-full rounded-xl border-0 py-3 px-4 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-950 dark:ring-zinc-700" />
          </div>
        </div>

        <button type="submit" disabled={isPending} className="w-full rounded-full bg-emerald-600 px-4 py-4 font-semibold text-lg text-white hover:bg-emerald-700 transition-all disabled:opacity-70">
          {isPending ? 'Publishing...' : 'Submit Listing'}
        </button>
      </form>
    </div>
  );
}