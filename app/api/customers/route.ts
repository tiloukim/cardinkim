import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'

export async function GET() {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Fetch all customers
  const { data: customers, error } = await supabase
    .from('ck_customers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Fetch order stats per customer
  const { data: orders } = await supabase
    .from('ck_orders')
    .select('customer_id, total')

  const orderStats = new Map<string, { count: number; total: number }>()
  for (const o of orders || []) {
    const s = orderStats.get(o.customer_id) || { count: 0, total: 0 }
    s.count += 1
    s.total += o.total
    orderStats.set(o.customer_id, s)
  }

  const result = (customers || []).map(c => ({
    ...c,
    order_count: orderStats.get(c.id)?.count || 0,
    total_spent: orderStats.get(c.id)?.total || 0,
  }))

  return NextResponse.json(result)
}
