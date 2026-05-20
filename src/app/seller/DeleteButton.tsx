'use client'
import { Trash2 } from 'lucide-react'
import { deleteListing } from './actions'
import { useTransition } from 'react'

export function DeleteButton({ bookId }: { bookId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button 
      onClick={() => {
        if(confirm('Are you sure you want to delete this listing?')) {
          startTransition(() => {
            deleteListing(bookId)
          })
        }
      }}
      disabled={isPending}
      className="text-zinc-400 hover:text-red-600 transition-colors disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}