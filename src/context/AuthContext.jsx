import { useContext, useEffect, useMemo, useState } from 'react'
import { adminLogin, adminRegister } from '../services/adminApi'
import { AuthContext } from './authContext'

const STORAGE_KEY = 'payakumbuh.admin.session'

function readSession() {
  try {
    const session = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null')
    if (!session?.token || isExpired(session.token)) return null
    return session
  } catch {
    return null
  }
}

function isExpired(token) {
  try {
    const payload = JSON.parse(window.atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload.exp ? payload.exp * 1000 <= Date.now() : false
  } catch {
    return false
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readSession())
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
    if (session) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  }, [session])

  function saveSession(next) {
    setSession(next)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  async function login(credentials, remember = true) {
    const result = await adminLogin(credentials)
    if (remember) saveSession({ token: result.token, admin: result.admin || result.user })
    else setSession({ token: result.token, admin: result.admin || result.user })
    return result
  }

  async function register(data, remember = true) {
    const result = await adminRegister(data)
    const nextSession = { token: result.token, admin: result.admin || result.user }
    if (remember) saveSession(nextSession)
    else setSession(nextSession)
    return result
  }
  function logout() { setSession(null); window.localStorage.removeItem(STORAGE_KEY) }

  const value = useMemo(() => ({ session, admin: session?.admin || null, token: session?.token || null, ready, isAuthenticated: Boolean(session), login, register, logout }), [session, ready])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth harus digunakan di dalam AuthProvider.')
  return context
}

export { useAuth }
