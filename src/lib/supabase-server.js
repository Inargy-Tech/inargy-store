import { createClient } from '@supabase/supabase-js'
import { cache } from 'react'

export const createServerSupabase = cache(function createServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Supabase credentials are required in production')
    }
  }

  return createClient(
    url || 'https://placeholder.supabase.co',
    key || 'placeholder-key'
  )
})
