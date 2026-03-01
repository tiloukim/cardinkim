'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, SupabaseClient } from '@supabase/supabase-js'
import type { Customer } from '@/lib/types'

interface AuthContextType {
  user: User | null
  customer: Customer | null
  loading: boolean
  supabase: SupabaseClient
  signOut: () => Promise<void>
  refreshCustomer: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  // Stable client reference — never recreated
  const supabase = useMemo(() => createClient(), [])

  const fetchCustomer = useCallback(async (authId: string) => {
    try {
      const { data } = await supabase
        .from('ck_customers')
        .select('*')
        .eq('auth_id', authId)
        .single()
      setCustomer(data)
    } catch {
      setCustomer(null)
    }
  }, [supabase])

  const refreshCustomer = useCallback(async () => {
    if (user) await fetchCustomer(user.id)
  }, [user, fetchCustomer])

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        // Use getSession() for fast local check (no network request)
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return
        const u = session?.user ?? null
        setUser(u)
        if (u) await fetchCustomer(u.id)
      } catch {
        if (!mounted) return
        setUser(null)
        setCustomer(null)
      }
      if (mounted) setLoading(false)
    }
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        await fetchCustomer(u.id)
      } else {
        setCustomer(null)
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, fetchCustomer])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setCustomer(null)
  }, [supabase])

  return (
    <AuthContext.Provider value={{ user, customer, loading, supabase, signOut, refreshCustomer }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
