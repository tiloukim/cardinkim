import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/account'

  if (code) {
    const cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[] = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookies) {
            cookiesToSet.push(...cookies)
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)

    // Create/update ck_customers row with signup metadata
    if (session?.user) {
      const user = session.user
      const meta = user.user_metadata || {}
      const serviceClient = createServiceClient()

      const { data: existing } = await serviceClient
        .from('ck_customers')
        .select('id')
        .eq('email', user.email!)
        .single()

      if (existing) {
        await serviceClient
          .from('ck_customers')
          .update({
            auth_id: user.id,
            name: meta.name || undefined,
            phone: meta.phone || undefined,
            address: meta.address || undefined,
            city: meta.city || undefined,
            state: meta.state || undefined,
            zip: meta.zip || undefined,
          })
          .eq('id', existing.id)
      } else {
        await serviceClient
          .from('ck_customers')
          .insert({
            auth_id: user.id,
            email: user.email!,
            name: meta.name || '',
            phone: meta.phone || null,
            address: meta.address || null,
            city: meta.city || null,
            state: meta.state || null,
            zip: meta.zip || null,
          })
      }
    }

    const response = NextResponse.redirect(new URL(next, origin))
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options)
    })
    return response
  }

  return NextResponse.redirect(new URL(next, origin))
}
