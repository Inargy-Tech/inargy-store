import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

async function getAdminUser() {
  const headersList = await headers()
  const authHeader = headersList.get('authorization')
  const userClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: authHeader || '' } } }
  )
  const { data: { user }, error } = await userClient.auth.getUser()
  if (error || !user) return null
  const { data: profile } = await getServiceSupabase()
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  return profile?.role === 'admin' ? user : null
}

export async function GET() {
  const user = await getAdminUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getServiceSupabase()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, role, created_at')
    .in('role', ['admin', 'operations', 'support'])
    .order('created_at', { ascending: false })

  if (error) return Response.json({ error: 'Failed to fetch team' }, { status: 500 })
  return Response.json({ data })
}

export async function POST(request) {
  const user = await getAdminUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { first_name, last_name, email, phone, role } = body

  if (!first_name?.trim()) return Response.json({ error: 'First name is required' }, { status: 400 })
  if (!last_name?.trim()) return Response.json({ error: 'Last name is required' }, { status: 400 })
  if (!email?.trim()) return Response.json({ error: 'Email is required' }, { status: 400 })
  if (!['operations', 'support'].includes(role)) return Response.json({ error: 'Role must be operations or support' }, { status: 400 })

  const supabase = getServiceSupabase()
  const full_name = `${first_name.trim()} ${last_name.trim()}`

  // Create the auth user (they'll get a magic link / password reset email)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: email.trim(),
    email_confirm: true,
    user_metadata: { full_name },
  })

  if (authError) return Response.json({ error: authError.message }, { status: 500 })

  // Update their profile with name, phone, and role
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ full_name, phone: phone?.trim() || null, role })
    .eq('id', authData.user.id)

  if (profileError) return Response.json({ error: profileError.message }, { status: 500 })

  return Response.json({ data: { id: authData.user.id, full_name, email, phone, role } }, { status: 201 })
}
