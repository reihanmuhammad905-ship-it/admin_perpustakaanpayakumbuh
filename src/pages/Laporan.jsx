import { useEffect, useRef, useState } from 'react'
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import HeaderUtilities from '../components/HeaderUtilities'
import ReportExportMenu from '../components/ReportExportMenu'
import Toast from '../components/Toast'
import { useAuth } from '../context/AuthContext.jsx'
import { getAdminReports } from '../services/adminApi'
import { IconAlertTriangle, IconArrowDown, IconArrowUp, IconBarChart, IconBook, IconCheckCircle, IconClock, IconExchange, IconUserCircle, IconUsers } from '../icons/Icons'

const ranges = [
  { value: 'week', label: 'Minggu Ini' },
  { value: 'month', label: 'Bulan Ini' },
  { value: 'quarter', label: '3 Bulan Terakhir' },
  { value: 'year', label: 'Tahun Ini' },
  { value: 'custom', label: 'Custom' },
]

const toneClasses = {
  emerald: { icon: 'bg-emerald-50 text-emerald-700', accent: 'text-emerald-600' },
  blue: { icon: 'bg-sky-50 text-sky-700', accent: 'text-sky-600' },
  amber: { icon: 'bg-amber-50 text-amber-700', accent: 'text-amber-600' },
  red: { icon: 'bg-rose-50 text-rose-700', accent: 'text-rose-600' },
}

const cardIcons = [IconBook, IconBarChart, IconUsers, IconAlertTriangle]

