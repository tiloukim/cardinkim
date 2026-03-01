'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Customer } from '@/lib/types'

interface AuthContextType {
  user: User | null
  customer: Customer | null
  loading: boolean
  signOut: () => Promise<void>
  refreshCustomer: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  customer: null,
  loading: true,
  signOut: async () => {},
  refreshCustomer: async () => {},
})

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
    const getSession = async () => {
      try {
        const { data: { user: u } } = await supabase.auth.getUser()
        setUser(u)
        if (u) await fetchCustomer(u.id)
      } catch {
        setUser(null)
        setCustomer(null)
      }
      setLoading(false)
    }
    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        await fetchCustomer(u.id)
      } else {
        setCustomer(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase, fetchCustomer])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setCustomer(null)
  }, [supabase])

  return (
    <AuthContext.Provider value={{ user, customer, loading, signOut, refreshCustomer }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
