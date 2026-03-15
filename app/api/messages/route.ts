import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'

// GET messages - admin sees all conversations, customer sees their own
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const svc = createServiceClient()
  const admin = await isAdmin()
  const customerId = req.nextUrl.searchParams.get('customer_id')

  if (admin) {
    if (customerId) {
      // Admin viewing a specific conversation
      const { data } = await svc
        .from('ck_messages')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: true })
      return NextResponse.json(data || [])
    }
    // Admin viewing all conversations (grouped by customer, latest message)
    const { data } = await svc
      .from('ck_messages')
      .select('*, customer:ck_customers!customer_id(id, name, email)')
      .order('created_at', { ascending: false })

    // Group by customer, keep latest message + unread count
    const convMap = new Map<string, { customer: { id: string; name: string; email: string }; lastMessage: string; lastAt: string; unread: number }>()
    for (const msg of data || []) {
      const cid = msg.customer_id
      if (!convMap.has(cid)) {
        convMap.set(cid, {
          customer: msg.customer,
          lastMessage: msg.content,
          lastAt: msg.created_at,
          unread: 0,
        })
      }
      if (!msg.is_read && msg.sender_role === 'customer') {
        const conv = convMap.get(cid)!
        conv.unread++
      }
    }
    return NextResponse.json(Array.from(convMap.entries()).map(([id, conv]) => ({ id, ...conv })))
  }

  // Customer viewing their own messages
  const { data: cust } = await svc
    .from('ck_customers')
    .select('id')
    .eq('auth_id', user.id)
    .maybeSingle()

  if (!cust) return NextResponse.json([])

  const { data } = await svc
    .from('ck_messages')
    .select('*')
    .eq('customer_id', cust.id)
    .order('created_at', { ascending: true })

  return NextResponse.json(data || [])
}

// POST - send a message
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content, customer_id } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 })

  const svc = createServiceClient()
  const admin = await isAdmin()

  if (admin) {
    // Admin sending to a customer
    if (!customer_id) return NextResponse.json({ error: 'customer_id required' }, { status: 400 })
    const { data, error } = await svc
      .from('ck_messages')
      .insert({ customer_id, sender_role: 'admin', content: content.trim() })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  // Customer sending
  const { data: cust } = await svc
    .from('ck_customers')
    .select('id')
    .eq('auth_id', user.id)
    .maybeSingle()

  if (!cust) return NextResponse.json({ error: 'Customer not found' }, { status: 404 })

  const { data, error } = await svc
    .from('ck_messages')
    .insert({ customer_id: cust.id, sender_role: 'customer', content: content.trim() })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// PATCH - mark messages as read
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { customer_id } = await req.json()
  const svc = createServiceClient()
  const admin = await isAdmin()

  // Admin marks customer messages as read, customer marks admin messages as read
  const senderRole = admin ? 'customer' : 'admin'

  let targetCustomerId = customer_id
  if (!admin) {
    const { data: cust } = await svc
      .from('ck_customers')
      .select('id')
      .eq('auth_id', user.id)
      .maybeSingle()
    targetCustomerId = cust?.id
  }

  if (!targetCustomerId) return NextResponse.json({ error: 'Invalid' }, { status: 400 })

  await svc
    .from('ck_messages')
    .update({ is_read: true })
    .eq('customer_id', targetCustomerId)
    .eq('sender_role', senderRole)
    .eq('is_read', false)

  return NextResponse.json({ success: true })
}
