import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import ManajemenBuku from './pages/ManajemenBuku'
import DataPeminjaman from './pages/DataPeminjaman'
import ManajemenAnggota from './pages/ManajemenAnggota'
import Profil from './pages/Profil'
import Laporan from './pages/Laporan'
import Pengaturan from './pages/Pengaturan'
import Login from './pages/Login'
import Register from './pages/Register'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminShell />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/buku" element={<ManajemenBuku />} />
            <Route path="/peminjaman" element={<DataPeminjaman />} />
            <Route path="/peminjaman/berakhir-otomatis" element={<DataPeminjaman overdueOnly />} />
            <Route path="/anggota" element={<ManajemenAnggota />} />
            <Route path="/profil" element={<Profil />} />
            <Route path="/laporan" element={<Laporan />} />
            <Route path="/pengaturan" element={<Pengaturan />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function AdminShell() {
  return <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 print:block print:h-auto"><Sidebar /><Outlet /></div>
}
