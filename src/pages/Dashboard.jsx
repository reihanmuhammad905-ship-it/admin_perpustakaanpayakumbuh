import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import HeaderUtilities from '../components/HeaderUtilities'
import StatCard from '../components/StatCard'
import { useAuth } from '../context/AuthContext.jsx'
import { getAdminMembers, getAdminBooks, getAdminLoans } from '../services/adminApi'
import {
  IconUsers,
  IconExchange,
  IconAlertTriangle,
  IconClock,
  IconTrendingUp,
  IconBook,
} from '../icons/Icons'

const ACTIVITY_META = {
  peminjaman: { icon: IconExchange, bg: 'bg-emerald-50', color: 'text-emerald-700' },
  pengembalian: { icon: IconBook, bg: 'bg-sky-50', color: 'text-sky-700' },
  anggota: { icon: IconUsers, bg: 'bg-indigo-50', color: 'text-indigo-700' },
  berakhir: { icon: IconAlertTriangle, bg: 'bg-amber-50', color: 'text-amber-700' },
}

const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

function activityTarget(type) {
  return type === 'anggota' ? '/anggota' : '/peminjaman'
}

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function relativeTime(iso) {
  if (!iso) return '-'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '-'
  const now = new Date()
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'Baru saja'
  if (diffMin < 60) return `${diffMin} menit lalu`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24 && sameDay(date, now)) return `${diffHour} jam lalu`
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (sameDay(date, yesterday)) {
    return `Kemarin, ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

function buildTrend(loans, days) {
  const today = startOfDay(new Date())
  const buckets = []
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    buckets.push({ date: d, total: 0 })
  }
  loans.forEach((loan) => {
    const d = new Date(loan.borrowDate)
    if (Number.isNaN(d.getTime())) return
    const bucket = buckets.find((b) => sameDay(b.date, d))
    if (bucket) bucket.total += 1
  })
  return buckets.map((b) => ({
    label: days <= 7 ? DAY_LABELS[b.date.getDay()] : String(b.date.getDate()),
    total: b.total,
  }))
}

function buildRecentActivities(members, loans) {
  const events = []

  loans.forEach((loan) => {
    events.push({
      type: 'peminjaman',
      text: `${loan.memberName} meminjam "${loan.bookTitle}"`,
      time: loan.borrowDate,
    })
    if (loan.status === 'Dikembalikan' && loan.returnDate) {
      events.push({
        type: 'pengembalian',
        text: `${loan.memberName} mengembalikan "${loan.bookTitle}"`,
        time: loan.returnDate,
      })
    }
    if (loan.status === 'Berakhir Otomatis' && loan.returnDate) {
      events.push({
        type: 'berakhir',
        text: `Peminjaman "${loan.bookTitle}" oleh ${loan.memberName} berakhir otomatis`,
        time: loan.returnDate,
      })
    }
  })

  members.forEach((member) => {
    events.push({
      type: 'anggota',
      text: `Anggota baru terdaftar: ${member.name}`,
      time: member.joinDate,
    })
  })

  return events
    .filter((e) => e.time)
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 8)
    .map((e, i) => ({ ...e, id: i, time: relativeTime(e.time) }))
}

export default function Dashboard() {
  const { token } = useAuth()
  const [period, setPeriod] = useState('7')
  const [members, setMembers] = useState([])
  const [books, setBooks] = useState([])
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      setLoadError('')
      try {
        const [membersResult, booksResult, loansResult] = await Promise.all([
          getAdminMembers(token),
          getAdminBooks(token),
          getAdminLoans(token),
        ])
        setMembers(membersResult.members || [])
        setBooks(booksResult.books || [])
        setLoans(loansResult.loans || [])
      } catch (error) {
        setLoadError(error.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [token])

  if (loading) return <LoadingState />

  if (loadError) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-3 text-center">
        <p className="max-w-sm text-[13px] text-slate-500">{loadError}</p>
      </div>
    )
  }

  const today = new Date()
  const trendData = buildTrend(loans, period === '7' ? 7 : 30)
  const totalPeriod = trendData.reduce((acc, d) => acc + d.total, 0)

  const totalAnggota = members.length
  const totalAnggotaBaruBulanIni = members.filter((m) => {
    const d = new Date(m.joinDate)
    return !Number.isNaN(d.getTime()) && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
  }).length
  const totalKoleksiBuku = books.length
  const peminjamanAktif = loans.filter((l) => l.status === 'Dipinjam').length
  const peminjamanHariIni = loans.filter((l) => {
    const d = new Date(l.borrowDate)
    return !Number.isNaN(d.getTime()) && sameDay(d, today)
  }).length
  const berakhirOtomatis = loans.filter((l) => l.status === 'Berakhir Otomatis').length

  const LONG_QUEUE_THRESHOLD = 3
  const attentionBooks = books
    .filter((b) => (b.availableQty ?? 0) <= 0 || Number(b.queueQty ?? 0) >= LONG_QUEUE_THRESHOLD)
    .slice(0, 6)
    .map((b) => {
      const outOfStock = (b.availableQty ?? 0) <= 0
      const queueCount = Number(b.queueQty ?? 0)
      const totalUnit = (b.availableQty ?? 0) + (b.borrowedQty ?? 0)

      if (outOfStock && queueCount > 0) {
        return {
          id: b.id,
          title: b.title,
          author: b.author,
          reason: queueCount >= LONG_QUEUE_THRESHOLD ? 'Antrian Panjang' : 'Stok Habis',
          detail: `0 dari ${totalUnit} unit tersedia • ${queueCount} anggota mengantri`,
        }
      }
      if (outOfStock) {
        return {
          id: b.id,
          title: b.title,
          author: b.author,
          reason: 'Stok Habis',
          detail: `0 dari ${totalUnit} unit tersedia`,
        }
      }
      return {
        id: b.id,
        title: b.title,
        author: b.author,
        reason: 'Antrian Panjang',
        detail: `${queueCount} anggota dalam antrian peminjaman`,
      }
    })

  const recentActivities = buildRecentActivities(members, loans)

  return (
    <div className="flex-1 overflow-y-auto px-8 py-[26px] pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="font-sans text-[25px] font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1.5 text-[13.5px] text-slate-500">
            Ringkasan aktivitas dan kondisi perpustakaan hari ini.
          </p>
        </div>
        <HeaderUtilities hasAlerts />
      </div>

      {/* Stat cards */}
      <div className="mt-5 grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={IconUsers}
          iconBgClass="bg-emerald-50"
          iconColorClass="text-emerald-700"
          value={totalAnggota.toLocaleString('id-ID')}
          label="TOTAL ANGGOTA"
          sub={`+${totalAnggotaBaruBulanIni} anggota baru bulan ini`}
          subColor="text-emerald-600 font-semibold"
          to="/anggota"
        />
        <StatCard
          icon={IconBook}
          iconBgClass="bg-sky-50"
          iconColorClass="text-sky-700"
          value={totalKoleksiBuku.toLocaleString('id-ID')}
          label="TOTAL KOLEKSI BUKU"
          sub="Seluruh judul dalam katalog"
          subColor="text-sky-600 font-semibold"
          to="/buku"
        />
        <StatCard
          icon={IconExchange}
          iconBgClass="bg-indigo-50"
          iconColorClass="text-indigo-700"
          value={peminjamanAktif.toLocaleString('id-ID')}
          label="PEMINJAMAN AKTIF"
          sub={`${peminjamanHariIni} peminjaman hari ini`}
          subColor="text-indigo-600 font-semibold"
          to="/peminjaman"
        />
        <StatCard
          icon={IconAlertTriangle}
          iconBgClass="bg-amber-100"
          iconColorClass="text-amber-700"
          value={berakhirOtomatis.toLocaleString('id-ID')}
          label="BERAKHIR OTOMATIS"
          sub="Masa peminjaman selesai"
          subColor="text-amber-600 font-semibold"
          to="/peminjaman/berakhir-otomatis"
        />
      </div>

      {/* Chart + Aktivitas Terbaru */}
      <div className="mt-5 grid grid-cols-1 gap-[18px] xl:grid-cols-3">
        {/* Grafik tren peminjaman */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-bold text-slate-900">Tren Peminjaman</h2>
              <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-slate-500">
                <IconTrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                {totalPeriod.toLocaleString('id-ID')} transaksi dalam {period} hari terakhir
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <PeriodButton active={period === '7'} onClick={() => setPeriod('7')}>
                7 Hari
              </PeriodButton>
              <PeriodButton active={period === '30'} onClick={() => setPeriod('30')}>
                30 Hari
              </PeriodButton>
            </div>
          </div>

          <div className="mt-5">
            <LoanTrendChart data={trendData} />
          </div>
        </div>

        {/* Aktivitas Terbaru */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-[15px] font-bold text-slate-900">Aktivitas Terbaru</h2>
          <p className="mt-0.5 text-[12px] text-slate-500">Transaksi & perubahan terbaru sistem</p>

          <div className="mt-3 max-h-[360px] overflow-y-auto">
            {recentActivities.map((act) => {
              const meta = ACTIVITY_META[act.type]
              const Icon = meta.icon
              return (
                <Link
                  key={act.id}
                  to={activityTarget(act.type)}
                  className="-mx-2 flex items-start gap-3 rounded-lg border-b border-slate-100 px-2 py-3 transition-colors last:border-b-0 last:pb-0 hover:bg-slate-50"
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${meta.bg}`}>
                    <Icon className={`h-4 w-4 ${meta.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.8px] leading-snug text-slate-700">{act.text}</p>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                      <IconClock className="h-3 w-3" />
                      {act.time}
                    </div>
                  </div>
                </Link>
              )
            })}
            {recentActivities.length === 0 && (
              <div className="py-8 text-center text-[12.5px] text-slate-400">Belum ada aktivitas.</div>
            )}
          </div>
        </div>
      </div>

      {/* Perlu Perhatian */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-amber-100 text-amber-700">
            <IconAlertTriangle className="h-[18px] w-[18px]" />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-slate-900">Perlu Perhatian</h2>
            <p className="mt-0.5 text-[12px] text-slate-500">
              Buku dengan stok kosong atau antrian panjang
            </p>
          </div>
        </div>

        <div className="mt-3">
          {attentionBooks.map((book) => (
            <Link
              key={book.id}
              to="/buku"
              className="-mx-2 flex flex-wrap items-center gap-3 rounded-lg border-b border-slate-100 px-2 py-3 transition-colors last:border-b-0 last:pb-0 hover:bg-slate-50"
            >
              <div className="flex h-11 w-8 shrink-0 items-center justify-center rounded-md bg-slate-700 shadow-sm">
                <IconBook className="h-4 w-4 text-white/85" />
              </div>
              <div className="min-w-[180px] flex-1">
                <div className="truncate text-[12.8px] font-semibold text-slate-900">{book.title}</div>
                <div className="mt-0.5 text-[11.5px] text-slate-500">{book.author}</div>
              </div>
              <div className="min-w-[200px] flex-1 text-[12px] text-slate-500">{book.detail}</div>
              <span
                className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${
                  book.reason === 'Stok Habis'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {book.reason}
              </span>
            </Link>
          ))}
          {attentionBooks.length === 0 && (
            <div className="py-6 text-center text-[12.5px] text-slate-400">Semua buku dalam kondisi baik.</div>
          )}
        </div>
      </div>
    </div>
  )
}

function PeriodButton({ children, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[8px] px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
        active ? 'bg-emerald-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  )
}

function LoanTrendChart({ data }) {
  const width = 600
  const height = 200
  const paddingX = 8
  const paddingTop = 12
  const paddingBottom = 26
  const chartHeight = height - paddingTop - paddingBottom
  const max = Math.max(1, ...data.map((d) => d.total))
  const stepX = data.length > 1 ? (width - paddingX * 2) / (data.length - 1) : 0

  const points = data.map((d, i) => ({
    x: paddingX + i * stepX,
    y: paddingTop + chartHeight - (d.total / max) * chartHeight,
    ...d,
  }))

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const baseline = (height - paddingBottom).toFixed(1)
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${baseline} L ${points[0].x.toFixed(
    1
  )} ${baseline} Z`

  const showDots = data.length <= 10
  const labelStep = Math.max(1, Math.ceil(data.length / 8))

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Grafik tren peminjaman">
      <defs>
        <linearGradient id="loanTrendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#059669" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#059669" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={paddingX}
          x2={width - paddingX}
          y1={paddingTop + chartHeight * t}
          y2={paddingTop + chartHeight * t}
          stroke="#e2e8f0"
          strokeWidth="1"
        />
      ))}

      <path d={areaPath} fill="url(#loanTrendFill)" stroke="none" />
      <path d={linePath} fill="none" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

      {showDots &&
        points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill="#059669" stroke="#fff" strokeWidth="1.4" />)}

      {points.map(
        (p, i) =>
          (i % labelStep === 0 || i === points.length - 1) && (
            <text key={i} x={p.x} y={height - 8} textAnchor="middle" fontSize="9.5" fill="#94a3b8">
              {p.label}
            </text>
          )
      )}
    </svg>
  )
}

function LoadingState() {
  return (
    <div className="flex-1 overflow-y-auto px-8 py-[26px] pb-12">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
      <div className="mt-6 grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-36 animate-pulse rounded-xl border border-slate-100 bg-slate-200/70" />
        ))}
      </div>
      <div className="mt-5 grid gap-[18px] xl:grid-cols-5">
        <div className="h-[350px] animate-pulse rounded-xl bg-slate-200/70 xl:col-span-3" />
        <div className="h-[350px] animate-pulse rounded-xl bg-slate-200/70 xl:col-span-2" />
      </div>
    </div>
  )
}
