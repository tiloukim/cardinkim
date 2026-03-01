'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef, type ReactNode } from 'react'
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
  const supabase = useMemo(() => createClient(), [])
  const initialized = useRef(false)

  const fetchCustomer = useCallback(async () => {
    try {
      const res = await fetch('/api/me')
      if (res.ok) {
        const data = await res.json()
        setCustomer(data ?? null)
      }
    } catch { /* ignore */ }
  }, [])

  const refreshCustomer = useCallback(async () => {
    if (user) await fetchCustomer()
  }, [user, fetchCustomer])

  useEffect(() => {
    // onAuthStateChange fires INITIAL_SESSION immediately — no separate init needed
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        await fetchCustomer()
      } else {
        setCustomer(null)
      }
      if (!initialized.current) {
        initialized.current = true
        setLoading(false)
      }
    })

    // Safety timeout — never stay loading forever
    const timeout = setTimeout(() => {
      if (!initialized.current) {
        initialized.current = true
        setLoading(false)
      }
    }, 3000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [supabase, fetchCustomer])

  const signOut = useCallback(async () => {
    setUser(null)
    setCustomer(null)
    try {
      await Promise.race([
        supabase.auth.signOut(),
        new Promise(resolve => setTimeout(resolve, 2000)),
      ])
    } catch { /* ignore */ }
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
