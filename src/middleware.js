import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const isDev = process.env.NODE_ENV === 'development'

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

function buildCsp(nonce) {
  return [
    "default-src 'self'",
    [
      "script-src 'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      // Fallbacks ignored by browsers that support nonces, but needed for older ones
      "'unsafe-inline'",
      "https:",
      isDev ? "'unsafe-eval'" : '',
    ].filter(Boolean).join(' '),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in https://*.vercel.app https://*.inargy.co https://*.inargy.tech",
    "font-src 'self' data:",
    [
      "connect-src 'self'",
      'https://*.supabase.co https://*.supabase.in wss://*.supabase.co',
      'https://api.paystack.co',
      'https://*.vercel.app https://*.inargy.co https://*.inargy.tech',
      isDev ? 'ws://localhost:*' : '',
    ].filter(Boolean).join(' '),
    "frame-src https://js.paystack.co https://checkout.paystack.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    isDev ? '' : 'upgrade-insecure-requests',
  ].filter(Boolean).join('; ')
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

  // Generate a fresh nonce per request for strict CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const cspHeaderValue = buildCsp(nonce)

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', cspHeaderValue)

  // Refresh the Supabase auth session so cookies stay fresh across navigations
  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  })
  supabaseResponse.headers.set('Content-Security-Policy', cspHeaderValue)

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
          supabaseResponse = NextResponse.next({
            request: { headers: requestHeaders },
          })
          supabaseResponse.headers.set('Content-Security-Policy', cspHeaderValue)
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
