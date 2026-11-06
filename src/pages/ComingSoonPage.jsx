import HeaderUtilities from '../components/HeaderUtilities'

export default function ComingSoonPage({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex-1 overflow-y-auto px-8 py-[26px] pb-12">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="font-sans text-[25px] font-bold text-slate-900">{title}</h1>
          <p className="mt-1.5 text-[13.5px] text-slate-500">{subtitle}</p>
        </div>
        <HeaderUtilities hasAlerts={false} />
      </div>

      <div className="mt-5 flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <Icon className="h-7 w-7" />
        </div>
        <div className="mt-4 inline-block rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11.5px] font-semibold text-amber-700">
          Segera Hadir
        </div>
        <h2 className="mt-3 text-[16px] font-bold text-slate-900">Halaman {title} sedang dalam pengembangan</h2>
        <p className="mt-1.5 max-w-md text-[13px] text-slate-500">
          Fitur ini akan segera tersedia. Modul {title.toLowerCase()} untuk sistem admin perpustakaan sedang disiapkan.
        </p>
      </div>
    </div>
  )
}
