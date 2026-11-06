import { useEffect, useMemo, useRef, useState } from 'react'
import HeaderUtilities from '../components/HeaderUtilities'
import StatCard from '../components/StatCard'
import Toast from '../components/Toast'
import { LOAN_STATUSES } from '../data/loans'
import { FORMATS } from '../data/books'
import { formatBadgeClass, loanStatusBadgeClass } from '../utils/badges'
import { useAuth } from '../context/AuthContext.jsx'
import { getAdminLoans, returnLoanAdmin, extendLoanAdmin, API_BASE } from '../services/adminApi'
import {
  IconSearch,
  IconChevronDown,
  IconExchange,
  IconCheckCircle,
  IconClock,
  IconAlertTriangle,
  IconBook,
  IconMoreVertical,
  IconEye,
} from '../icons/Icons'

const ALL = 'Semua'

const COVER_PALETTE = ['#059669', '#0284c7', '#d97706', '#4f46e5', '#db2777', '#0f766e', '#b91c1c']
function hashColor(key) {
  let hash = 0
  const str = String(key || '')
  for (let i = 0; i < str.length; i += 1) hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  return COVER_PALETTE[hash % COVER_PALETTE.length]
}

function formatDisplayDate(iso) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function toDateInputValue(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export default function DataPeminjaman({ overdueOnly = false }) {
  const { token } = useAuth()
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [search, setSearch] = useState('')
  const [filterFormat, setFilterFormat] = useState(ALL)
  const [filterStatus, setFilterStatus] = useState(ALL)
  const [borrowedFrom, setBorrowedFrom] = useState('')
  const [borrowedTo, setBorrowedTo] = useState('')

  const [selectedIds, setSelectedIds] = useState(() => new Set())
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
      const result = await getAdminLoans(token)
      setLoans(result.loans || [])
    } catch (error) {
      setLoadError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // Cek berkala setiap 60 detik - supaya peminjaman yang baru lewat jatuh
    // tempo otomatis kepindah status "Berakhir Otomatis" tanpa perlu refresh manual.
    const refreshTimer = window.setInterval(loadData, 60000)
    return () => window.clearInterval(refreshTimer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleReturn(loan) {
    try {
      await returnLoanAdmin(token, loan.id)
      showToast(`"${loan.bookTitle}" ditandai sudah dikembalikan.`)
      await loadData()
    } catch (error) {
      showToast(error.message)
    }
  }

  async function handleExtend(loan) {
    try {
      await extendLoanAdmin(token, loan.id)
      showToast(`Jatuh tempo "${loan.bookTitle}" diperpanjang 7 hari.`)
      await loadData()
    } catch (error) {
      showToast(error.message)
    }
  }

  const filteredLoans = useMemo(() => {
    const q = search.trim().toLowerCase()
    return loans.filter((l) => {
      if (overdueOnly && l.status !== 'Berakhir Otomatis') return false
      if (q) {
        const hay = `${l.memberName} ${l.bookTitle} ${l.id}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (filterFormat !== ALL && l.format !== filterFormat) return false
      if (filterStatus !== ALL && l.status !== filterStatus) return false
      if (borrowedFrom && toDateInputValue(l.borrowDate) < borrowedFrom) return false
      if (borrowedTo && toDateInputValue(l.borrowDate) > borrowedTo) return false
      return true
    })
  }, [loans, search, filterFormat, filterStatus, borrowedFrom, borrowedTo, overdueOnly])

  const allSelected = filteredLoans.length > 0 && filteredLoans.every((l) => selectedIds.has(l.id))

  function toggleSelectAll() {
    setSelectedIds(allSelected ? new Set() : new Set(filteredLoans.map((l) => l.id)))
  }

  function toggleSelectOne(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const totalAktif = loans.filter((l) => l.status === 'Dipinjam').length
  const totalDikembalikan = loans.filter((l) => l.status === 'Dikembalikan').length
  const totalBerakhirOtomatis = loans.filter((l) => l.status === 'Berakhir Otomatis').length

  if (loading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center text-[13px] text-slate-400">
        Memuat data peminjaman...
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
          <div className="mb-2 flex items-center gap-2 text-[11.5px] font-medium text-slate-500">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-600 hover:bg-slate-50"
            >
              ← Dashboard
            </button>
            <span>/</span>
            <span>{overdueOnly ? 'Berakhir Otomatis' : 'Data Peminjaman'}</span>
          </div>
          <h1 className="font-sans text-[25px] font-bold text-slate-900">
            {overdueOnly ? 'Berakhir Otomatis' : 'Data Peminjaman'}
          </h1>
          <p className="mt-1.5 text-[13.5px] text-slate-500">
            {overdueOnly
              ? 'Daftar buku yang melewati batas waktu pengembalian dan tidak dapat dipinjam kembali sampai ditangani sesuai aturan.'
              : 'Pantau dan kelola seluruh aktivitas peminjaman, pengembalian, dan masa peminjaman buku secara otomatis.'}
          </p>
        </div>
        <HeaderUtilities hasAlerts />
      </div>

      {overdueOnly && (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12.5px] text-rose-700">
          Transaksi yang melewati batas waktu telah diselesaikan otomatis dan bukunya tersedia kembali sesuai aturan sistem perpustakaan.
        </div>
      )}

      {/* Summary cards */}
      <div className="mt-5 grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={IconExchange}
          iconBgClass="bg-emerald-50"
          iconColorClass="text-emerald-700"
          value={totalAktif.toLocaleString('id-ID')}
          label="Peminjaman Aktif"
          sub="Buku masih dipinjam"
          to="/peminjaman"
        />
        <StatCard
          icon={IconCheckCircle}
          iconBgClass="bg-sky-50"
          iconColorClass="text-sky-700"
          value={totalDikembalikan.toLocaleString('id-ID')}
          label="Pengembalian Tercatat"
          sub="Transaksi selesai"
          subColor="text-emerald-600 font-semibold"
          to="/peminjaman"
        />
        <StatCard
          icon={IconClock}
          iconBgClass="bg-amber-100"
          iconColorClass="text-amber-700"
          value={totalBerakhirOtomatis.toLocaleString('id-ID')}
          label="Berakhir Otomatis"
          sub="Masa peminjaman telah selesai"
          subColor="text-amber-600 font-semibold"
          to="/peminjaman/berakhir-otomatis"
        />
        <StatCard
          icon={IconAlertTriangle}
          iconBgClass="bg-rose-50"
          iconColorClass="text-rose-700"
          value={loans.length.toLocaleString('id-ID')}
          label="Total Transaksi"
          sub="Seluruh transaksi dari aktivitas user"
          subColor="text-rose-600 font-semibold"
          to={overdueOnly ? '/peminjaman/berakhir-otomatis' : '/peminjaman'}
        />
      </div>

      {/* Search & filter bar */}
      <div className="mt-5 flex flex-wrap items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-[9px] border border-slate-200 bg-slate-50 px-3 py-2.5">
          <IconSearch className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama peminjam, judul buku, No. Transaksi..."
            className="w-full border-none bg-transparent text-[13px] text-slate-800 outline-none placeholder:text-slate-400"
          />
        </div>

        <FilterSelect
          value={filterFormat}
          onChange={setFilterFormat}
          options={[ALL, ...FORMATS]}
          allLabel="Semua Format"
        />
        <FilterSelect
          value={filterStatus}
          onChange={setFilterStatus}
          options={[ALL, ...LOAN_STATUSES]}
          allLabel="Semua Status"
        />
        <DateFilter label="Dari" value={borrowedFrom} onChange={setBorrowedFrom} />
        <DateFilter label="Sampai" value={borrowedTo} onChange={setBorrowedTo} />
      </div>

      {/* Table */}
      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] border-collapse">
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
                <Th>No. Transaksi</Th>
                <Th>Buku</Th>
                <Th>Peminjam</Th>
                <Th>Tanggal Pinjam</Th>
                <Th>Jatuh Tempo</Th>
                <Th>Tanggal Selesai</Th>
                <Th>Status</Th>
                <Th align="right">Aksi</Th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.map((loan) => (
                <tr key={loan.id} className="hover:bg-slate-50/70">
                  <td className="border-b border-slate-100 px-4 py-3.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(loan.id)}
                      onChange={() => toggleSelectOne(loan.id)}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="border-b border-slate-100 px-3.5 py-3.5 text-[12.5px] font-semibold text-slate-700">
                    TRX-{loan.id}
                  </td>
                  <td className="border-b border-slate-100 px-3.5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-11 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md shadow-sm"
                        style={{ backgroundColor: hashColor(loan.bookTitle) }}
                      >
                        {loan.coverUrl ? (
                          <img src={`${API_BASE}${loan.coverUrl}`} alt={loan.bookTitle} className="h-full w-full object-cover" />
                        ) : (
                          <IconBook className="h-4 w-4 text-white/85" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="max-w-[200px] truncate text-[12.9px] font-semibold text-slate-900">
                          {loan.bookTitle}
                        </div>
                        <span
                          className={`mt-0.5 inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${formatBadgeClass(
                            loan.format
                          )}`}
                        >
                          {loan.format}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="border-b border-slate-100 px-3.5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                        style={{ backgroundColor: hashColor(loan.memberName) }}
                      >
                        {(loan.memberName || '-')
                          .split(' ')
                          .slice(0, 2)
                          .map((w) => w[0])
                          .join('')
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="max-w-[150px] truncate text-[12.5px] font-semibold text-slate-800">
                          {loan.memberName}
                        </div>
                        <div className="text-[11px] text-slate-400">{loan.memberCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="border-b border-slate-100 px-3.5 py-3.5 text-[12.5px] text-slate-600">
                    {formatDisplayDate(loan.borrowDate)}
                  </td>
                  <td className="border-b border-slate-100 px-3.5 py-3.5 text-[12.5px] text-slate-600">
                    {formatDisplayDate(loan.dueDate)}
                  </td>
                  <td className="border-b border-slate-100 px-3.5 py-3.5 text-[12.5px] text-slate-600">
                    {formatDisplayDate(loan.returnDate) || <span className="text-slate-400">Belum selesai</span>}
                  </td>
                  <td className="border-b border-slate-100 px-3.5 py-3.5">
                    <span
                      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${loanStatusBadgeClass(
                        loan.status
                      )}`}
                    >
                      {loan.status}
                    </span>
                  </td>
                  <td className="border-b border-slate-100 px-4 py-3.5 text-right">
                    <LoanActionsMenu
                      isReturned={loan.status !== 'Dipinjam'}
                      onDetail={() => showToast(`Menampilkan detail transaksi "TRX-${loan.id}".`)}
                      onReturn={() => handleReturn(loan)}
                      onExtend={() => handleExtend(loan)}
                    />
                  </td>
                </tr>
              ))}

              {filteredLoans.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-14 text-center">
                    <div className="text-[14px] font-semibold text-slate-700">
                      {loans.length === 0 ? 'Belum ada transaksi peminjaman' : 'Tidak ada transaksi yang cocok'}
                    </div>
                    <div className="mt-1 text-[13px] text-slate-400">
                      {loans.length === 0
                        ? 'Transaksi peminjaman dari pengguna akan muncul secara otomatis di halaman ini.'
                        : 'Ubah pencarian atau filter untuk melihat transaksi lainnya.'}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5">
          <span className="text-[12px] text-slate-500">
            Menampilkan {filteredLoans.length} dari {loans.length} transaksi
          </span>
          <div className="flex items-center gap-1.5">
            <PageButton disabled>‹ Prev</PageButton>
            <PageButton active>1</PageButton>
            <PageButton>Next ›</PageButton>
          </div>
        </div>
      </div>

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

function DateFilter({ label, value, onChange }) {
  return (
    <label className="flex items-center gap-2 rounded-[9px] border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium text-slate-500">
      {label}
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="bg-transparent text-[12px] text-slate-700 outline-none"
      />
    </label>
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

function LoanActionsMenu({ isReturned, onDetail, onExtend, onReturn }) {
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
        <div className="absolute right-0 top-[calc(100%+6px)] z-20 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg">
          <button
            type="button"
            onClick={() => pick(onDetail)}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[12.8px] text-slate-700 hover:bg-slate-50"
          >
            <IconEye className="h-4 w-4 text-slate-400" />
            Detail Transaksi
          </button>
          {!isReturned && (
            <>
              <button
                type="button"
                onClick={() => pick(onExtend)}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[12.8px] text-slate-700 hover:bg-slate-50"
              >
                <IconClock className="h-4 w-4 text-slate-400" />
                Perpanjang Waktu
              </button>
              <div className="my-1.5 border-t border-slate-100" />
              <button
                type="button"
                onClick={() => pick(onReturn)}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[12.8px] text-emerald-700 hover:bg-emerald-50"
              >
                <IconCheckCircle className="h-4 w-4 text-emerald-600" />
                Tandai Dikembalikan
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
