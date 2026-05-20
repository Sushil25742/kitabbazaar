'use client'
import { CheckCircle2 } from 'lucide-react'
import { completeOrder } from './actions'
import { useTransition } from 'react'

export function CompleteOrderButton({ orderId, bookId }: { orderId: string, bookId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button 
      onClick={() => {
        if(confirm('Are you sure you have received the book and want to mark this complete?')) {
          startTransition(() => {
            completeOrder(orderId, bookId)
          })
        }
      }}
      disabled={isPending}
      className="w-full bg-emerald-600 text-white font-semibold py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors disabled:opacity-50"
    >
      <CheckCircle2 className="w-4 h-4" /> {isPending ? 'Saving...' : 'Mark Received'}
    </button>
  )
}