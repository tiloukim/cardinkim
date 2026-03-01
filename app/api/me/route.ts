import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(null)
  }

  const svc = createServiceClient()
  const { data } = await svc
    .from('ck_customers')
    .select('*')
    .eq('auth_id', user.id)
    .maybeSingle()

  return NextResponse.json(data)
}
