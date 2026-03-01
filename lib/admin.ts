import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const svc = createServiceClient()
    const { data } = await svc
      .from('ck_customers')
      .select('is_admin')
      .eq('auth_id', user.id)
      .maybeSingle()

    return data?.is_admin === true
  } catch {
    return false
  }
}
