import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const prefix = (formData.get('prefix') as string) || 'products'
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const supabase = createServiceClient()
  const { error } = await supabase.storage
    .from('images')
    .upload(path, file, { contentType: file.type, upsert: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: urlData } = supabase.storage.from('images').getPublicUrl(path)

  return NextResponse.json({ url: urlData.publicUrl })
}
