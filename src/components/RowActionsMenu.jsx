import { useEffect, useRef, useState } from 'react'
import { IconMoreVertical, IconEye, IconEdit, IconTrash } from '../icons/Icons'

export default function RowActionsMenu({ onDetail, onEdit, onDelete }) {
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
        <div className="absolute right-0 top-[calc(100%+6px)] z-20 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg">
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
            onClick={() => pick(onEdit)}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[12.8px] text-slate-700 hover:bg-slate-50"
          >
            <IconEdit className="h-4 w-4 text-slate-400" />
            Edit Buku
          </button>
          <div className="my-1.5 border-t border-slate-100" />
          <button
            type="button"
            onClick={() => pick(onDelete)}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[12.8px] text-rose-600 hover:bg-rose-50"
          >
            <IconTrash className="h-4 w-4 text-rose-500" />
            Hapus
          </button>
        </div>
      )}
    </div>
  )
}
