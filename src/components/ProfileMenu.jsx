import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconUserCircle, IconGear, IconLogOut } from '../icons/Icons'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProfileMenu({ trigger, triggerClassName = '', direction = 'down', align = 'right' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const { logout } = useAuth()

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  function goTo(path) {
    setOpen(false)
    navigate(path)
  }

  function handleLogout() {
    setOpen(false)
    if (window.confirm('Yakin ingin keluar dari sistem?')) {
      logout()
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2.5 rounded-lg transition-colors ${triggerClassName}`}
      >
        {trigger}
      </button>

      {open && (
        <div
          className={`absolute z-30 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg ${
            direction === 'up' ? 'bottom-[calc(100%+8px)]' : 'top-[calc(100%+8px)]'
          } ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          <button
            type="button"
            onClick={() => goTo('/profil')}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[12.8px] text-slate-700 hover:bg-slate-50"
          >
            <IconUserCircle className="h-4 w-4 text-slate-400" />
            Profil Saya
          </button>
          <button
            type="button"
            onClick={() => goTo('/pengaturan')}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[12.8px] text-slate-700 hover:bg-slate-50"
          >
            <IconGear className="h-4 w-4 text-slate-400" />
            Pengaturan Sistem
          </button>
          <div className="my-1.5 border-t border-slate-100" />
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[12.8px] text-rose-600 hover:bg-rose-50"
          >
            <IconLogOut className="h-4 w-4 text-rose-500" />
            Keluar
          </button>
        </div>
      )}
    </div>
  )
}
