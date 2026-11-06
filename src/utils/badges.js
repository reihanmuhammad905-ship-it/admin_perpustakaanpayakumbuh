export function formatBadgeClass(format) {
  if (format === 'Digital / E-Book') return 'bg-sky-50 text-sky-700 border border-sky-200'
  if (format === 'Hybrid') return 'bg-indigo-50 text-indigo-700 border border-indigo-200'
  return 'bg-slate-100 text-slate-600 border border-slate-200'
}

export function accessBadgeClass(accessStatus) {
  if (accessStatus === 'Stok Habis') return 'bg-rose-50 text-rose-700 border border-rose-200'
  return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
}

export function memberStatusBadgeClass(status) {
  if (status === 'Aktif') return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
  if (status === 'Nonaktif') return 'bg-slate-100 text-slate-600 border border-slate-200'
  return 'bg-rose-50 text-rose-700 border border-rose-200'
}

export function loanStatusBadgeClass(status) {
  if (status === 'Dikembalikan') return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
  if (status === 'Berakhir Otomatis') return 'bg-amber-50 text-amber-700 border border-amber-200'
  return 'bg-sky-50 text-sky-700 border border-sky-200'
}
