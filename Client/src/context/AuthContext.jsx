import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('amudhu_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('amudhu_user')
      }
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('amudhu_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('amudhu_user')
  }

  // Merge partial updates into the stored user (e.g. after activating premium)
  const updateUser = (patch) => {
    setUser(prev => {
      const updated = { ...prev, ...patch }
      localStorage.setItem('amudhu_user', JSON.stringify(updated))
      return updated
    })
  }

  const value = {
    user,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isPremium: !!(user?.attributes?.is_premium),
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
