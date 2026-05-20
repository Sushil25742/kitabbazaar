'use client'
import { CheckCircle2, XCircle, Trash2, ShieldCheck, X } from 'lucide-react'
import { verifyPayment, approveBook, rejectBook, cancelOrder, resolveReport, deleteBook } from './actions'
import { useTransition } from 'react'

export function VerifyPaymentButton({ paymentId, orderId }: { paymentId: string, orderId: string }) {
  const [isPending, startTransition] = useTransition()
  return (
    <button onClick={() => { if(confirm('Verify this payment?')) startTransition(() => { verifyPayment(paymentId, orderId) }) }} disabled={isPending} className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-full hover:bg-emerald-700 transition-colors disabled:opacity-50">
      {isPending ? 'Verifying...' : 'Verify'}
    </button>
  )
}

export function ApproveBookButton({ bookId }: { bookId: string }) {
  const [isPending, startTransition] = useTransition()
  return (
    <button onClick={() => startTransition(() => { approveBook(bookId) })} disabled={isPending} className="text-emerald-600 hover:text-emerald-700 disabled:opacity-50" title="Approve">
      <CheckCircle2 className="w-5 h-5" />
    </button>
  )
}

export function RejectBookButton({ bookId }: { bookId: string }) {
  const [isPending, startTransition] = useTransition()
  return (
    <button onClick={() => { if(confirm('Reject this listing?')) startTransition(() => { rejectBook(bookId) }) }} disabled={isPending} className="text-amber-600 hover:text-amber-700 disabled:opacity-50" title="Reject">
      <XCircle className="w-5 h-5" />
    </button>
  )
}

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition()
  return (
    <button onClick={() => { if(confirm('Cancel this order?')) startTransition(() => { cancelOrder(orderId) }) }} disabled={isPending} className="text-xs text-red-600 hover:underline">
      {isPending ? 'Cancelling...' : 'Cancel Order'}
    </button>
  )
}

export function ResolveReportButton({ reportId }: { reportId: string }) {
  const [isPending, startTransition] = useTransition()
  return (
    <button onClick={() => startTransition(() => { resolveReport(reportId) })} disabled={isPending} className="text-xs bg-zinc-200 text-zinc-700 px-2 py-1 rounded hover:bg-zinc-300">
      Dismiss
    </button>
  )
}

export function DeleteBookButton({ bookId }: { bookId: string }) {
  const [isPending, startTransition] = useTransition()
  return (
    <button onClick={() => { if(confirm('DELETE this reported listing entirely?')) startTransition(() => { deleteBook(bookId) }) }} disabled={isPending} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200">
      <Trash2 className="w-3 h-3 inline mr-1" /> Delete Listing
    </button>
  )
}