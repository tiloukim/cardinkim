import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'

export async function GET(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Total revenue
  const { data: orders } = await supabase
    .from('ck_orders')
    .select('total, status, created_at')

  const totalRevenue = orders?.reduce((s, o) => s + o.total, 0) || 0
  const totalOrders = orders?.length || 0
  const paidOrders = orders?.filter(o => o.status === 'paid').length || 0
  const processingOrders = orders?.filter(o => o.status === 'processing').length || 0
  const shippedOrders = orders?.filter(o => o.status === 'shipped').length || 0
  const deliveredOrders = orders?.filter(o => o.status === 'delivered').length || 0

  // Today's revenue
  const today = new Date().toISOString().split('T')[0]
  const todayRevenue = orders
    ?.filter(o => o.created_at.startsWith(today))
    .reduce((s, o) => s + o.total, 0) || 0

  // Customer count
  const { count: customerCount } = await supabase
    .from('ck_customers')
    .select('*', { count: 'exact', head: true })

  // Product count
  const { count: productCount } = await supabase
    .from('ck_products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  // Recent orders
  const { data: recentOrders } = await supabase
    .from('ck_orders')
    .select('*, ck_customers(name, email)')
    .order('created_at', { ascending: false })
    .limit(5)

  return NextResponse.json({
    totalRevenue,
    todayRevenue,
    totalOrders,
    paidOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    customerCount: customerCount || 0,
    productCount: productCount || 0,
    recentOrders: recentOrders || [],
  })
}
