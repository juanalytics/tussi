
"use client"

import React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { fetchUserProfile } from "@/services/auth"


const AuthContext = createContext<any>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const profile = await fetchUserProfile()
        setUser(profile)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
