import { useEffect, useMemo, useRef, useState } from 'react'
import HeaderUtilities from '../components/HeaderUtilities'
import StatCard from '../components/StatCard'
import Toast from '../components/Toast'
import { MEMBER_CATEGORIES, MEMBER_STATUSES } from '../data/members'
import { memberStatusBadgeClass } from '../utils/badges'
import { useAuth } from '../context/AuthContext.jsx'
import { getAdminMembers, updateMemberStatusApi, getAdminLoans } from '../services/adminApi'
import {
  IconSearch,
  IconChevronDown,
  IconUsers,
  IconCheckCircle,
  IconLock,
  IconClock,
  IconMoreVertical,
  IconEye,
} from '../icons/Icons'

const ALL = 'Semua'

const AVATAR_PALETTE = ['#059669', '#0284c7', '#d97706', '#4f46e5', '#db2777', '#0f766e', '#b91c1c']
function hashColor(key) {
  let hash = 0
  const str = String(key || '')
  for (let i = 0; i < str.length; i += 1) hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length]
}

function formatDisplayDate(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function initials(name) {
  return (name || '-')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export default function ManajemenAnggota() {
  const { token } = useAuth()
  const [members, setMembers] = useState([])
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState(ALL)
  const [filterStatus, setFilterStatus] = useState(ALL)

  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [detailMember, setDetailMember] = useState(null)

  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)

  function showToast(message) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = setTimeout(() => setToast(''), 2800)
  }

  async function loadData() {
    setLoading(true)
    setLoadError('')
    try {
      const [membersResult, loansResult] = await Promise.all([getAdminMembers(token), getAdminLoans(token)])
      setMembers(membersResult.members || [])
      setLoans(loansResult.loans || [])
    } catch (error) {
      setLoadError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase()
    return members.filter((m) => {
      if (q) {
        const hay = `${m.name} ${m.email} ${m.memberCode}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (filterCategory !== ALL && m.category !== filterCategory) return false
      if (filterStatus !== ALL && m.status !== filterStatus) return false
      return true
    })
  }, [members, search, filterCategory, filterStatus])

  const allSelected = filteredMembers.length > 0 && filteredMembers.every((m) => selectedIds.has(m.id))

  function toggleSelectAll() {
    setSelectedIds(allSelected ? new Set() : new Set(filteredMembers.map((m) => m.id)))
  }

  function toggleSelectOne(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function activityFor(member) {
    const memberLoans = loans.filter((loan) => loan.memberId === member.id)
    return {
      activeLoans: memberLoans.filter((loan) => loan.status === 'Dipinjam').length,
      completedLoans: memberLoans.filter((loan) => loan.status !== 'Dipinjam').length,
      loans: memberLoans,
    }
  }

  async function toggleMemberStatus(member) {
    const nextStatus = member.status === 'Diblokir' ? 'Aktif' : 'Diblokir'
    try {
      await updateMemberStatusApi(token, member.id, nextStatus)
      showToast(nextStatus === 'Aktif' ? `Akses "${member.name}" diaktifkan kembali.` : `"${member.name}" diblokir.`)
      await loadData()
    } catch (error) {
      showToast(error.message)
    }
  }

  const totalAktif = members.filter((m) => m.status === 'Aktif').length
  const totalBaru = members.filter((member) => {
    const date = new Date(member.joinDate)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)
    return !Number.isNaN(date.getTime()) && date >= cutoff
  }).length
  const totalDiblokir = members.filter((m) => m.status === 'Diblokir').length
  const recentMembers = [...members].sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate)).slice(0, 3)

  if (loading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center text-[13px] text-slate-400">
        Memuat data anggota...
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-3 text-center">
        <p className="max-w-sm text-[13px] text-slate-500">{loadError}</p>
        <button
          onClick={loadData}
          className="rounded-[9px] bg-emerald-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-emerald-700"
        >
          Coba Lagi
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-[26px] pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="font-sans text-[25px] font-bold text-slate-900">Manajemen Anggota</h1>
          <p className="mt-1.5 text-[13.5px] text-slate-500">
            Pantau dan kelola data anggota, status akses, serta aktivitas keanggotaan secara otomatis.
          </p>
        </div>
        <HeaderUtilities hasAlerts />
      </div>

      {/* Summary cards */}
      <div className="mt-5 grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={IconUsers}
          iconBgClass="bg-emerald-50"
          iconColorClass="text-emerald-700"
          value={members.length.toLocaleString('id-ID')}
          label="Total Anggota"
          sub="Seluruh kategori keanggotaan"
          to="/anggota"
        />
        <StatCard
          icon={IconCheckCircle}
          iconBgClass="bg-sky-50"
          iconColorClass="text-sky-700"
          value={totalAktif.toLocaleString('id-ID')}
          label="Anggota Aktif"
          sub="Dapat meminjam dan mengakses koleksi"
          subColor="text-emerald-600 font-semibold"
          to="/anggota"
        />
        <StatCard
          icon={IconUsers}
          iconBgClass="bg-amber-100"
          iconColorClass="text-amber-700"
          value={totalBaru.toLocaleString('id-ID')}
          label="Anggota Baru"
          sub="Registrasi dalam 30 hari terakhir"
          subColor="text-amber-600 font-semibold"
          to="/anggota"
        />
        <StatCard
          icon={IconLock}
          iconBgClass="bg-rose-50"
          iconColorClass="text-rose-700"
          value={totalDiblokir.toLocaleString('id-ID')}
          label="Anggota Diblokir"
          sub="Akses peminjaman ditangguhkan"
          subColor="text-rose-600 font-semibold"
          to="/anggota"
        />
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900">Anggota Baru</h2>
            <p className="mt-0.5 text-[12px] text-slate-500">Registrasi terbaru yang masuk otomatis dari sistem.</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">{totalBaru} baru</span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {recentMembers.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => setDetailMember(member)}
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-left hover:border-emerald-200 hover:bg-emerald-50/40"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: hashColor(member.name) }}>
                {initials(member.name)}
              </div>
              <div className="min-w-0">
                <div className="truncate text-[12.5px] font-semibold text-slate-800">{member.name}</div>
                <div className="text-[11px] text-slate-400">{member.memberCode} · {formatDisplayDate(member.joinDate)}</div>
              </div>
            </button>
          ))}
          {recentMembers.length === 0 && (
            <div className="text-[12.5px] text-slate-400">Belum ada anggota terdaftar.</div>
          )}
        </div>
      </div>

      {/* Search & filter bar */}
      <div className="mt-5 flex flex-wrap items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-[9px] border border-slate-200 bg-slate-50 px-3 py-2.5">
          <IconSearch className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, email, No. Anggota..."
            className="w-full border-none bg-transparent text-[13px] text-slate-800 outline-none placeholder:text-slate-400"
          />
        </div>

        <FilterSelect
          value={filterCategory}
          onChange={setFilterCategory}
          options={[ALL, ...MEMBER_CATEGORIES]}
          allLabel="Semua Kategori"
        />
        <FilterSelect
          value={filterStatus}
          onChange={setFilterStatus}
          options={[ALL, ...MEMBER_STATUSES]}
          allLabel="Semua Status"
        />
      </div>

      {/* Table */}
      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="w-11 border-y border-slate-100 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
                <Th>Anggota</Th>
                <Th>Kategori</Th>
                <Th>Tanggal Bergabung</Th>
                <Th>Peminjaman Aktif</Th>
                <Th>Jumlah Berakhir</Th>
                <Th>Status</Th>
                <Th align="right">Aksi</Th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/70">
                  <td className="border-b border-slate-100 px-4 py-3.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(member.id)}
                      onChange={() => toggleSelectOne(member.id)}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="border-b border-slate-100 px-3.5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white shadow-sm"
                        style={{ backgroundColor: hashColor(member.name) }}
                      >
                        {initials(member.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="max-w-[220px] truncate text-[12.9px] font-semibold text-slate-900">
                          {member.name}
                        </div>
                        <div className="mt-0.5 truncate text-[11.5px] text-slate-500">{member.email}</div>
                        <div className="mt-0.5 text-[11px] text-slate-400">{member.memberCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="border-b border-slate-100 px-3.5 py-3.5">
                    <span className="inline-block rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11.5px] font-medium text-slate-600">
                      {member.category}
                    </span>
                  </td>
                  <td className="border-b border-slate-100 px-3.5 py-3.5 text-[12.5px] text-slate-600">
                    {formatDisplayDate(member.joinDate)}
                  </td>
                  <td className="border-b border-slate-100 px-3.5 py-3.5 text-[12.5px] text-slate-600">
                    {activityFor(member).activeLoans} buku
                  </td>
                  <td className="border-b border-slate-100 px-3.5 py-3.5 text-[12.5px]">
                    {activityFor(member).completedLoans || <span className="text-slate-400">Tidak ada</span>}
                  </td>
                  <td className="border-b border-slate-100 px-3.5 py-3.5">
                    <span
                      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${memberStatusBadgeClass(
                        member.status
                      )}`}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td className="border-b border-slate-100 px-4 py-3.5 text-right">
                    <MemberActionsMenu
                      isBlocked={member.status === 'Diblokir'}
                      onDetail={() => setDetailMember(member)}
                      onActivity={() => showToast(`${activityFor(member).activeLoans} aktif, ${activityFor(member).completedLoans} transaksi selesai.`)}
                      onToggleBlock={() => toggleMemberStatus(member)}
                    />
                  </td>
                </tr>
              ))}

              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center">
                    <div className="text-[14px] font-semibold text-slate-700">{members.length ? 'Tidak ada anggota yang cocok' : 'Belum ada anggota'}</div>
                    <div className="mt-1 text-[13px] text-slate-400">{members.length ? 'Ubah pencarian atau filter untuk melihat anggota lainnya.' : 'Anggota yang melakukan registrasi akan muncul secara otomatis di halaman ini.'}</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5">
          <span className="text-[12px] text-slate-500">
            Menampilkan {filteredMembers.length} dari {members.length} anggota
          </span>
          <div className="flex items-center gap-1.5">
            <PageButton disabled>‹ Prev</PageButton>
            <PageButton active>1</PageButton>
            <PageButton>Next ›</PageButton>
          </div>
        </div>
      </div>

      <MemberDetailModal member={detailMember} activity={detailMember ? activityFor(detailMember) : null} onClose={() => setDetailMember(null)} />

      <Toast message={toast} />
    </div>
  )
}

