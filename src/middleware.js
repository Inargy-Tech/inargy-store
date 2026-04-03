import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// In-memory rate limiter (per IP, per minute).
// NOTE: This only works within a single process. In serverless / multi-instance
// deployments, replace with a shared store (e.g. Redis, Upstash) for real enforcement.
const rateMap = new Map()
const RATE_LIMIT = 30 // requests per window
const RATE_WINDOW = 60_000 // 1 minute

function isRateLimited(ip) {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now - entry.start > RATE_WINDOW) {
    rateMap.set(ip, { start: now, count: 1 })
    return false
  }
  entry.count++
  return entry.count > RATE_LIMIT
}

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Rate-limit and CSRF-protect API routes (checked before the heavier
  // Supabase session refresh so rejected requests stay cheap)
  if (pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // CSRF: reject mutating requests from foreign origins
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      const origin = request.headers.get('origin')
      const host = request.headers.get('host')
      const isWebhook = pathname === '/api/paystack/webhook'

      if (origin && host) {
        let originHost
        try { originHost = new URL(origin).host } catch { originHost = '' }
        if (originHost !== host) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
      } else if (!origin && !isWebhook) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }
  }

  // Refresh the Supabase auth session so cookies stay fresh across navigations
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
