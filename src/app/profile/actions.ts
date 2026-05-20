'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(prevState: any, formData: FormData) {
  const fullName = formData.get('full_name') as string
  const phoneNumber = formData.get('phone_number') as string
  const collegeName = formData.get('college_name') as string
  const location = formData.get('location') as string

  if (!fullName) {
    return { error: 'Full name is required' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      phone_number: phoneNumber,
      college_name: collegeName,
      location: location,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/profile')
  return { success: 'Profile updated successfully' }
}