export default function Laporan() {
  const { token } = useAuth()
  const [range, setRange] = useState('month')
  const [report, setReport] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [activeCategory, setActiveCategory] = useState(null)
  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)

  useEffect(() => {
    setLoadError('')
    getAdminReports(token, range)
      .then((result) => setReport(result.report))
      .catch((error) => setLoadError(error.message))
  }, [range, token])

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  function showToast(message) {
    clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = setTimeout(() => setToast(''), 2800)
  }

  if (loadError) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-3 text-center">
        <p className="max-w-sm text-[13px] text-slate-500">{loadError}</p>
      </div>
    )
  }

  if (!report) return <LoadingState />

  const rangeLabel = ranges.find((item) => item.value === range)?.label || range
  const printedOn = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="flex-1 overflow-y-auto px-8 py-[26px] pb-12 print:h-auto print:overflow-visible print:px-0 print:py-0">
      <div className="hidden items-center justify-between border-b border-slate-300 pb-3 print:mb-5 print:flex">
        <span className="text-[14px] font-bold text-emerald-700">Perpustakaan Payakumbuh</span>
        <span className="text-[11px] text-slate-500">Dicetak pada {printedOn}</span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="font-sans text-[25px] font-bold text-slate-900 print:text-[18px]">Laporan &amp; Analitik</h1>
          <p className="mt-1.5 text-[13.5px] text-slate-500 print:text-[11px]">Pantau performa koleksi, aktivitas peminjaman, dan keterlibatan anggota.</p>
        </div>
        <HeaderUtilities hasAlerts />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <label className="flex items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-3.5 py-2.5 text-[12.5px] font-semibold text-slate-600 shadow-sm">
          <IconClock className="h-4 w-4 text-slate-400" />
          <select value={range} onChange={(event) => setRange(event.target.value)} className="bg-transparent outline-none">
            {ranges.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[12px] text-slate-400"><span className="h-2 w-2 rounded-full bg-emerald-500" />Data diperbarui otomatis</div>
          <ReportExportMenu report={report} rangeLabel={rangeLabel} onExported={showToast} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
        {report.cards.map((card, index) => {
          const Icon = cardIcons[index]
          const tone = toneClasses[card.tone]
          const ChangeIcon = card.direction === 'up' ? IconArrowUp : IconArrowDown
          return (
            <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-[18px] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg print:break-inside-avoid print:shadow-none">
              <div className="flex items-start justify-between gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${tone.icon}`}><Icon className="h-5 w-5" /></div>
                <div className={`flex items-center gap-1 text-[11.5px] font-bold ${card.direction === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  <ChangeIcon className="h-3.5 w-3.5" />{card.change}%
                </div>
              </div>
              <div className="mt-4 text-2xl font-bold text-slate-900">{card.value}</div>
              <div className="mt-0.5 text-[12.5px] text-slate-500">{card.label}</div>
              <div className="mt-2 text-[11px] text-slate-400">vs. periode sebelumnya</div>
            </div>
          )
        })}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-[18px] xl:grid-cols-5">
        <section className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-emerald-50/30 p-5 shadow-sm transition-shadow hover:shadow-md xl:col-span-3 print:break-inside-avoid print:shadow-none print:bg-none">
          <div className="flex items-start justify-between gap-3"><div><h2 className="text-[15px] font-bold text-slate-900">Tren Peminjaman per Bulan</h2><p className="mt-0.5 text-[12px] text-slate-500">Perbandingan peminjaman dan pengembalian 12 bulan terakhir.</p></div><IconBarChart className="h-5 w-5 text-emerald-600" /></div>
          <div className="mt-5 h-[285px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={report.monthlyTrend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} /><Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} /><Line type="monotone" dataKey="loans" name="Peminjaman" stroke="#059669" strokeWidth={3} dot={{ r: 3, fill: '#059669' }} /><Line type="monotone" dataKey="returns" name="Pengembalian" stroke="#0284c7" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div>
        </section>
        <section className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-sky-50/30 p-5 shadow-sm transition-shadow hover:shadow-md xl:col-span-2 print:break-inside-avoid print:shadow-none print:bg-none">
          <h2 className="text-[15px] font-bold text-slate-900">Kategori Buku Terpopuler</h2><p className="mt-0.5 text-[12px] text-slate-500">Distribusi peminjaman berdasarkan kategori.</p>
          <div className="mt-2 h-[220px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={report.categoryDistribution} dataKey="value" nameKey="name" innerRadius={58} outerRadius={84} paddingAngle={3} isAnimationActive animationBegin={120} animationDuration={900}>{report.categoryDistribution.map((entry) => <Cell key={entry.name} fill={entry.color} opacity={activeCategory && activeCategory !== entry.name ? 0.22 : 1} />)}</Pie><Tooltip formatter={(value) => `${value}%`} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} /></PieChart></ResponsiveContainer></div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">{report.categoryDistribution.map((item) => <button type="button" key={item.name} onClick={() => setActiveCategory((current) => current === item.name ? null : item.name)} className={`flex items-center justify-between rounded-md px-1.5 py-1 text-[12px] transition-colors ${activeCategory === item.name ? 'bg-slate-100' : 'hover:bg-slate-50'}`}><span className={`flex items-center gap-2 ${activeCategory && activeCategory !== item.name ? 'text-slate-400' : 'text-slate-600'}`}><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span><span className="font-bold text-slate-800">{item.value}%</span></button>)}</div>
        </section>
      </div>

      <ActivityPanel activities={report.recentActivities} />

      <ReportTable title="Buku Paling Sering Dipinjam" subtitle="10 koleksi dengan frekuensi peminjaman tertinggi." headers={['Peringkat', 'Judul Buku', 'Kategori', 'Jumlah Dipinjam', 'Stok Tersedia']} empty="Belum ada data peminjaman buku.">
        {report.popularBooks.map((book) => <tr key={book.rank} className="transition-colors hover:bg-emerald-50/40"><td className="border-b border-slate-100 px-4 py-3"><Rank rank={book.rank} /></td><td className="border-b border-slate-100 px-4 py-3 text-[12.5px] font-semibold text-slate-800">{book.title}</td><td className="border-b border-slate-100 px-4 py-3 text-[12px] text-slate-500">{book.category}</td><td className="border-b border-slate-100 px-4 py-3 text-[12.5px] font-semibold text-slate-700">{book.borrowed} kali</td><td className="border-b border-slate-100 px-4 py-3 text-[12px] text-slate-500">{book.stock} unit</td></tr>)}
      </ReportTable>

      <ReportTable title="Anggota Paling Aktif" subtitle="Anggota dengan kontribusi aktivitas literasi tertinggi." headers={['Nama', 'Total Peminjaman', 'Buku Sedang Dipinjam', 'Poin Literasi']} empty="Belum ada data aktivitas anggota.">
        {report.activeMembers.map((member, index) => <tr key={member.memberId} className="transition-colors hover:bg-emerald-50/40"><td className="border-b border-slate-100 px-4 py-3"><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-[11px] font-bold text-emerald-700">{index + 1}</div><div><div className="text-[12.5px] font-semibold text-slate-800">{member.name}</div><div className="text-[11px] text-slate-400">{member.memberId}</div></div></div></td><td className="border-b border-slate-100 px-4 py-3 text-[12.5px] font-semibold text-slate-700">{member.total} buku</td><td className="border-b border-slate-100 px-4 py-3 text-[12px] text-slate-500">{member.active} buku</td><td className="border-b border-slate-100 px-4 py-3 text-[12.5px] font-bold text-emerald-700">{member.points} poin</td></tr>)}
      </ReportTable>

      <Toast message={toast} />
    </div>
  )
}

function ReportTable({ title, subtitle, headers, children, empty }) { return <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm print:break-inside-avoid print:shadow-none"><div className="px-5 py-4"><h2 className="text-[15px] font-bold text-slate-900">{title}</h2><p className="mt-0.5 text-[12px] text-slate-500">{subtitle}</p></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] border-collapse"><thead><tr className="bg-slate-50">{headers.map((header) => <th key={header} className="border-y border-slate-100 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">{header}</th>)}</tr></thead><tbody>{children || <tr><td colSpan={headers.length} className="px-4 py-10 text-center"><div className="text-[13px] font-semibold text-slate-700">{empty}</div><div className="mt-1 text-[12px] text-slate-400">Data akan tampil setelah ada aktivitas perpustakaan.</div></td></tr>}</tbody></table></div></section> }
function ActivityPanel({ activities = [] }) { const activityIcons = { borrow: [IconExchange, 'bg-emerald-50 text-emerald-700'], member: [IconUserCircle, 'bg-sky-50 text-sky-700'], return: [IconCheckCircle, 'bg-indigo-50 text-indigo-700'], ended: [IconAlertTriangle, 'bg-amber-50 text-amber-700'] }; return <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm print:break-inside-avoid print:shadow-none"><div className="flex items-start justify-between"><div><h2 className="text-[15px] font-bold text-slate-900">Aktivitas Terbaru</h2><p className="mt-0.5 text-[12px] text-slate-500">Peristiwa terbaru dari aktivitas perpustakaan.</p></div><IconClock className="h-5 w-5 text-slate-300" /></div>{activities.length ? <div className="mt-4 grid gap-2 md:grid-cols-2">{activities.map((activity) => { const [Icon, style] = activityIcons[activity.type] || activityIcons.borrow; return <div key={`${activity.title}-${activity.time}`} className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-slate-50"><div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${style}`}><Icon className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="truncate text-[12.5px] font-medium text-slate-700">{activity.title}</div><div className="mt-0.5 text-[11px] text-slate-400">{activity.time}</div></div></div> })}</div> : <div className="py-8 text-center text-[12px] text-slate-400">Belum ada aktivitas terbaru.</div>}</section> }
function Rank({ rank }) { const styles = rank === 1 ? 'bg-amber-100 text-amber-800' : rank === 2 ? 'bg-slate-200 text-slate-700' : rank === 3 ? 'bg-orange-100 text-orange-800' : 'bg-slate-50 text-slate-500'; return <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${styles}`}>{rank}</span> }
function LoadingState() { return <div className="flex-1 overflow-y-auto px-8 py-[26px] pb-12"><div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" /><div className="mt-6 grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-36 animate-pulse rounded-xl border border-slate-100 bg-slate-200/70" />)}</div><div className="mt-5 grid gap-[18px] xl:grid-cols-5"><div className="h-[350px] animate-pulse rounded-xl bg-slate-200/70 xl:col-span-3" /><div className="h-[350px] animate-pulse rounded-xl bg-slate-200/70 xl:col-span-2" /></div></div> }