function Th({ children, align = 'left' }) {
  return (
    <th
      className={`border-y border-slate-100 px-3.5 py-3 text-[11.5px] font-bold uppercase tracking-wide text-slate-500 ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
    >
      {children}
    </th>
  )
}

function FilterSelect({ value, onChange, options, allLabel }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-[9px] border border-slate-200 bg-white py-2.5 pl-3 pr-9 text-[12.8px] font-medium text-slate-700 outline-none focus:border-emerald-500"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt === ALL ? allLabel : opt}
          </option>
        ))}
      </select>
      <IconChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
    </div>
  )
}

function PageButton({ children, active, disabled }) {
  return (
    <button
      disabled={disabled}
      className={`rounded-[8px] px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
        active
          ? 'bg-emerald-600 text-white'
          : disabled
          ? 'cursor-not-allowed text-slate-300'
          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  )
}

function MemberActionsMenu({ isBlocked, onDetail, onActivity, onToggleBlock }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function pick(fn) {
    setOpen(false)
    fn?.()
  }

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
      >
        <IconMoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-20 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg">
          <button
            type="button"
            onClick={() => pick(onDetail)}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[12.8px] text-slate-700 hover:bg-slate-50"
          >
            <IconEye className="h-4 w-4 text-slate-400" />
            Detail
          </button>
          <button
            type="button"
            onClick={() => pick(onActivity)}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[12.8px] text-slate-700 hover:bg-slate-50"
          >
            <IconClock className="h-4 w-4 text-slate-400" />
            Lihat Aktivitas
          </button>
          <button
            type="button"
            onClick={() => pick(onToggleBlock)}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[12.8px] text-slate-700 hover:bg-slate-50"
          >
            <IconLock className="h-4 w-4 text-slate-400" />
            {isBlocked ? 'Aktifkan Kembali' : 'Blokir Anggota'}
          </button>
        </div>
      )}
    </div>
  )
}

