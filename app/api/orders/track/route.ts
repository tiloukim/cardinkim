import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { orderId, email } = await req.json()

    if (!orderId || !email) {
      return NextResponse.json({ error: 'Order ID and email are required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('ck_orders')
      .select('id, status, subtotal, discount, shipping, total, tracking_number, carrier, shipped_at, delivered_at, shipping_name, shipping_address, shipping_city, shipping_state, shipping_zip, created_at, updated_at, ck_order_items(id, title, price, color, size, quantity, image_url)')
      .eq('id', orderId)
      .eq('shipping_email', email.toLowerCase())
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Order not found. Check your order ID and email.' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
