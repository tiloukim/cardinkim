import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'

export async function GET(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const unread = searchParams.get('unread')

  const supabase = createServiceClient()
  let query = supabase
    .from('ck_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (unread === 'true') {
    query = query.eq('is_read', false)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { ids } = await req.json()
  const supabase = createServiceClient()

  const { error } = await supabase
    .from('ck_notifications')
    .update({ is_read: true })
    .in('id', ids)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
