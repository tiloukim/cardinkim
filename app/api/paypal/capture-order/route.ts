import { NextResponse } from 'next/server'
import { capturePayPalOrder } from '@/lib/paypal'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { paypalOrderId, cart, shipping, promo, totals } = await req.json()
    console.log('[capture] Start:', { paypalOrderId, email: shipping?.email, cartLen: cart?.length, total: totals?.total })

    // Capture payment with PayPal
    const capture = await capturePayPalOrder(paypalOrderId)
    console.log('[capture] PayPal response:', JSON.stringify(capture).slice(0, 500))

    if (capture.status !== 'COMPLETED') {
      console.log('[capture] PayPal status not COMPLETED:', capture.status)
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    const captureId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id

    const supabase = createServiceClient()

    // Find or create customer (preserves auth_id for logged-in users)
    let customer: { id: string } | null = null
    const { data: existing, error: findErr } = await supabase
      .from('ck_customers')
      .select('id')
      .eq('email', shipping.email)
      .single()
    console.log('[capture] Customer lookup:', { existing, findErr: findErr?.message })

    if (existing) {
      // Update shipping info on existing customer
      await supabase
        .from('ck_customers')
        .update({
          name: shipping.name,
          address: shipping.address,
          city: shipping.city,
          state: shipping.state,
          zip: shipping.zip,
        })
        .eq('id', existing.id)
      customer = existing
    } else {
      // Create new guest customer
      const { data: newCust, error: createErr } = await supabase
        .from('ck_customers')
        .insert({
          email: shipping.email,
          name: shipping.name,
          address: shipping.address,
          city: shipping.city,
          state: shipping.state,
          zip: shipping.zip,
        })
        .select('id')
        .single()
      console.log('[capture] Customer create:', { newCust, createErr: createErr?.message })
      customer = newCust
    }

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

    console.log('[capture] Order insert:', { orderId: order?.id, orderErr: orderErr?.message })
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

    const { error: itemsErr } = await supabase.from('ck_order_items').insert(items)
    if (itemsErr) console.error('Order items insert error:', itemsErr, 'items:', JSON.stringify(items))

    // Decrement stock
    for (const item of cart) {
      const { error: stockErr } = await supabase.rpc('ck_decrement_stock', {
        p_id: item.id,
        qty: item.qty,
      })
      if (stockErr) console.error('Stock decrement error:', stockErr, 'product:', item.id)
    }

    // Create notification
    await supabase.from('ck_notifications').insert({
      type: 'new_order',
      title: 'New Order!',
      message: `$${totals.total.toFixed(2)} from ${shipping.name}`,
      order_id: order.id,
    })

    console.log('[capture] Success! orderId:', order.id)
    return NextResponse.json({ success: true, orderId: order.id })
  } catch (err) {
    console.error('[capture] Unhandled error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
