'use client'

import { useActionState } from 'react'
import { placeOrder } from './actions'
import { AlertCircle } from 'lucide-react'

export function CheckoutForm({ bookId }: { bookId: string }) {
  const [state, formAction, isPending] = useActionState(placeOrder, null)

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm sticky top-24">
      <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
      
      <form action={formAction} className="space-y-6">
        <input type="hidden" name="book_id" value={bookId} />
        
        {state?.error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{state.error}</span>
          </div>
        )}

        <div className="space-y-3">
          <label className="flex items-center gap-3 p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <input type="radio" name="payment_method" value="COD" defaultChecked className="w-4 h-4 text-emerald-600 focus:ring-emerald-600" />
            <span className="font-medium">Cash on Delivery</span>
          </label>
          <label className="flex items-center gap-3 p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <input type="radio" name="payment_method" value="eSewa" className="w-4 h-4 text-emerald-600 focus:ring-emerald-600" />
            <span className="font-medium">eSewa (Mock)</span>
          </label>
          <label className="flex items-center gap-3 p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <input type="radio" name="payment_method" value="Khalti" className="w-4 h-4 text-emerald-600 focus:ring-emerald-600" />
            <span className="font-medium">Khalti (Mock)</span>
          </label>
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          className="w-full bg-emerald-600 text-white font-bold py-4 rounded-full hover:bg-emerald-700 transition-all disabled:opacity-70"
        >
          {isPending ? 'Processing...' : 'Confirm Order'}
        </button>
      </form>
    </div>
  )
}