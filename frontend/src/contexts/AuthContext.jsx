import { createContext, useContext, useEffect, useState } from 'react'
import { api, setAuthToken, getAuthToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getAuthToken()
    if (token) {
      api
        .get('/api/auth/me')
        .then((data) => setUser(data.user))
        .catch(() => {
          setAuthToken(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const data = await api.post('/api/auth/login', { email, password })
    setAuthToken(data.token)
    setUser(data.user)
    return data.user
  }

  const register = async (userData) => {
    const data = await api.post('/api/auth/register', userData)
    setAuthToken(data.token)
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    setAuthToken(null)
    setUser(null)
  }

  const updateUser = async (updates) => {
    const data = await api.patch('/api/auth/me', updates)
    setUser(data.user)
    return data.user
  }

  const isAuthenticated = !!user
  const isCustomer = user?.role === 'customer'
  const isDealer = user?.role === 'dealer'
  const isFinancialInstitution = user?.role === 'financial_institution'

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated,
        isCustomer,
        isDealer,
        isFinancialInstitution,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
