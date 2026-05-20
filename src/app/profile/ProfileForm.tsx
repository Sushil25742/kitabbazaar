'use client'

import { useActionState } from 'react'
import { updateProfile } from './actions'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default function ProfileForm({ profile }: { profile: any }) {
  const [state, formAction, isPending] = useActionState(updateProfile, null)

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{state.error}</span>
        </div>
      )}
      {state?.success && (
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4" />
          <span>{state.success}</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input 
          type="text" 
          name="full_name"
          defaultValue={profile?.full_name}
          className="w-full rounded-xl border-0 py-3 px-4 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-950 dark:ring-zinc-700 focus:ring-2 focus:ring-emerald-500" 
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Phone Number</label>
        <input 
          type="text" 
          name="phone_number"
          defaultValue={profile?.phone_number || ''}
          placeholder="+977 "
          className="w-full rounded-xl border-0 py-3 px-4 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-950 dark:ring-zinc-700 focus:ring-2 focus:ring-emerald-500" 
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">College/School Name</label>
        <input 
          type="text" 
          name="college_name"
          defaultValue={profile?.college_name || ''}
          placeholder="e.g. Pulchowk Campus"
          className="w-full rounded-xl border-0 py-3 px-4 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-950 dark:ring-zinc-700 focus:ring-2 focus:ring-emerald-500" 
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Location</label>
        <input 
          type="text" 
          name="location"
          defaultValue={profile?.location || ''}
          placeholder="e.g. Kathmandu"
          className="w-full rounded-xl border-0 py-3 px-4 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-950 dark:ring-zinc-700 focus:ring-2 focus:ring-emerald-500" 
        />
      </div>

      <div className="pt-4">
        <button 
          type="submit" 
          disabled={isPending}
          className="rounded-full bg-emerald-600 px-6 py-2.5 font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-70"
        >
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
