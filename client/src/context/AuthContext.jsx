import { createContext, useState, useEffect } from 'react'
import axios from 'axios'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async (silent = false) => {
    try {
      const res = await axios.get('/api/auth/me')
      setUser(res.data)
      // Only set loading to false on initial load, not on silent refreshes
      if (!silent) {
        setLoading(false)
      }
    } catch (error) {
      // Only clear token on non-silent fetches (initial load or explicit refresh)
      if (!silent) {
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']
        setLoading(false)
      }
    }
  }

  // Setup polling when user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    fetchUser(false) // Initial load, not silent
    
    // Auto-refresh user data every 3 seconds for real-time updates (silent)
    // This ensures any admin changes are reflected immediately without user notification
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem('token')
      if (currentToken) {
        fetchUser(true) // Silent refresh, no loading state change, no notifications
      }
    }, 3000) // Refresh every 3 seconds
    
    return () => clearInterval(interval)
  }, []) // Only run once on mount

  // Restart polling when user logs in/out
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token && !user) {
      // User just logged in, fetch user data
      fetchUser(false)
    }
  }, [user])

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password })
    localStorage.setItem('token', res.data.token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
    // Fetch full user data to ensure all fields are included
    await fetchUser()
    // Return user data with role for navigation (role is already in res.data)
    return res.data
  }

  const register = async (name, email, password, phone, referralCode) => {
    const res = await axios.post('/api/auth/register', {
      name,
      email,
      password,
      phone,
      referralCode
    })
    localStorage.setItem('token', res.data.token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
    // Fetch full user data to ensure all fields are included
    await fetchUser()
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

