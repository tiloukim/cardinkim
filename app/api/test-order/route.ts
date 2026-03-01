import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Temporary test endpoint — bypasses PayPal to test DB operations
export async function POST(req: Request) {
  try {
    const { cart, shipping, totals } = await req.json()
    const supabase = createServiceClient()

    // Find or create customer
    let customer: { id: string } | null = null
    const { data: existing, error: findErr } = await supabase
      .from('ck_customers')
      .select('id')
      .eq('email', shipping.email)
      .single()

    if (existing) {
      customer = existing
    } else {
      const { data: newCust, error: createErr } = await supabase
        .from('ck_customers')
        .insert({ email: shipping.email, name: shipping.name })
        .select('id')
        .single()
      if (createErr) return NextResponse.json({ error: 'Customer create failed', detail: createErr.message }, { status: 500 })
      customer = newCust
    }

    // Create order
    const { data: order, error: orderErr } = await supabase
      .from('ck_orders')
      .insert({
        customer_id: customer?.id,
        paypal_order_id: 'TEST-' + Date.now(),
        status: 'paid',
        subtotal: totals.subtotal,
        discount: totals.discount || 0,
        shipping: totals.shipping || 0,
        total: totals.total,
        shipping_name: shipping.name,
        shipping_email: shipping.email,
      })
      .select()
      .single()

    if (orderErr || !order) {
      return NextResponse.json({ error: 'Order create failed', detail: orderErr?.message }, { status: 500 })
    }

    // Create order items
    if (cart?.length > 0) {
      const items = cart.map((item: { id: string; title: string; price: number; color: string; size: string; qty: number; img: string }) => ({
        order_id: order.id,
        product_id: item.id,
        title: item.title,
        price: item.price,
        color: item.color || '',
        size: item.size || '',
        quantity: item.qty || 1,
        image_url: item.img || '',
      }))

      const { error: itemsErr } = await supabase.from('ck_order_items').insert(items)
      if (itemsErr) {
        return NextResponse.json({ error: 'Items insert failed', detail: itemsErr.message, orderId: order.id }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, orderId: order.id, customerId: customer?.id })
  } catch (err) {
    return NextResponse.json({ error: 'Unhandled error', detail: String(err) }, { status: 500 })
  }
}
