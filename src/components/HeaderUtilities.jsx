import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconSearch, IconBell, IconClock } from '../icons/Icons'
import ProfileMenu from './ProfileMenu'

const NOTIFICATIONS = [
  { id: 1, title: 'Peminjaman "Sistem Informasi Manajemen" berakhir otomatis', time: '12 menit lalu' },
  { id: 2, title: 'Anggota baru terdaftar: Fajar Ramadhan', time: '48 menit lalu' },
  { id: 3, title: 'Stok fisik "Adat Basandi Syarak, Syarak Basandi Kitabullah" habis', time: 'Kemarin, 16:20' },
  { id: 4, title: 'Denda anggota Bagus Setiawan bertambah menjadi Rp45.000', time: '3 jam lalu' },
]

export default function HeaderUtilities({ hasAlerts = true }) {
  const [search, setSearch] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifSeen, setNotifSeen] = useState(false)
  const notifRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!notifOpen) return
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setNotifOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [notifOpen])

  function toggleNotif() {
    setNotifOpen((v) => !v)
    setNotifSeen(true)
  }

  function handleSearchKeyDown(e) {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/buku?q=${encodeURIComponent(search.trim())}`)
    }
  }

  return (
    <div className="flex items-center gap-3.5 print:hidden">
      <div className="flex w-[220px] items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-3 py-2.5">
        <IconSearch className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Cari anggota, buku..."
          className="w-full border-none bg-transparent text-[13px] text-slate-800 outline-none placeholder:text-slate-400"
        />
      </div>

      <div className="relative" ref={notifRef}>
        <button
          type="button"
          onClick={toggleNotif}
          className="relative flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-slate-200 bg-white hover:bg-slate-50"
        >
          <IconBell className="h-[18px] w-[18px] text-slate-600" />
          {hasAlerts && !notifSeen && (
            <span className="absolute right-2 top-[7px] h-2 w-2 rounded-full border-[1.5px] border-white bg-rose-600" />
          )}
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-[320px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            <div className="border-b border-slate-100 px-4 py-3">
              <div className="text-[13px] font-bold text-slate-900">Notifikasi</div>
            </div>
            <div className="max-h-[320px] overflow-y-auto px-4">
              {NOTIFICATIONS.map((n) => (
                <div key={n.id} className="flex items-start gap-2.5 border-b border-slate-100 py-3 last:border-b-0">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] leading-snug text-slate-700">{n.title}</p>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                      <IconClock className="h-3 w-3" />
                      {n.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="h-[26px] w-px bg-slate-200" />

      <ProfileMenu
        triggerClassName="px-1.5 py-1 -mx-1.5 hover:bg-slate-50"
        trigger={
          <>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-[12.5px] font-bold text-emerald-700">
              AD
            </div>
            <div className="text-left">
              <div className="text-[12.5px] font-semibold text-slate-900">Admin Perpus</div>
              <div className="text-[11px] text-slate-400">Super Admin</div>
            </div>
          </>
        }
      />
    </div>
  )
}
