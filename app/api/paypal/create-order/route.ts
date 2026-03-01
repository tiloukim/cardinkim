import { NextResponse } from 'next/server'
import { createPayPalOrder } from '@/lib/paypal'

export async function POST(req: Request) {
  try {
    const { amount } = await req.json()

    if (!amount) {
      return NextResponse.json({ error: 'Amount required' }, { status: 400 })
    }

    const order = await createPayPalOrder(parseFloat(amount).toFixed(2))

    if (order.id) {
      return NextResponse.json({ id: order.id })
    }

    return NextResponse.json({ error: 'Failed to create PayPal order' }, { status: 500 })
  } catch (err) {
    console.error('PayPal create order error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
