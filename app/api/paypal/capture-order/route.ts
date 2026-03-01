import { NextResponse } from 'next/server'
import { capturePayPalOrder } from '@/lib/paypal'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { paypalOrderId, cart, shipping, promo, totals } = await req.json()

    // Capture payment with PayPal
    const capture = await capturePayPalOrder(paypalOrderId)

    if (capture.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    const captureId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id

    const supabase = createServiceClient()

    // Upsert customer
    const { data: customer } = await supabase
      .from('ck_customers')
      .upsert(
        {
          email: shipping.email,
          name: shipping.name,
          address: shipping.address,
          city: shipping.city,
          state: shipping.state,
          zip: shipping.zip,
        },
        { onConflict: 'email' }
      )
      .select()
      .single()

    // Create order
    const { data: order, error: orderErr } = await supabase
      .from('ck_orders')
      .insert({
        customer_id: customer?.id,
        paypal_order_id: paypalOrderId,
        paypal_capture_id: captureId,
        status: 'paid',
        subtotal: totals.subtotal,
        discount: totals.discount,
        shipping: totals.shipping,
        total: totals.total,
        promo_code: promo || null,
        shipping_name: shipping.name,
        shipping_email: shipping.email,
        shipping_address: shipping.address,
        shipping_city: shipping.city,
        shipping_state: shipping.state,
        shipping_zip: shipping.zip,
      })
      .select()
      .single()

    if (orderErr || !order) {
      console.error('Order create error:', orderErr)
      return NextResponse.json({ error: 'Failed to save order' }, { status: 500 })
    }

    // Create order items
    const items = cart.map((item: { id: string; title: string; price: number; color: string; size: string; qty: number; img: string }) => ({
      order_id: order.id,
      product_id: item.id,
      title: item.title,
      price: item.price,
      color: item.color,
      size: item.size,
      quantity: item.qty,
      image_url: item.img,
    }))

    await supabase.from('ck_order_items').insert(items)

    // Decrement stock
    for (const item of cart) {
      await supabase.rpc('ck_decrement_stock', {
        p_id: item.id,
        qty: item.qty,
      })
    }

    // Create notification
    await supabase.from('ck_notifications').insert({
      type: 'new_order',
      title: 'New Order!',
      message: `$${totals.total.toFixed(2)} from ${shipping.name}`,
      order_id: order.id,
    })

    return NextResponse.json({ success: true, orderId: order.id })
  } catch (err) {
    console.error('PayPal capture error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
