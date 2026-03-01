import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'

export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('ck_products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Transform DB rows to match frontend shape
  const products = data.map(p => ({
    ...p,
    colors: p.colors || [{ n: 'Default', h: '#ccc' }],
    sizes: p.sizes || ['One Size'],
  }))

  return NextResponse.json(products)
}

export async function POST(req: Request) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('ck_products')
    .insert({
      title: body.title,
      price: body.price,
      compare_price: body.compare_price || null,
      category: body.category,
      collection: body.collection || 'new',
      colors: body.colors || [{ n: 'As Shown', h: '#ccc' }],
      sizes: body.sizes || ['One Size'],
      image_url: body.image_url,
      description: body.description || '',
      condition: body.condition || 'New',
      badge: body.badge || 'NEW',
      stock: body.stock || 1,
      is_active: true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
