'use client'
import { ShieldAlert } from 'lucide-react'
import { reportListing } from './actions'
import { useTransition } from 'react'

export function ReportButton({ bookId }: { bookId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button 
      onClick={() => {
        const reason = prompt('Please enter the reason for reporting this listing (e.g. fake, spam, inappropriate):')
        if (reason) startTransition(() => { reportListing(bookId, reason).then(res => alert(res.message)) })
      }}
      disabled={isPending}
      className="mt-4 text-xs text-red-500 flex items-center justify-center gap-1 w-full hover:underline disabled:opacity-50"
    >
      <ShieldAlert className="w-3 h-3" /> {isPending ? 'Reporting...' : 'Report this listing'}
    </button>
  )
}