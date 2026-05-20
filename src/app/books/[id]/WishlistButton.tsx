'use client'
import { Heart } from 'lucide-react'
import { toggleWishlist } from './actions'
import { useTransition, useState } from 'react'

export function WishlistButton({ bookId, isSavedInitial }: { bookId: string, isSavedInitial: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [isSaved, setIsSaved] = useState(isSavedInitial)

  return (
    <button 
      onClick={() => {
        setIsSaved(!isSaved)
        startTransition(() => { toggleWishlist(bookId) })
      }}
      disabled={isPending}
      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-colors border ${isSaved ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800'}`}
    >
      <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-600 text-red-600' : ''}`} /> 
      {isSaved ? 'Saved' : 'Save'}
    </button>
  )
}