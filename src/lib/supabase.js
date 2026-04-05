import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Supabase credentials missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
  )
}

const isBrowser = typeof window !== 'undefined'

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

// Node.js 25 can expose a broken global localStorage when started with an
// invalid --localstorage-file argument (Next dev currently does this).
// Supabase may probe globalThis.localStorage even on server code paths.
if (!isBrowser && typeof globalThis.localStorage !== 'undefined') {
  try {
    if (typeof globalThis.localStorage.getItem !== 'function') {
      delete globalThis.localStorage
    } else {
      globalThis.localStorage.getItem('__probe__')
    }
  } catch {
    delete globalThis.localStorage
  }
}

function getBrowserStorage() {
  try {
    window.localStorage.getItem('__test__')
    return window.localStorage
  } catch {
    return noopStorage
  }
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: isBrowser ? getBrowserStorage() : noopStorage,
    autoRefreshToken: isBrowser,
    detectSessionInUrl: isBrowser,
  },
})
