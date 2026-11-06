import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export function ProtectedRoute() {
  const { isAuthenticated, ready } = useAuth()
  const location = useLocation()
  if (!ready) return <div className="flex h-screen items-center justify-center bg-slate-50 text-[13px] text-slate-400">Memuat sesi...</div>
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />
}

export function PublicOnlyRoute() {
  const { isAuthenticated, ready } = useAuth()
  if (!ready) return <div className="flex h-screen items-center justify-center bg-slate-50 text-[13px] text-slate-400">Memuat sesi...</div>
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />
}
