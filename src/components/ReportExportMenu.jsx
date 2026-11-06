import { useEffect, useRef, useState } from 'react'
import { IconChevronDown, IconDownload, IconFileText, IconPrinter } from '../icons/Icons'
import { downloadReportExcel, downloadReportPdf } from '../utils/reportExport'

export default function ReportExportMenu({ report, rangeLabel, onExported }) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(null)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false)
    }
    function handleEscape(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  async function runExport(kind, action, successMessage) {
    setOpen(false)
    setPending(kind)
    try {
      // Biarkan browser me-render spinner sebelum kerja generate file yang sinkron dan berat dimulai.
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
      await action()
      onExported?.(successMessage)
    } catch {
      onExported?.('Gagal mengunduh laporan. Silakan coba lagi.')
    } finally {
      setPending(null)
    }
  }

  function handlePrint() {
    setOpen(false)
    window.print()
  }

  const busy = pending !== null

  return (
    <div className="relative inline-block print:hidden" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={busy}
        className="flex items-center gap-2 rounded-[10px] bg-emerald-600 px-4 py-2.5 text-[12.5px] font-bold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {busy
          ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          : <IconDownload className="h-4 w-4" />}
        {busy ? 'Menyiapkan...' : 'Unduh Laporan'}
        <IconChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-20 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg">
          <button
            type="button"
            onClick={() => runExport('pdf', () => downloadReportPdf(report, rangeLabel), 'Laporan berhasil diunduh sebagai PDF.')}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[12.8px] text-slate-700 hover:bg-slate-50"
          >
            <IconFileText className="h-4 w-4 text-rose-500" />
            Unduh sebagai PDF
          </button>
          <button
            type="button"
            onClick={() => runExport('xlsx', () => downloadReportExcel(report, rangeLabel), 'Laporan berhasil diunduh sebagai Excel.')}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[12.8px] text-slate-700 hover:bg-slate-50"
          >
            <IconFileText className="h-4 w-4 text-emerald-600" />
            Unduh sebagai Excel (.xlsx)
          </button>
          <div className="my-1.5 border-t border-slate-100" />
          <button
            type="button"
            onClick={handlePrint}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[12.8px] text-slate-700 hover:bg-slate-50"
          >
            <IconPrinter className="h-4 w-4 text-slate-400" />
            Cetak Laporan
          </button>
        </div>
      )}
    </div>
  )
}