function MemberDetailModal({ member, activity, onClose }) {
  if (!member || !activity) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-5" onClick={onClose}>
      <div className="w-full max-w-[560px] rounded-2xl bg-white shadow-xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <div className="text-[17px] font-bold text-slate-900">Detail Anggota</div>
            <div className="mt-0.5 text-[12.5px] text-slate-500">Profil dan riwayat aktivitas anggota.</div>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200">×</button>
        </div>
        <div className="px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full text-[13px] font-bold text-white" style={{ backgroundColor: hashColor(member.name) }}>
              {initials(member.name)}
            </div>
            <div>
              <div className="text-[15px] font-bold text-slate-900">{member.name}</div>
              <div className="text-[12px] text-slate-500">{member.email} · {member.memberCode}</div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-[12.5px]">
            <DetailItem label="Kategori" value={member.category} />
            <DetailItem label="Tanggal Bergabung" value={formatDisplayDate(member.joinDate)} />
            <DetailItem label="Status" value={member.status} />
            <DetailItem label="Peminjaman Aktif" value={`${activity.activeLoans} buku`} />
            <DetailItem label="Transaksi Selesai" value={`${activity.completedLoans} transaksi`} />
            <DetailItem label="Riwayat Transaksi" value={`${activity.loans.length} transaksi`} />
          </div>
          <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="text-[12px] font-semibold text-slate-700">Buku yang sedang dipinjam</div>
            <div className="mt-2 space-y-1.5 text-[12px] text-slate-500">
              {activity.loans.filter((loan) => loan.status === 'Dipinjam').map((loan) => <div key={loan.id}>{loan.bookTitle}</div>)}
              {activity.activeLoans === 0 && <div>Tidak ada peminjaman aktif.</div>}
            </div>
          </div>
        </div>
        <div className="flex justify-end border-t border-slate-100 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-[9px] border border-slate-200 px-4 py-2.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50">Tutup</button>
        </div>
      </div>
    </div>
  )
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
      <div className="text-[11px] text-slate-400">{label}</div>
      <div className="mt-0.5 font-semibold text-slate-700">{value}</div>
    </div>
  )
}
