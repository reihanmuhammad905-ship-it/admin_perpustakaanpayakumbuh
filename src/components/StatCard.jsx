import { Link } from 'react-router-dom'

export default function StatCard({
  icon: Icon,
  iconBgClass,
  iconColorClass,
  value,
  label,
  sub,
  subColor = 'text-slate-400',
  to,
  onClick,
  detailLabel = 'Lihat detail →',
}) {
  const cardContent = (
    <>
      <div className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${iconBgClass}`}>
        <Icon className={`h-5 w-5 ${iconColorClass}`} />
      </div>
      <div className="mt-3.5 font-sans text-2xl font-bold text-slate-900">{value}</div>
      <div className="mt-0.5 text-[12.5px] text-slate-500">{label}</div>
      {sub && <div className={`mt-2 text-[11.5px] font-medium ${subColor}`}>{sub}</div>}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
        <span className="text-[11px] font-medium text-slate-400">Klik untuk melihat detail</span>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">{detailLabel}</span>
      </div>
    </>
  )

  const className =
    'block cursor-pointer rounded-xl border border-slate-200 bg-white p-[18px] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-200'

  if (to) {
    return (
      <Link to={to} className={className}>
        {cardContent}
      </Link>
    )
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${className} text-left`}>
        {cardContent}
      </button>
    )
  }

  return <div className={className}>{cardContent}</div>
}
