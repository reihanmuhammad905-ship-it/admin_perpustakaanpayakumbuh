import { NavLink } from 'react-router-dom'
import ProfileMenu from './ProfileMenu'
import {
  IconGrid,
  IconBook,
  IconExchange,
  IconUsers,
  IconBarChart,
  IconGear,
} from '../icons/Icons'

const NAV_ITEMS = [
  { to: '/', end: true, label: 'Dashboard', icon: IconGrid },
  { to: '/buku', label: 'Manajemen Buku', icon: IconBook },
  { to: '/peminjaman', label: 'Data Peminjaman', icon: IconExchange },
  { to: '/anggota', label: 'Manajemen Anggota', icon: IconUsers },
  { to: '/laporan', label: 'Laporan & Analitik', icon: IconBarChart },
  { to: '/pengaturan', label: 'Pengaturan Sistem', icon: IconGear },
]

export default function Sidebar() {
  return (
    <aside className="flex h-full w-[272px] shrink-0 flex-col border-r border-slate-800 bg-slate-900 print:hidden">
      <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-[22px]">
        <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-emerald-600 to-teal-700">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 21V9l8-5 8 5v12" />
            <path d="M9 21V13h6v8" />
          </svg>
        </div>
        <div className="min-w-0 leading-tight">
          <div className="whitespace-nowrap font-sans text-[14.5px] font-bold text-slate-50">Perpustakaan</div>
          <div className="whitespace-nowrap font-sans text-[14.5px] font-bold text-slate-50">Payakumbuh</div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-[13.5px] transition-colors ${
                  isActive
                    ? 'bg-emerald-500/15 font-bold text-emerald-300'
                    : 'font-medium text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`
              }
            >
              <Icon className="h-[19px] w-[19px] shrink-0" />
              <span className="whitespace-nowrap">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-slate-800 px-3 py-3.5">
        <ProfileMenu
          direction="up"
          align="left"
          triggerClassName="w-full px-3 py-1 hover:bg-slate-800/60"
          trigger={
            <>
              <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-slate-800 text-[12.5px] font-bold text-emerald-300">
                AD
              </div>
              <div className="min-w-0 text-left">
                <div className="truncate text-[13px] font-semibold text-slate-200">Admin Perpus</div>
                <div className="whitespace-nowrap text-[11.5px] text-slate-500">Administrator</div>
              </div>
            </>
          }
        />
      </div>
    </aside>
  )
}
