import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

// Create a Supabase client that uses the user's JWT for RLS
async function getUserSupabase() {
  const headersList = await headers()
  const authHeader = headersList.get('authorization')

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: { Authorization: authHeader || '' },
      },
    }
  )
}

export async function POST(request) {
  const supabase = await getUserSupabase()

  // Get the current user
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser()

  if (authErr || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { userId, subject, body: msgBody, parentId } = body

  if (typeof msgBody !== 'string' || !msgBody.trim()) {
    return Response.json({ error: 'Message body is required' }, { status: 400 })
  }

  if (msgBody.trim().length > 5000) {
    return Response.json({ error: 'Message body must be 5000 characters or fewer' }, { status: 400 })
  }

  if (subject && (typeof subject !== 'string' || subject.length > 200)) {
    return Response.json({ error: 'Subject must be a string under 200 characters' }, { status: 400 })
  }

  if (userId && typeof userId !== 'string') {
    return Response.json({ error: 'Invalid userId' }, { status: 400 })
  }

  if (parentId && typeof parentId !== 'string') {
    return Response.json({ error: 'Invalid parentId' }, { status: 400 })
  }

  if (parentId) {
    const { data: parentMsg } = await supabase
      .from('messages')
      .select('user_id')
      .eq('id', parentId)
      .single()

    if (!parentMsg) {
      return Response.json({ error: 'Parent message not found' }, { status: 400 })
    }

    if (parentMsg.user_id !== user.id) {
      const { data: callerProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      if (callerProfile?.role !== 'admin') {
        return Response.json({ error: 'Cannot reply to this thread' }, { status: 403 })
      }
    }
  }

  // Determine from_admin based on the user's ACTUAL role in the database
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  // If admin is replying, use the target userId; otherwise use their own id
  const targetUserId = isAdmin ? (userId || user.id) : user.id

  const { data, error } = await supabase
    .from('messages')
    .insert([
      {
        user_id: targetUserId,
        subject: subject || 'General Enquiry',
        body: msgBody.trim(),
        from_admin: isAdmin,
        parent_id: parentId || null,
      },
    ])
    .select()
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }

  return Response.json({ data })
}
